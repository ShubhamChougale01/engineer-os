from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class User(Base):
    """A platform user.

    password_hash is NULL for OAuth-only accounts. (provider, provider_id)
    identifies the external identity; provider is "local" for email+password.
    """

    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("provider", "provider_id", name="uq_provider_identity"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str | None] = mapped_column(String(128), default=None)
    provider: Mapped[str] = mapped_column(String(20), default="local")
    provider_id: Mapped[str | None] = mapped_column(String(120), default=None)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
