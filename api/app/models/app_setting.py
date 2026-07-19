from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class AppSetting(Base):
    """A platform-wide setting row: key → JSON-encoded value.

    Admin-controlled feature flags (signup_enabled, disabled_skills) live
    here so they survive restarts and apply to every visitor.
    """

    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(Text)
