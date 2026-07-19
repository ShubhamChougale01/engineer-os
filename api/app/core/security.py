"""Password hashing (bcrypt) and JWT issuance/verification.

Security notes:
- Passwords are hashed with bcrypt (per-password salt, cost factor 12).
  Plaintext passwords are never stored or logged.
- bcrypt ignores bytes beyond 72; we pre-hash nothing but enforce a sane
  max length at the schema layer instead of silently truncating.
- JWTs are signed HS256 with AEOS_JWT_SECRET and carry sub (user id) + exp.
"""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db

_bearer = HTTPBearer(auto_error=False)


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: int) -> str:
    settings = get_settings()
    payload = {
        "sub": str(user_id),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expiry_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> int:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
):
    """FastAPI dependency: resolve the Bearer token to a User row."""
    from app.models.user import User

    if creds is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.get(User, decode_token(creds.credentials))
    if user is None:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user


def require_admin(user=Depends(get_current_user)):
    """FastAPI dependency: like get_current_user, but 403 for non-admins."""
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
