import os
import re
import tempfile

os.environ["AEOS_DATABASE_URL"] = f"sqlite:///{tempfile.mkdtemp()}/test.db"
os.environ["AEOS_DEBUG"] = "true"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import create_app  # noqa: E402

UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


def test_new_visitor_increments_and_sets_cookie() -> None:
    with TestClient(create_app()) as client:
        r = client.post("/api/v1/visitors/register")
        assert r.status_code == 200
        assert r.json()["count"] == 1
        vid = client.cookies.get("aeos_vid")
        assert vid and UUID_RE.match(vid)


def test_refresh_does_not_increment() -> None:
    with TestClient(create_app()) as client:
        first = client.post("/api/v1/visitors/register").json()["count"]
        # Same client (cookie jar persists) — three refreshes
        for _ in range(3):
            again = client.post("/api/v1/visitors/register").json()["count"]
            assert again == first


def test_distinct_visitors_each_count_once() -> None:
    app = create_app()
    with TestClient(app) as a:
        base = a.post("/api/v1/visitors/register").json()["count"]
    with TestClient(app) as b:  # fresh cookie jar = new visitor
        n2 = b.post("/api/v1/visitors/register").json()["count"]
    assert n2 == base + 1


def test_garbage_cookie_is_replaced_not_trusted() -> None:
    app = create_app()
    with TestClient(app) as client:
        r = client.post(
            "/api/v1/visitors/register",
            headers={"Cookie": "aeos_vid=not-a-uuid-drop-table"},
        )
        assert r.status_code == 200
        # Server must issue a fresh, VALID uuid — read it from Set-Cookie.
        set_cookie = r.headers.get("set-cookie", "")
        value = set_cookie.split("aeos_vid=", 1)[1].split(";", 1)[0]
        assert UUID_RE.match(value)


def test_same_uuid_race_counts_once() -> None:
    """Two clients presenting the SAME unknown UUID must produce one row."""
    app = create_app()
    shared = "11111111-2222-3333-4444-555555555555"
    with TestClient(app) as a, TestClient(app) as b:
        a.cookies.set("aeos_vid", shared)
        b.cookies.set("aeos_vid", shared)
        ca = a.post("/api/v1/visitors/register").json()["count"]
        cb = b.post("/api/v1/visitors/register").json()["count"]
        assert ca == cb  # one visitor, not two


def test_count_endpoint_never_increments() -> None:
    app = create_app()
    with TestClient(app) as client:
        client.post("/api/v1/visitors/register")
        n1 = client.get("/api/v1/visitors/count").json()["count"]
        with TestClient(app) as fresh:  # no cookie — but GET must not register
            n2 = fresh.get("/api/v1/visitors/count").json()["count"]
        assert n1 == n2
