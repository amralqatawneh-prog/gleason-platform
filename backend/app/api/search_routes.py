from __future__ import annotations

from fastapi import APIRouter, Query, Request

from ..domain.places import PlaceCategory, SearchResponse
from ..services.place_search import search_places

router = APIRouter()


@router.get("/search", response_model=SearchResponse, tags=["search"])
def unified_search(
    request: Request,
    q: str = Query(..., min_length=1, max_length=200),
    category: list[PlaceCategory] | None = Query(default=None),
    country: str | None = Query(default=None, min_length=2, max_length=3),
    region_pack: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=20, ge=1, le=100),
) -> SearchResponse:
    engine = request.app.state.database.engine()
    return search_places(
        engine,
        q,
        categories=category,
        country_code=country,
        region_pack=region_pack,
        limit=limit,
    )
