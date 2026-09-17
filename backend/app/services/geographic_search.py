from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import text

from ..database import DatabaseManager
from ..domain.geography import (
    GeographicEntity,
    GeographicEntityType,
    GeographicPoint,
    GeographicProvenance,
    GeographicSearchResponse,
)


class GeographicSearchUnavailable(RuntimeError):
    pass


def _row_to_entity(row: object) -> GeographicEntity:
    mapping = row._mapping  # SQLAlchemy Row
    point = None
    if mapping["latitude"] is not None and mapping["longitude"] is not None:
        point = GeographicPoint(
            latitude=float(mapping["latitude"]),
            longitude=float(mapping["longitude"]),
        )
    return GeographicEntity(
        id=mapping["id"],
        entity_type=mapping["entity_type"],
        name=mapping["name"],
        name_ar=mapping["name_ar"],
        aliases=list(mapping["aliases"] or []),
        country_code=mapping["country_code"],
        admin1=mapping["admin1"],
        population=mapping["population"],
        elevation_m=mapping["elevation_m"],
        point=point,
        provenance=GeographicProvenance(
            source_id=mapping["source_id"],
            source_version=mapping["source_version"],
            source_license=mapping["source_license"],
        ),
        metadata=dict(mapping["metadata"] or {}),
    )


def search_geography(
    database: DatabaseManager,
    query: str,
    entity_types: Sequence[GeographicEntityType],
    limit: int,
    offset: int,
) -> GeographicSearchResponse:
    normalized = query.strip()
    if not normalized:
        return GeographicSearchResponse(query="", total=0, limit=limit, offset=offset, results=[])

    engine = database.engine()
    if engine.dialect.name != "postgresql":
        raise GeographicSearchUnavailable("unified server search requires PostgreSQL/PostGIS")

    type_values = [item.value for item in entity_types]
    sql = text(
        """
        WITH candidates AS (
            SELECT
                ge.*,
                CASE
                    WHEN lower(ge.name) = lower(:query) OR lower(coalesce(ge.name_ar, '')) = lower(:query) THEN 0
                    WHEN lower(ge.name) LIKE lower(:prefix) OR lower(coalesce(ge.name_ar, '')) LIKE lower(:prefix) THEN 1
                    ELSE 2
                END AS rank_bucket
            FROM geographic_entities ge
            WHERE
                (:use_types = false OR ge.entity_type = ANY(CAST(:types AS text[])))
                AND (
                    lower(ge.name) % lower(:query)
                    OR lower(coalesce(ge.name_ar, '')) % lower(:query)
                    OR EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements_text(ge.aliases) alias
                        WHERE lower(alias) % lower(:query)
                           OR lower(alias) LIKE lower(:contains)
                    )
                    OR lower(ge.name) LIKE lower(:contains)
                    OR lower(coalesce(ge.name_ar, '')) LIKE lower(:contains)
                )
        ), counted AS (
            SELECT candidates.*, count(*) OVER() AS total_count
            FROM candidates
        )
        SELECT
            id, entity_type, name, name_ar, aliases, country_code, admin1,
            population, elevation_m, source_id, source_version, source_license,
            metadata,
            ST_Y(ST_PointOnSurface(geom)) AS latitude,
            ST_X(ST_PointOnSurface(geom)) AS longitude,
            total_count
        FROM counted
        ORDER BY rank_bucket, population DESC NULLS LAST, name
        LIMIT :limit OFFSET :offset
        """
    )
    params = {
        "query": normalized,
        "prefix": f"{normalized}%",
        "contains": f"%{normalized}%",
        "types": type_values,
        "use_types": bool(type_values),
        "limit": limit,
        "offset": offset,
    }
    try:
        with engine.connect() as connection:
            rows = list(connection.execute(sql, params))
    except Exception as exc:
        raise GeographicSearchUnavailable(exc.__class__.__name__) from exc

    total = int(rows[0]._mapping["total_count"]) if rows else 0
    return GeographicSearchResponse(
        query=normalized,
        total=total,
        limit=limit,
        offset=offset,
        results=[_row_to_entity(row) for row in rows],
    )
