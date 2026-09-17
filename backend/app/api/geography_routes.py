from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, Request

from ..domain.geography import GeographicEntityType, GeographicSearchResponse
from ..services.geographic_search import GeographicSearchUnavailable, search_geography
from ..services.offline_region_pack import RegionPack, RegionPackUnavailable, build_region_pack

router = APIRouter()


@router.get("/search", response_model=GeographicSearchResponse, tags=["geography"])
def unified_search(
    request: Request,
    q: str = Query(..., min_length=1, max_length=200),
    entity_type: list[GeographicEntityType] = Query(default=[]),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> GeographicSearchResponse:
    try:
        return search_geography(
            request.app.state.database,
            query=q,
            entity_types=entity_type,
            limit=limit,
            offset=offset,
        )
    except GeographicSearchUnavailable as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "geographic_search_unavailable", "message": str(exc)},
        ) from exc


@router.get("/search/entity-types", tags=["geography"])
def geographic_entity_types() -> list[str]:
    return [item.value for item in GeographicEntityType]


@router.get("/geography/region-pack", response_model=RegionPack, tags=["geography"])
def geographic_region_pack(
    request: Request,
    region: str = Query(..., min_length=1, max_length=32),
) -> RegionPack:
    try:
        return build_region_pack(request.app.state.database, region=region)
    except RegionPackUnavailable as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "region_pack_unavailable", "message": str(exc)},
        ) from exc
