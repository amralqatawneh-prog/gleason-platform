from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field


class GeographicEntityType(StrEnum):
    COUNTRY = "country"
    CITY = "city"
    SEA = "sea"
    OCEAN = "ocean"
    RIVER = "river"
    MOUNTAIN = "mountain"
    AIRPORT = "airport"


class GeographicPoint(BaseModel):
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)


class GeographicProvenance(BaseModel):
    source_id: str
    source_version: str
    source_license: str


class GeographicEntity(BaseModel):
    id: str
    entity_type: GeographicEntityType
    name: str
    name_ar: str | None = None
    aliases: list[str] = Field(default_factory=list)
    country_code: str | None = None
    admin1: str | None = None
    population: int | None = Field(default=None, ge=0)
    elevation_m: float | None = None
    point: GeographicPoint | None = None
    provenance: GeographicProvenance
    metadata: dict[str, object] = Field(default_factory=dict)


class GeographicSearchResponse(BaseModel):
    query: str
    total: int
    limit: int
    offset: int
    results: list[GeographicEntity]
