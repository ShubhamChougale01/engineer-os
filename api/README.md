# AI Engineer OS — API

The backend for **AI Engineer OS**: a FastAPI service handling authentication and the unique-visitor counter for the [`web`](../web) frontend, managed with [uv](https://docs.astral.sh/uv/).

## Features

- **Email + password auth** — bcrypt password hashing (cost factor 12), never stored in plain text.
- **OAuth 2.0 / OIDC** — sign in with GitHub, Google, or Apple, with CSRF-safe `state` handling and JWKS-based token verification where applicable.
- **JWT sessions** — HS256-signed access tokens (PyJWT), `Authorization: Bearer` auth on protected routes.
- **Race-condition-safe unique visitor counter** — cookie-identified (validated UUID, HttpOnly, SameSite=Lax), backed by a `UNIQUE` DB constraint so concurrent requests can never double-count.
- **Admin settings** — enable/disable individual skills and toggle sign-ups, gated to admin accounts via `AEOS_ADMIN_EMAILS`.
- **SQLAlchemy 2.0** models (declarative, typed `Mapped`/`mapped_column`) over SQLite by default, ready to swap to PostgreSQL via `AEOS_DATABASE_URL`.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | FastAPI, Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Auth | bcrypt, PyJWT, OAuth 2.0 (GitHub / Google / Apple) |
| Config | pydantic-settings (env-prefixed `AEOS_*`) |
| Package manager | uv |
| Testing | pytest |
| Linting | ruff |

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/getting-started/installation/)

## Getting Started

```bash
uv sync                                  # create the virtualenv and install dependencies
cp .env.example .env                     # fill in secrets — see below
uv run uvicorn app.main:app --reload     # http://localhost:8000/docs
```

## Available Commands

| Command | Description |
|---|---|
| `uv run uvicorn app.main:app --reload` | Start the dev server with auto-reload |
| `uv run pytest` | Run the test suite |
| `uv run ruff check .` | Lint |

## Environment Variables

All variables are prefixed `AEOS_`. See [`.env.example`](.env.example) for the full, annotated list. Highlights:

| Variable | Required | Description |
|---|---|---|
| `AEOS_JWT_SECRET` | Yes (prod) | HMAC signing secret for session tokens — generate with `openssl rand -hex 32` |
| `AEOS_DATABASE_URL` | No | SQLAlchemy connection string (defaults to local SQLite) |
| `AEOS_FRONTEND_URL` | No | Used to build OAuth redirect URLs |
| `AEOS_GITHUB_CLIENT_ID` / `AEOS_GITHUB_CLIENT_SECRET` | No | Enables GitHub sign-in |
| `AEOS_GOOGLE_CLIENT_ID` / `AEOS_GOOGLE_CLIENT_SECRET` | No | Enables Google sign-in |
| `AEOS_APPLE_CLIENT_ID` / `AEOS_APPLE_TEAM_ID` / `AEOS_APPLE_KEY_ID` / `AEOS_APPLE_PRIVATE_KEY` | No | Enables Sign in with Apple (requires a paid Apple Developer account) |
| `AEOS_ADMIN_EMAILS` | No | JSON list of emails promoted to admin on sign-in/up |

**Never commit a real `.env` file** — see the [Secrets Management skill](../web/src/content/skills/secrets-management.ts) on the platform itself for why.

## Project Structure (feature-first, clean architecture)

```
app/
├── main.py            # app factory: lifespan, middleware, router mounting
├── core/
│   ├── config.py      # pydantic-settings, env-prefixed AEOS_*
│   ├── db.py           # engine, session factory, init_db()
│   └── security.py    # password hashing, JWT issuance/verification, auth dependencies
├── models/             # SQLAlchemy models (User, Visitor, AppSetting)
└── api/v1/             # versioned routers
    ├── auth.py         # register/login/me + OAuth start/callback for all providers
    ├── visitors.py     # register/count endpoints for the unique-visitor counter
    ├── settings.py     # admin-managed platform flags
    └── health.py
tests/                  # pytest suite — auth flows, visitor race-safety, health check
```

## Testing

```bash
uv run pytest -v
```

Covers: registration/login/`me` flow, duplicate-email rejection, wrong-password rejection, password-hash verification (never plaintext), and visitor-counter correctness (new visitor increments, refresh does not, distinct visitors each count once, garbage cookies are replaced not trusted, concurrent identical-UUID requests count exactly once, the read-only count endpoint never increments).

## License

MIT
