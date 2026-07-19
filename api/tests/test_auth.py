import os
import tempfile

# Isolate the test database BEFORE app imports read settings.
os.environ["AEOS_DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import create_app  # noqa: E402

CREDS = {"name": "Ada Lovelace", "email": "ada@example.com", "password": "s3cure-pass!"}


def make_client() -> TestClient:
    return TestClient(create_app())


def test_register_login_me_flow() -> None:
    with make_client() as client:
        # Register
        r = client.post("/api/v1/auth/register", json=CREDS)
        assert r.status_code == 201, r.text
        token = r.json()["access_token"]
        assert r.json()["user"]["email"] == CREDS["email"]

        # Duplicate email rejected
        assert client.post("/api/v1/auth/register", json=CREDS).status_code == 409

        # Login works; wrong password rejected with the same generic error
        assert client.post(
            "/api/v1/auth/login", json={"email": CREDS["email"], "password": CREDS["password"]}
        ).status_code == 200
        assert client.post(
            "/api/v1/auth/login", json={"email": CREDS["email"], "password": "wrong-pass"}
        ).status_code == 401

        # Bearer token resolves to the user
        me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200 and me.json()["name"] == CREDS["name"]

        # Garbage token rejected
        assert client.get(
            "/api/v1/auth/me", headers={"Authorization": "Bearer not-a-jwt"}
        ).status_code == 401


def test_password_is_hashed_not_plaintext() -> None:
    with make_client() as client:
        creds = {**CREDS, "email": "hash-check@example.com"}
        client.post("/api/v1/auth/register", json=creds)

        from sqlalchemy import select

        from app.core.db import SessionLocal
        from app.models.user import User

        with SessionLocal() as db:
            user = db.scalar(select(User).where(User.email == creds["email"]))
            assert user is not None
            assert user.password_hash != creds["password"]
            assert user.password_hash and user.password_hash.startswith("$2")  # bcrypt marker
