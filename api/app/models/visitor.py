from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class Visitor(Base):
    """One row per unique visitor, identified by a cookie UUID.

    The UNIQUE constraint on visitor_uuid is the race-condition guard:
    two concurrent first-visits with the same UUID can both attempt an
    INSERT, but the database allows exactly one — the loser gets an
    IntegrityError and is treated as already-registered.
    """

    __tablename__ = "visitors"

    id: Mapped[int] = mapped_column(primary_key=True)
    visitor_uuid: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
