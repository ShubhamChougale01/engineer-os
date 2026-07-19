"""Unique visitor counter.

Design:
- The visitor is identified by an HttpOnly cookie carrying a UUID. HttpOnly
  means page JavaScript can never read or forge it; it rides along
  automatically on fetch(..., credentials="include").
- POST /visitors/register is IDEMPOTENT per cookie:
    * no cookie / unknown UUID  -> INSERT visitor, set cookie, return count
    * known UUID                -> return count unchanged (refresh-safe)
- Race safety: the UNIQUE constraint on visitor_uuid is the arbiter. If two
  concurrent requests insert the same UUID, the database admits exactly one;
  the loser's IntegrityError is caught and treated as already-registered.
  Counting is a plain COUNT(*) after the write settles, so the returned
  total is always consistent with the table.
- The cookie value is validated as a real UUID before it ever touches the
  database — garbage cookies are replaced, not trusted.
"""

import uuid as uuidlib

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.models.visitor import Visitor

router = APIRouter(prefix="/visitors", tags=["visitors"])

COOKIE_NAME = "aeos_vid"
COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2  # 2 years


class CountOut(BaseModel):
    count: int


def _valid_uuid(value: str | None) -> str | None:
    """Return the canonical UUID string if value parses as one, else None."""
    if not value:
        return None
    try:
        return str(uuidlib.UUID(value))
    except ValueError:
        return None


def _total(db: Session) -> int:
    return int(db.scalar(select(func.count(Visitor.id))) or 0)


def _set_cookie(response: Response, value: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=COOKIE_NAME,
        value=value,
        max_age=COOKIE_MAX_AGE,
        httponly=True,               # JS cannot read or tamper with it
        samesite="lax",
        # Secure cookies require HTTPS; enabled automatically outside debug
        # localhost setups. Set AEOS_DEBUG=true for local http development.
        secure=not settings.debug and not settings.frontend_url.startswith("http://localhost"),
        path="/",
    )


@router.post("/register", response_model=CountOut)
def register_visitor(request: Request, response: Response, db: Session = Depends(get_db)) -> CountOut:
    """Register the caller as a visitor (once, ever) and return the total.

    Safe to call repeatedly: refreshes and revisits return the existing
    total without incrementing, thanks to the cookie + unique constraint.
    """
    cookie_uuid = _valid_uuid(request.cookies.get(COOKIE_NAME))

    if cookie_uuid is not None:
        exists = db.scalar(select(Visitor.id).where(Visitor.visitor_uuid == cookie_uuid))
        if exists is not None:
            # Known visitor: refresh cookie lifetime, do NOT increment.
            _set_cookie(response, cookie_uuid)
            return CountOut(count=_total(db))

    # New visitor (no cookie, invalid cookie, or unknown UUID): insert.
    visitor_uuid = cookie_uuid or str(uuidlib.uuid4())
    db.add(Visitor(visitor_uuid=visitor_uuid))
    try:
        db.commit()
    except IntegrityError:
        # Lost a race with a concurrent request carrying the same UUID —
        # the visitor is registered; treat as existing.
        db.rollback()

    _set_cookie(response, visitor_uuid)
    return CountOut(count=_total(db))


@router.get("/count", response_model=CountOut)
def visitor_count(db: Session = Depends(get_db)) -> CountOut:
    """Read-only total — used by pages that display but must never increment."""
    return CountOut(count=_total(db))
