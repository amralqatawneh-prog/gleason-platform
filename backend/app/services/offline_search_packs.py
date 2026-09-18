from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime, timezone

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from ..domain.places import PlaceCategory
from .place_provenance import offline_place_entry


def build_offline_search_pack(
    engine: Engine,
    *,
    pack_id: str,
    version: str,
    country_code: str | None = None,
    exclude_categories: Sequence[PlaceCategory] = (),
) -> dict[str, object]:
    inspector = inspect(engine)
    if not inspector.has_table("places") or not inspector.has_table("place_sources"):
        return {
            "schemaVersion": 1,
            "provenanceRevision": 2,
            "id": pack_id,
            "version": version,
            "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "sourceIds": [],
            "entries": [],
        }

    category_expression = "p.category::text" if engine.dialect.name == "postgresql" else "p.category"
    clauses = ["1=1"]
    params: dict[str, object] = {}
    if country_code:
        clauses.append("p.country_code = :country_code")
        params["country_code"] = country_code.upper()
    if exclude_categories:
        placeholders: list[str] = []
        for index, category in enumerate(exclude_categories):
            key = f"exclude_{index}"
            placeholders.append(f":{key}")
            params[key] = category.value
        clauses.append(f"{category_expression} NOT IN ({', '.join(placeholders)})")

    sql = text(
        f"""
        SELECT p.id, {category_expression} AS category, p.name, p.name_ar, p.aliases,
               p.country_code, p.region_code, p.latitude, p.longitude, p.source_id, p.source_record_id, p.quality,
               s.name AS source_name, s.version AS source_version, s.license AS source_license, s.source_url
        FROM places p JOIN place_sources s ON s.source_id = p.source_id
        WHERE {' AND '.join(clauses)}
        ORDER BY p.category, p.name, p.id
        """
    )
    with engine.connect() as connection:
        rows = connection.execute(sql, params).mappings().all()

    entries = [offline_place_entry(row) for row in rows]
    source_ids = {row["source_id"] for row in rows}

    return {
        "schemaVersion": 1,
        "provenanceRevision": 2,
        "id": pack_id,
        "version": version,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sourceIds": sorted(source_ids),
        "entries": entries,
    }
