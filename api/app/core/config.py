from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env (prefix AEOS_).

    Keeping all configuration here (12-factor) means no scattered os.environ
    reads. OAuth providers are optional: leave their vars unset to disable.
    """

    model_config = SettingsConfigDict(env_file=".env", env_prefix="AEOS_")

    app_name: str = "AI Engineer OS API"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:3000"]
    frontend_url: str = "http://localhost:3000"

    # Database (SQLite for dev; swap to PostgreSQL DSN in phase 2)
    database_url: str = "sqlite:///./aeos.db"

    # Emails granted the admin role on sign-in/sign-up.
    # env: AEOS_ADMIN_EMAILS='["you@example.com"]' (JSON list)
    admin_emails: list[str] = []

    # Auth — CHANGE jwt_secret IN PRODUCTION (e.g. `openssl rand -hex 32`)
    jwt_secret: str = "dev-only-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60 * 24 * 7  # 7 days

    # OAuth — GitHub
    github_client_id: str | None = None
    github_client_secret: str | None = None

    # OAuth — Google
    google_client_id: str | None = None
    google_client_secret: str | None = None

    # OAuth — Apple (requires Apple Developer account; key signs the client secret)
    apple_client_id: str | None = None      # the Services ID, e.g. com.example.web
    apple_team_id: str | None = None
    apple_key_id: str | None = None
    apple_private_key: str | None = None    # contents of the .p8 key file


@lru_cache
def get_settings() -> Settings:
    return Settings()
