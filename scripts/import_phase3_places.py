#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine, text

CATEGORIES = {"country", "city", "sea", "ocean", "river", "mountain", "airport"}


def finite_coordinate(latitude: float, longitude: float) -> tuple[float, float]:
    if not -90 <= latitude <= 90:
        raise ValueError(f"latitude out of range: {latitude}")
    if not -180 <= longitude <= 180:
        raise ValueError(f"longitude out of range: {longitude}")
    return latitude, longitude


def point_from_geometry(geometry: dict[str, Any]) -> tuple[float, float]:
    if geometry.get("type") != "Point":
        raise ValueError("Phase 3 base importer requires Point geometry; do not invent centroids")
    coordinates = geometry.get("coordinates")
    if not isinstance(coordinates, list) or len(coordinates) < 2:
        raise ValueError("invalid Point coordinates")
    longitude, latitude = float(coordinates[0]), float(coordinates[1])
    return finite_coordinate(latitude, longitude)


def upsert_source(connection, args: argparse.Namespace) -> None:
    connection.execute(
        text(
            """
            INSERT INTO place_sources (source_id, name, version, license, source_url, dataset_sha256, metadata)
            VALUES (:source_id, :name, :version, :license, :source_url, :sha256, CAST(:metadata AS jsonb))
            ON CONFLICT (source_id) DO UPDATE SET
                name=excluded.name, version=excluded.version, license=excluded.license,
                source_url=excluded.source_url, dataset_sha256=excluded.dataset_sha256,
                metadata=excluded.metadata, imported_at=now()
            """
        ),
        {
            "source_id": args.source_id,
            "name": args.source_name,
            "version": args.source_version,
            "license": args.source_license,
            "source_url": args.source_url,
            "sha256": args.sha256,
            "metadata": json.dumps({"importer": args.mode}),
        },
    )


def upsert_place(connection, item: dict[str, Any]) -> None:
    connection.execute(
        text(
            """
            INSERT INTO places (
                id, category, name, name_ar, aliases, country_code, region_code,
                latitude, longitude, source_id, source_record_id, properties, quality
            ) VALUES (
                :id, CAST(:category AS place_category), :name, :name_ar, CAST(:aliases AS jsonb),
                :country_code, :region_code, :latitude, :longitude, :source_id,
                :source_record_id, CAST(:properties AS jsonb), CAST(:quality AS jsonb)
            )
            ON CONFLICT (source_id, source_record_id) DO UPDATE SET
                id=excluded.id, category=excluded.category, name=excluded.name,
                name_ar=excluded.name_ar, aliases=excluded.aliases,
                country_code=excluded.country_code, region_code=excluded.region_code,
                latitude=excluded.latitude, longitude=excluded.longitude,
                properties=excluded.properties, quality=excluded.quality, updated_at=now()
            """
        ),
        {
            **item,
            "aliases": json.dumps(item.get("aliases", []), ensure_ascii=False),
            "properties": json.dumps(item.get("properties", {}), ensure_ascii=False),
            "quality": json.dumps(item.get("quality", {}), ensure_ascii=False),
        },
    )


def import_natural_earth(path: Path, args: argparse.Namespace) -> list[dict[str, Any]]:
    category = args.category
    if category not in CATEGORIES - {"airport"}:
        raise ValueError("Natural Earth category must be one of country/city/sea/ocean/river/mountain")
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("type") != "FeatureCollection":
        raise ValueError("expected GeoJSON FeatureCollection")
    output = []
    for index, feature in enumerate(payload.get("features", [])):
        props = feature.get("properties") or {}
        latitude, longitude = point_from_geometry(feature.get("geometry") or {})
        name = props.get(args.name_field)
        if not name:
            raise ValueError(f"feature {index} missing name field {args.name_field}")
        record_id = str(props.get(args.id_field) or feature.get("id") or f"row-{index}")
        output.append(
            {
                "id": f"{args.source_id}:{record_id}",
                "category": category,
                "name": str(name),
                "name_ar": props.get(args.name_ar_field) if args.name_ar_field else None,
                "aliases": [],
                "country_code": props.get(args.country_field) if args.country_field else None,
                "region_code": props.get(args.region_field) if args.region_field else None,
                "latitude": latitude,
                "longitude": longitude,
                "source_id": args.source_id,
                "source_record_id": record_id,
                "properties": props,
                "quality": {"geometry": "source-point"},
            }
        )
    return output


def import_ourairports(path: Path, args: argparse.Namespace) -> list[dict[str, Any]]:
    output = []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            if not row.get("id") or not row.get("name"):
                continue
            if not row.get("latitude_deg") or not row.get("longitude_deg"):
                continue
            latitude, longitude = finite_coordinate(float(row["latitude_deg"]), float(row["longitude_deg"]))
            record_id = row["id"]
            output.append(
                {
                    "id": f"{args.source_id}:{record_id}",
                    "category": "airport",
                    "name": row["name"],
                    "name_ar": None,
                    "aliases": [value for value in (row.get("ident"), row.get("iata_code"), row.get("gps_code")) if value],
                    "country_code": row.get("iso_country") or None,
                    "region_code": row.get("iso_region") or None,
                    "latitude": latitude,
                    "longitude": longitude,
                    "source_id": args.source_id,
                    "source_record_id": record_id,
                    "properties": {key: value for key, value in row.items() if key not in {"latitude_deg", "longitude_deg"}},
                    "quality": {"geometry": "source-point"},
                }
            )
    return output


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(description="Import Phase 3 place data with explicit provenance")
    result.add_argument("--database-url", required=True)
    result.add_argument("--mode", choices=["natural-earth-geojson", "ourairports-csv"], required=True)
    result.add_argument("--input", type=Path, required=True)
    result.add_argument("--source-id", required=True)
    result.add_argument("--source-name", required=True)
    result.add_argument("--source-version")
    result.add_argument("--source-license", required=True)
    result.add_argument("--source-url", required=True)
    result.add_argument("--sha256")
    result.add_argument("--category", choices=sorted(CATEGORIES))
    result.add_argument("--name-field", default="NAME")
    result.add_argument("--name-ar-field")
    result.add_argument("--id-field", default="ne_id")
    result.add_argument("--country-field")
    result.add_argument("--region-field")
    return result


def main() -> int:
    args = parser().parse_args()
    if not args.input.is_file():
        raise SystemExit(f"input file not found: {args.input}")
    if args.mode == "natural-earth-geojson" and not args.category:
        raise SystemExit("--category is required for Natural Earth imports")
    items = import_natural_earth(args.input, args) if args.mode == "natural-earth-geojson" else import_ourairports(args.input, args)
    engine = create_engine(args.database_url)
    if engine.dialect.name != "postgresql":
        raise SystemExit("production importer requires PostgreSQL/PostGIS")
    with engine.begin() as connection:
        upsert_source(connection, args)
        for item in items:
            upsert_place(connection, item)
    print(json.dumps({"imported": len(items), "source_id": args.source_id, "mode": args.mode}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
