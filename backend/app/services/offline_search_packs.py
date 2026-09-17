from __future__ import annotations

import json
from collections.abc import Sequence
from datetime import datetime, timezone

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

from ..domain.places import PlaceCategory


def _decode_aliases(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value]
    if isinstance(value, str):
        try:
            decoded = json.loads(value)
        except json.JSONDecodeError:
            return []
        if isinstance(decoded, list):
            return [str(item) for item in decoded]
    return []


def build_offline_search_pack(
    engine: Engine,
    *,
    pack_id: str,
    version: str,
    country_code: str | None = None,
    exclude_categories: Sequence[PlaceCategory] = (),
) -> dict[str, object]:
    inspector = inspect(engine)
    if not inspector.has_table("places"):
        return {
            "schemaVersion": 1,
            "id": pack_id,
            "version": version,
            "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "sourceIds": [],
            "entries": [],
        }

    category_expression = "category::text" if engine.dialect.name == "postgresql" else "category"
    clauses = ["1=1"]
    params: dict[str, object] = {}
    if country_code:
        clauses.append("country_code = :country_code")
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
        SELECT id, {category_expression} AS category, name, name_ar, aliases,
               country_code, region_code, latitude, longitude, source_id, source_record_id
        FROM places
        WHERE {' AND '.join(clauses)}
        ORDER BY category, name, id
        """
    )
    with engine.connect() as connection:
        rows = connection.execute(sql, params).mappings().all()

    source_ids: set[str] = set()
    entries: list[dict[str, object]] = []
    for row in rows:
        source_ids.add(row["source_id"])
        entry: dict[str, object] = {
            "id": row["id"],
            "category": row["category"],
            "name": row["name"],
            "aliases": _decode_aliases(row["aliases"]),
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "sourceId": row["source_id"],
            "sourceRecordId": row["source_record_id"],
        }
        if row["name_ar"]:
            entry["nameAr"] = row["name_ar"]
        if row["country_code"]:
            entry["countryCode"] = row["country_code"]
        if row["region_code"]:
            entry["regionCode"] = row["region_code"]
        entries.append(entry)

    return {
        "schemaVersion": 1,
        "id": pack_id,
        "version": version,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sourceIds": sorted(source_ids),
        "entries": entries,
    }
