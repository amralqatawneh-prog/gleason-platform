#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine, text

CATEGORIES = ("country", "city", "sea", "ocean", "river", "mountain", "airport")


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="Build a versioned offline search index from the Phase 3 catalog")
    result.add_argument("--database-url", required=True)
    result.add_argument("--output", type=Path, required=True)
    result.add_argument("--id", required=True)
    result.add_argument("--version", required=True)
    result.add_argument("--country", action="append", default=[])
    result.add_argument("--region-code", action="append", default=[])
    result.add_argument("--category", action="append", choices=CATEGORIES, default=[])
    result.add_argument("--exclude-category", action="append", choices=CATEGORIES, default=[])
    return result


def _add_list_clause(clauses: list[str], params: dict[str, object], column: str, values: list[str], prefix: str, negate: bool = False) -> None:
    if not values:
        return
    placeholders: list[str] = []
    for index, value in enumerate(values):
        key = f"{prefix}_{index}"
        placeholders.append(f":{key}")
        params[key] = value
    operator = "NOT IN" if negate else "IN"
    clauses.append(f"{column} {operator} ({', '.join(placeholders)})")


def main() -> int:
    args = parser().parse_args()
    engine = create_engine(args.database_url)
    if engine.dialect.name != "postgresql":
        raise SystemExit("offline production index builder requires PostgreSQL/PostGIS")

    clauses = ["1=1"]
    params: dict[str, object] = {}
    _add_list_clause(clauses, params, "country_code", [value.upper() for value in args.country], "country")
    _add_list_clause(clauses, params, "region_code", args.region_code, "region")
    _add_list_clause(clauses, params, "category::text", args.category, "category")
    _add_list_clause(clauses, params, "category::text", args.exclude_category, "exclude_category", negate=True)

    sql = text(
        f"""
        SELECT id, category::text AS category, name, name_ar, aliases,
               country_code, region_code, latitude, longitude,
               source_id, source_record_id, quality
        FROM places
        WHERE {' AND '.join(clauses)}
        ORDER BY category, name, id
        """
    )
    with engine.connect() as connection:
        rows = connection.execute(sql, params).mappings().all()

    entries = []
    source_ids: set[str] = set()
    coordinate_classes: set[str] = set()
    for row in rows:
        source_ids.add(row["source_id"])
        quality = row["quality"] or {}
        classification = quality.get("coordinate_classification")
        if classification:
            coordinate_classes.add(classification)
        entries.append(
            {
                "id": row["id"],
                "category": row["category"],
                "name": row["name"],
                **({"nameAr": row["name_ar"]} if row["name_ar"] else {}),
                "aliases": row["aliases"] or [],
                **({"countryCode": row["country_code"]} if row["country_code"] else {}),
                **({"regionCode": row["region_code"]} if row["region_code"] else {}),
                "latitude": row["latitude"],
                "longitude": row["longitude"],
                "sourceId": row["source_id"],
                "sourceRecordId": row["source_record_id"],
                **({"coordinateClassification": classification} if classification else {}),
            }
        )

    payload = {
        "schemaVersion": 1,
        "id": args.id,
        "version": args.version,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "sourceIds": sorted(source_ids),
        "coordinateClassifications": sorted(coordinate_classes),
        "filters": {
            "countries": [value.upper() for value in args.country],
            "regionCodes": args.region_code,
            "categories": args.category,
            "excludedCategories": args.exclude_category,
        },
        "entries": entries,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "entries": len(entries), "sources": sorted(source_ids), "bytes": args.output.stat().st_size}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
