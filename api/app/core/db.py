from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Declarative base all models inherit from."""


settings = get_settings()

# check_same_thread=False is required for SQLite + FastAPI's threadpool;
# harmless for other databases (ignored).
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    """Request-scoped database session (FastAPI dependency)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables. Phase 2 replaces this with Alembic migrations."""
    from app import models  # noqa: F401  (register models with Base)

    Base.metadata.create_all(bind=engine)
    # create_all never alters existing tables — patch columns added after
    # the dev database was first created (Alembic replaces this in phase 2).
    _ensure_column("users", "is_admin", "BOOLEAN NOT NULL DEFAULT 0")


def _ensure_column(table: str, column: str, ddl: str) -> None:
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if table not in insp.get_table_names():
        return
    if column in {c["name"] for c in insp.get_columns(table)}:
        return
    with engine.begin() as conn:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}"))
