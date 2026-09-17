from __future__ import annotations

import json
from collections import Counter
from collections.abc import Iterable

from pydantic import BaseModel, Field, field_validator
from sqlalchemy import text

from ..database import DatabaseManager
from ..domain.geography import GeographicEntityType


class GeographicImportRecord(BaseModel):
    id: str = Field(min_length=1, max_length=240)
    entity_type: GeographicEntityType
    name: str = Field(min_length=1, max_length=500)
    name_ar: str | None = None
    aliases: list[str] = Field(default_factory=list)
    country_code: str | None = Field(default=None, max_length=8)
    admin1: str | None = None
    population: int | None = Field(default=None, ge=0)
    elevation_m: float | None = None
    source_id: str = Field(min_length=1, max_length=240)
    source_version: str = Field(min_length=1, max_length=240)
    source_license: str = Field(min_length=1, max_length=500)
    geometry_geojson: dict[str, object]
    metadata: dict[str, object] = Field(default_factory=dict)

    @field_validator("geometry_geojson")
    @classmethod
    def geometry_must_have_type_and_coordinates(cls, value: dict[str, object]) -> dict[str, object]:
        if not isinstance(value.get("type"), str) or "coordinates" not in value:
            raise ValueError("geometry_geojson must be a GeoJSON geometry object")
        return value


class GeographicImportSummary(BaseModel):
    source_id: str
    source_version: str
    processed: int
    inserted_or_updated: int
    counts_by_type: dict[str, int]


UPSERT_SQL = text(
    """
    INSERT INTO geographic_entities (
        id, entity_type, name, name_ar, aliases, country_code, admin1,
        population, elevation_m, source_id, source_version, source_license,
        metadata, geom, updated_at
    ) VALUES (
        :id, :entity_type, :name, :name_ar, CAST(:aliases AS jsonb), :country_code, :admin1,
        :population, :elevation_m, :source_id, :source_version, :source_license,
        CAST(:metadata AS jsonb), ST_SetSRID(ST_GeomFromGeoJSON(:geometry_geojson), 4326), now()
    )
    ON CONFLICT (id) DO UPDATE SET
        entity_type = EXCLUDED.entity_type,
        name = EXCLUDED.name,
        name_ar = EXCLUDED.name_ar,
        aliases = EXCLUDED.aliases,
        country_code = EXCLUDED.country_code,
        admin1 = EXCLUDED.admin1,
        population = EXCLUDED.population,
        elevation_m = EXCLUDED.elevation_m,
        source_id = EXCLUDED.source_id,
        source_version = EXCLUDED.source_version,
        source_license = EXCLUDED.source_license,
        metadata = EXCLUDED.metadata,
        geom = EXCLUDED.geom,
        updated_at = now()
    """
)


def import_geographic_records(
    database: DatabaseManager,
    records: Iterable[GeographicImportRecord],
) -> GeographicImportSummary:
    materialized = list(records)
    if not materialized:
        raise ValueError("at least one geographic record is required")

    source_pairs = {(item.source_id, item.source_version) for item in materialized}
    if len(source_pairs) != 1:
        raise ValueError("one import batch must contain exactly one source_id/source_version pair")

    engine = database.engine()
    if engine.dialect.name != "postgresql":
        raise RuntimeError("geographic import requires PostgreSQL/PostGIS")

    counts = Counter(item.entity_type.value for item in materialized)
    with engine.begin() as connection:
        for item in materialized:
            connection.execute(
                UPSERT_SQL,
                {
                    "id": item.id,
                    "entity_type": item.entity_type.value,
                    "name": item.name,
                    "name_ar": item.name_ar,
                    "aliases": json.dumps(item.aliases, ensure_ascii=False),
                    "country_code": item.country_code,
                    "admin1": item.admin1,
                    "population": item.population,
                    "elevation_m": item.elevation_m,
                    "source_id": item.source_id,
                    "source_version": item.source_version,
                    "source_license": item.source_license,
                    "metadata": json.dumps(item.metadata, ensure_ascii=False),
                    "geometry_geojson": json.dumps(item.geometry_geojson, ensure_ascii=False),
                },
            )

    source_id, source_version = next(iter(source_pairs))
    return GeographicImportSummary(
        source_id=source_id,
        source_version=source_version,
        processed=len(materialized),
        inserted_or_updated=len(materialized),
        counts_by_type=dict(sorted(counts.items())),
    )
