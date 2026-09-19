from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class PlaceCategory(StrEnum):
    COUNTRY = "country"
    CITY = "city"
    SEA = "sea"
    OCEAN = "ocean"
    RIVER = "river"
    MOUNTAIN = "mountain"
    AIRPORT = "airport"


class PlaceSource(BaseModel):
    source_id: str
    name: str
    version: str | None = None
    license: str
    source_url: str


class PlaceSearchResult(BaseModel):
    id: str
    category: PlaceCategory
    name: str
    name_ar: str | None = None
    country_code: str | None = None
    region_code: str | None = None
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)
    source_record_id: str
    coordinate_classification: str | None = None
    source: PlaceSource
    score: float = Field(ge=0.0)


class SearchResponse(BaseModel):
    query: str
    count: int
    results: list[PlaceSearchResult]
    backend: str
