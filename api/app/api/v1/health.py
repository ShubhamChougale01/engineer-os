from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    """Liveness probe — used by Docker healthchecks and load balancers."""
    return {"status": "ok"}
