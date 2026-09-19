#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine, text
from app.services.place_provenance import offline_place_entry

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
    _add_list_clause(clauses, params, "p.country_code", [value.upper() for value in args.country], "country")
    _add_list_clause(clauses, params, "p.region_code", args.region_code, "region")
    _add_list_clause(clauses, params, "p.category::text", args.category, "category")
    _add_list_clause(clauses, params, "p.category::text", args.exclude_category, "exclude_category", negate=True)

    sql = text(
        f"""
        SELECT p.id, p.category::text AS category, p.name, p.name_ar, p.aliases,
               p.country_code, p.region_code, p.latitude, p.longitude,
               p.source_id, p.source_record_id, p.quality,
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
    coordinate_classes = {entry["coordinateClassification"] for entry in entries if entry["coordinateClassification"]}

    payload = {
        "schemaVersion": 1,
        "provenanceRevision": 2,
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
