"""Authentication: email+password (bcrypt) and OAuth (GitHub / Google / Apple).

Flow for OAuth:
  GET /auth/oauth/{provider}/start    → 302 to the provider's consent screen
  GET /auth/oauth/{provider}/callback → exchange code, upsert user,
                                        302 to {frontend}/auth/callback#token=<jwt>
The token travels in the URL fragment (never sent to servers / logged).
"""

import secrets
import time
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx
import jwt as pyjwt
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.api.v1.settings import get_flags
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


def _is_admin_email(email: str) -> bool:
    """Emails listed in AEOS_ADMIN_EMAILS get the admin role on sign-in/up."""
    return email.lower() in {e.strip().lower() for e in get_settings().admin_emails}


def _sync_admin(user: User, db: Session) -> None:
    """Promote an existing account whose email was later added to admin_emails."""
    if _is_admin_email(user.email) and not user.is_admin:
        user.is_admin = True
        db.commit()
        db.refresh(user)


# ---------- Schemas ----------

class RegisterIn(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=120)
    # bcrypt only reads the first 72 bytes — enforce, don't truncate silently
    password: str = Field(min_length=8, max_length=72)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    provider: str
    is_admin: bool = False

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Email + password ----------

@router.post("/register", response_model=TokenOut, status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    email = body.email.lower()
    # Admin emails can always register — otherwise disabling sign-ups before
    # the first admin account exists would lock everyone out.
    if not get_flags(db)["signup_enabled"] and not _is_admin_email(email):
        raise HTTPException(status_code=403, detail="Sign-ups are currently disabled")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user = User(email=email, name=body.name.strip(), password_hash=hash_password(body.password),
                is_admin=_is_admin_email(email))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    # Same error for "no user" and "bad password" — don't leak which emails exist.
    if user is None or user.password_hash is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    _sync_admin(user, db)
    return TokenOut(access_token=create_access_token(user.id), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)


# ---------- OAuth ----------

# In-memory state store (CSRF protection). Phase 2: move to Redis.
_pending_states: dict[str, float] = {}
_STATE_TTL = 600  # seconds


def _issue_state() -> str:
    now = time.time()
    for s, ts in list(_pending_states.items()):  # opportunistic cleanup
        if now - ts > _STATE_TTL:
            _pending_states.pop(s, None)
    state = secrets.token_urlsafe(24)
    _pending_states[state] = now
    return state


def _check_state(state: str | None) -> None:
    if not state or _pending_states.pop(state, None) is None:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth state")


def _redirect_uri(request: Request, provider: str) -> str:
    return str(request.url_for("oauth_callback", provider=provider))


def _apple_client_secret() -> str:
    """Apple requires the client secret to be a short-lived ES256 JWT
    signed with your .p8 key (not a static string like GitHub/Google)."""
    s = get_settings()
    now = int(time.time())
    return pyjwt.encode(
        {"iss": s.apple_team_id, "iat": now, "exp": now + 600,
         "aud": "https://appleid.apple.com", "sub": s.apple_client_id},
        s.apple_private_key,
        algorithm="ES256",
        headers={"kid": s.apple_key_id},
    )


def _provider_config(provider: str) -> dict:
    s = get_settings()
    cfg = {
        "github": {
            "enabled": bool(s.github_client_id and s.github_client_secret),
            "authorize": "https://github.com/login/oauth/authorize",
            "token": "https://github.com/login/oauth/access_token",
            "client_id": s.github_client_id,
            "client_secret": s.github_client_secret,
            "scope": "read:user user:email",
        },
        "google": {
            "enabled": bool(s.google_client_id and s.google_client_secret),
            "authorize": "https://accounts.google.com/o/oauth2/v2/auth",
            "token": "https://oauth2.googleapis.com/token",
            "client_id": s.google_client_id,
            "client_secret": s.google_client_secret,
            "scope": "openid email profile",
        },
        "apple": {
            "enabled": bool(s.apple_client_id and s.apple_team_id
                            and s.apple_key_id and s.apple_private_key),
            "authorize": "https://appleid.apple.com/auth/authorize",
            "token": "https://appleid.apple.com/auth/token",
            "client_id": s.apple_client_id,
            "client_secret": None,  # generated per-request (ES256 JWT)
            "scope": "name email",
        },
    }.get(provider)
    if cfg is None:
        raise HTTPException(status_code=404, detail=f"Unknown provider '{provider}'")
    if not cfg["enabled"]:
        raise HTTPException(
            status_code=503,
            detail=f"{provider} sign-in is not configured on this server "
                   f"(set the AEOS_{provider.upper()}_* environment variables)",
        )
    return cfg


@router.get("/oauth/{provider}/start")
def oauth_start(provider: str, request: Request) -> RedirectResponse:
    cfg = _provider_config(provider)
    params = {
        "client_id": cfg["client_id"],
        "redirect_uri": _redirect_uri(request, provider),
        "scope": cfg["scope"],
        "state": _issue_state(),
    }
    if provider == "google":
        params |= {"response_type": "code", "access_type": "offline"}
    if provider == "apple":
        params |= {"response_type": "code", "response_mode": "query"}
    return RedirectResponse(f"{cfg['authorize']}?{urlencode(params)}")


async def _exchange_and_identify(provider: str, cfg: dict, code: str, redirect_uri: str) -> tuple[str, str, str]:
    """Exchange the code, return (provider_user_id, email, name)."""
    data = {
        "client_id": cfg["client_id"],
        "client_secret": _apple_client_secret() if provider == "apple" else cfg["client_secret"],
        "code": code,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient(timeout=15) as client:
        tok = (await client.post(cfg["token"], data=data, headers={"Accept": "application/json"})).json()

        if provider == "github":
            access = tok.get("access_token")
            if not access:
                raise HTTPException(status_code=401, detail="GitHub token exchange failed")
            h = {"Authorization": f"Bearer {access}", "Accept": "application/vnd.github+json"}
            u = (await client.get("https://api.github.com/user", headers=h)).json()
            email = u.get("email")
            if not email:  # primary email may be private — ask the emails endpoint
                emails = (await client.get("https://api.github.com/user/emails", headers=h)).json()
                primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                email = primary["email"] if primary else None
            if not email:
                raise HTTPException(status_code=400, detail="GitHub account has no verified email")
            return str(u["id"]), email, u.get("name") or u.get("login") or "GitHub user"

        # Google and Apple return an OIDC id_token containing the identity.
        id_token = tok.get("id_token")
        if not id_token:
            raise HTTPException(status_code=401, detail=f"{provider} token exchange failed")
        # Signature verification of provider JWKS is a phase-2 hardening item;
        # the token was just received directly from the provider over TLS.
        claims = pyjwt.decode(id_token, options={"verify_signature": False},
                              audience=cfg["client_id"])
        email = claims.get("email")
        if not email:
            raise HTTPException(status_code=400, detail=f"{provider} did not return an email")
        name = claims.get("name") or email.split("@")[0]
        return str(claims["sub"]), email, name


@router.get("/oauth/{provider}/callback", name="oauth_callback")
async def oauth_callback(
    provider: str,
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
) -> RedirectResponse:
    settings = get_settings()
    if error or not code:
        return RedirectResponse(f"{settings.frontend_url}/auth?error={error or 'cancelled'}")
    _check_state(state)

    cfg = _provider_config(provider)
    pid, email, name = await _exchange_and_identify(provider, cfg, code, _redirect_uri(request, provider))
    email = email.lower()

    user = db.scalar(select(User).where(User.provider == provider, User.provider_id == pid))
    if user is None:
        user = db.scalar(select(User).where(User.email == email))
        if user is None:  # brand-new account
            if not get_flags(db)["signup_enabled"] and not _is_admin_email(email):
                return RedirectResponse(f"{settings.frontend_url}/auth?error=signups_disabled")
            user = User(email=email, name=name, provider=provider, provider_id=pid,
                        is_admin=_is_admin_email(email),
                        created_at=datetime.now(timezone.utc))
            db.add(user)
        else:  # existing local account — link the OAuth identity
            user.provider, user.provider_id = provider, pid
        db.commit()
        db.refresh(user)
    _sync_admin(user, db)

    token = create_access_token(user.id)
    return RedirectResponse(f"{settings.frontend_url}/auth/callback#token={token}")
