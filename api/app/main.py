from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, health, settings as settings_api, visitors
from app.core.config import get_settings
from app.core.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()  # dev convenience; phase 2 replaces with Alembic migrations
    yield


def create_app() -> FastAPI:
    """App factory — makes testing trivial (build a fresh app per test)."""
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.2.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix="/api/v1")
    app.include_router(auth.router, prefix="/api/v1")
    app.include_router(settings_api.router, prefix="/api/v1")
    app.include_router(visitors.router, prefix="/api/v1")
    return app


app = create_app()
