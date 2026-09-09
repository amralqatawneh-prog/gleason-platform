from __future__ import annotations

from fastapi import APIRouter, Request

from ..services.capabilities import platform_capabilities

router = APIRouter()


@router.get("/health", tags=["system"])
def health() -> dict[str, object]:
    return {"status": "ok", "service": "gleason-platform-backend", "version": "0.1.0"}


@router.get("/ready", tags=["system"])
def ready(request: Request) -> dict[str, object]:
    status = request.app.state.database.probe()
    return {
        "status": "ready" if status.reachable else "degraded",
        "database": {
            "configured": status.configured,
            "reachable": status.reachable,
            "dialect": status.dialect,
            "detail": status.detail,
        },
    }


@router.get("/capabilities", tags=["system"])
def capabilities() -> dict[str, object]:
    return platform_capabilities()
