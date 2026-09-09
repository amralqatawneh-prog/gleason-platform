from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..domain.projections import GeoPoint, ProjectedPoint
from ..providers.projections.gleason import GleasonHistoricalProjectionProvider
from ..services.projections import forward, inverse, projection_metadata
from ..services.source_catalog import source_catalog

router = APIRouter()


@router.get("/models/projections", tags=["models"])
def models() -> list[dict[str, object]]:
    return projection_metadata()


@router.post("/projections/{model_id}/forward", tags=["models"])
def project_forward(model_id: str, point: GeoPoint) -> dict[str, object]:
    try:
        return forward(model_id, point).model_dump()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="unknown projection model") from exc


@router.post("/projections/{model_id}/inverse", tags=["models"])
def project_inverse(model_id: str, point: ProjectedPoint) -> dict[str, object]:
    try:
        return inverse(model_id, point).model_dump()
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="unknown projection model") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/sources/gleason", tags=["sources"])
def gleason_source() -> dict[str, object]:
    return source_catalog()


@router.get("/sources/gleason/longitude-degree", tags=["sources"])
def gleason_longitude_degree(latitude: float = Query(..., ge=-90.0, le=90.0)) -> dict[str, object]:
    provider = GleasonHistoricalProjectionProvider()
    return {
        "latitude": latitude,
        "book_miles_per_degree_longitude": provider.historical_longitude_degree_miles(latitude),
        "evidence_level": "DERIVED",
        "source": "Fig. 43, PDF p. 429 / printed p. 402",
        "warning": "Preserves the source's historical mile terminology; not a WGS84 distance.",
    }
