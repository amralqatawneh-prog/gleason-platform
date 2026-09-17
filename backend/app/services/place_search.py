from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from ..domain.places import PlaceCategory, PlaceSearchResult, PlaceSource, SearchResponse


def _clean_query(value: str) -> str:
    return " ".join(value.strip().split())


def _normalize_categories(categories: Sequence[PlaceCategory] | None) -> list[str]:
    return [item.value for item in categories or []]


def search_places(
    engine: Engine,
    query: str,
    *,
    categories: Sequence[PlaceCategory] | None = None,
    country_code: str | None = None,
    region_pack: str | None = None,
    limit: int = 20,
) -> SearchResponse:
    cleaned = _clean_query(query)
    if not cleaned:
        return SearchResponse(query="", count=0, results=[], backend=engine.dialect.name)
    limit = max(1, min(limit, 100))

    inspector = inspect(engine)
    if not inspector.has_table("places") or not inspector.has_table("place_sources"):
        return SearchResponse(query=cleaned, count=0, results=[], backend=engine.dialect.name)

    category_values = _normalize_categories(categories)
    params: dict[str, object] = {
        "query": cleaned,
        "query_like": f"%{cleaned.lower()}%",
        "query_prefix": f"{cleaned.lower()}%",
        "country_code": country_code.upper() if country_code else None,
        "region_pack": region_pack,
        "limit": limit,
    }

    if engine.dialect.name == "postgresql":
        sql = text(
            """
            SELECT
                p.id, p.category::text AS category, p.name, p.name_ar,
                p.country_code, p.region_code, p.latitude, p.longitude,
                p.source_record_id,
                s.source_id, s.name AS source_name, s.version AS source_version,
                s.license AS source_license, s.source_url,
                CASE
                    WHEN lower(p.name) = lower(:query) THEN 100.0
                    WHEN lower(coalesce(p.name_ar, '')) = lower(:query) THEN 99.0
                    WHEN lower(p.name) LIKE :query_prefix THEN 90.0 + similarity(lower(p.name), lower(:query))
                    ELSE 70.0 + greatest(
                        similarity(lower(p.name), lower(:query)),
                        similarity(lower(coalesce(p.name_ar, '')), lower(:query)),
                        similarity(p.search_text, lower(:query))
                    )
                END AS score
            FROM places p
            JOIN place_sources s ON s.source_id = p.source_id
            WHERE p.search_text LIKE :query_like
              AND (:country_code IS NULL OR p.country_code = :country_code)
              AND (
                    :region_pack IS NULL OR EXISTS (
                        SELECT 1 FROM region_pack_places rpp
                        WHERE rpp.place_id = p.id AND rpp.pack_id = :region_pack
                    )
                  )
              AND (cardinality(CAST(:categories AS text[])) = 0 OR p.category::text = ANY(CAST(:categories AS text[])))
            ORDER BY score DESC, p.name ASC, p.id ASC
            LIMIT :limit
            """
        )
        params["categories"] = category_values
    else:
        # Development/test fallback. PostgreSQL/PostGIS remains the production spatial backend.
        clauses = ["lower(p.search_text) LIKE :query_like"]
        if country_code:
            clauses.append("p.country_code = :country_code")
        if category_values:
            placeholders = []
            for index, category in enumerate(category_values):
                key = f"category_{index}"
                placeholders.append(f":{key}")
                params[key] = category
            clauses.append(f"p.category IN ({', '.join(placeholders)})")
        if region_pack and inspector.has_table("region_pack_places"):
            clauses.append(
                "EXISTS (SELECT 1 FROM region_pack_places rpp WHERE rpp.place_id = p.id AND rpp.pack_id = :region_pack)"
            )
        where = " AND ".join(clauses)
        sql = text(
            f"""
            SELECT
                p.id, p.category, p.name, p.name_ar,
                p.country_code, p.region_code, p.latitude, p.longitude,
                p.source_record_id,
                s.source_id, s.name AS source_name, s.version AS source_version,
                s.license AS source_license, s.source_url,
                CASE
                    WHEN lower(p.name) = lower(:query) THEN 100.0
                    WHEN lower(coalesce(p.name_ar, '')) = lower(:query) THEN 99.0
                    WHEN lower(p.name) LIKE :query_prefix THEN 90.0
                    ELSE 70.0
                END AS score
            FROM places p
            JOIN place_sources s ON s.source_id = p.source_id
            WHERE {where}
            ORDER BY score DESC, p.name ASC, p.id ASC
            LIMIT :limit
            """
        )

    with engine.connect() as connection:
        rows = connection.execute(sql, params).mappings().all()

    results = [
        PlaceSearchResult(
            id=row["id"],
            category=PlaceCategory(row["category"]),
            name=row["name"],
            name_ar=row["name_ar"],
            country_code=row["country_code"],
            region_code=row["region_code"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            source_record_id=row["source_record_id"],
            source=PlaceSource(
                source_id=row["source_id"],
                name=row["source_name"],
                version=row["source_version"],
                license=row["source_license"],
                source_url=row["source_url"],
            ),
            score=float(row["score"]),
        )
        for row in rows
    ]
    return SearchResponse(query=cleaned, count=len(results), results=results, backend=engine.dialect.name)
