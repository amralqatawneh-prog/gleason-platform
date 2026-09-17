from __future__ import annotations

import re

from fastapi import APIRouter, HTTPException, Request

from ..domain.places import PlaceCategory
from ..services.offline_search_packs import build_offline_search_pack

router = APIRouter(prefix="/offline-search", tags=["offline-search"])
COUNTRY_CODE = re.compile(r"^[A-Z]{2}$")


@router.get("/core")
def core_pack(request: Request) -> dict[str, object]:
    return build_offline_search_pack(
        request.app.state.database.engine(),
        pack_id="search-core-world-v1",
        version="1.0.0",
        exclude_categories=[PlaceCategory.AIRPORT],
    )


@router.get("/country/{country_code}")
def country_pack(country_code: str, request: Request) -> dict[str, object]:
    code = country_code.upper()
    if not COUNTRY_CODE.fullmatch(code):
        raise HTTPException(status_code=422, detail="country_code must be a two-letter ISO-like code")
    return build_offline_search_pack(
        request.app.state.database.engine(),
        pack_id=f"region-{code.lower()}-v1",
        version="1.0.0",
        country_code=code,
    )
