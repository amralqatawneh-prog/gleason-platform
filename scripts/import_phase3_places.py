#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path
from typing import Any

from sqlalchemy import create_engine, text

CATEGORIES = {"country", "city", "sea", "ocean", "river", "mountain", "airport"}
COORDINATE_MODES = {"point", "source-fields", "derived-bbox-center", "derived-line-midpoint"}
BATCH_SIZE = 1000


def finite_coordinate(latitude: float, longitude: float) -> tuple[float, float]:
    if not -90 <= latitude <= 90:
        raise ValueError(f"latitude out of range: {latitude}")
    if not -180 <= longitude <= 180:
        raise ValueError(f"longitude out of range: {longitude}")
    return latitude, longitude


def point_from_geometry(geometry: dict[str, Any]) -> tuple[float, float]:
    if geometry.get("type") != "Point":
        raise ValueError("Point coordinate mode requires Point geometry; do not invent centroids")
    coordinates = geometry.get("coordinates")
    if not isinstance(coordinates, list) or len(coordinates) < 2:
        raise ValueError("invalid Point coordinates")
    longitude, latitude = float(coordinates[0]), float(coordinates[1])
    return finite_coordinate(latitude, longitude)


def _flatten_line_coordinates(geometry: dict[str, Any]) -> list[list[float]]:
    geometry_type = geometry.get("type")
    coordinates = geometry.get("coordinates") or []
    if geometry_type == "LineString":
        return coordinates
    if geometry_type == "MultiLineString":
        return [point for line in coordinates for point in line]
    raise ValueError("derived-line-midpoint requires LineString or MultiLineString")


def coordinate_from_feature(feature: dict[str, Any], props: dict[str, Any], args: argparse.Namespace) -> tuple[float, float, str]:
    mode = args.coordinate_mode
    if mode == "point":
        latitude, longitude = point_from_geometry(feature.get("geometry") or {})
        return latitude, longitude, "SOURCE_POINT"
    if mode == "source-fields":
        if not args.latitude_field or not args.longitude_field:
            raise ValueError("source-fields requires --latitude-field and --longitude-field")
        if props.get(args.latitude_field) is None or props.get(args.longitude_field) is None:
            raise ValueError("source coordinate fields are missing")
        latitude, longitude = finite_coordinate(float(props[args.latitude_field]), float(props[args.longitude_field]))
        return latitude, longitude, "SOURCE_LABEL"
    if mode == "derived-bbox-center":
        bbox = feature.get("bbox")
        if not isinstance(bbox, list) or len(bbox) < 4:
            raise ValueError("derived-bbox-center requires source bbox")
        longitude = (float(bbox[0]) + float(bbox[2])) / 2.0
        latitude = (float(bbox[1]) + float(bbox[3])) / 2.0
        latitude, longitude = finite_coordinate(latitude, longitude)
        return latitude, longitude, "DERIVED_FROM_SOURCE_BBOX"
    if mode == "derived-line-midpoint":
        points = _flatten_line_coordinates(feature.get("geometry") or {})
        if not points:
            raise ValueError("line geometry has no coordinates")
        longitude, latitude = points[len(points) // 2][:2]
        latitude, longitude = finite_coordinate(float(latitude), float(longitude))
        return latitude, longitude, "DERIVED_FROM_SOURCE_GEOMETRY"
    raise ValueError(f"unsupported coordinate mode: {mode}")


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
            "metadata": json.dumps({"importer": args.mode, "coordinate_mode": args.coordinate_mode}),
        },
    )


UPSERT_PLACE_SQL = text(
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
)


def _db_item(item: dict[str, Any]) -> dict[str, Any]:
    return {
        **item,
        "aliases": json.dumps(item.get("aliases", []), ensure_ascii=False),
        "properties": json.dumps(item.get("properties", {}), ensure_ascii=False),
        "quality": json.dumps(item.get("quality", {}), ensure_ascii=False),
    }


def upsert_places(connection, items: list[dict[str, Any]]) -> None:
    for start in range(0, len(items), BATCH_SIZE):
        batch = [_db_item(item) for item in items[start : start + BATCH_SIZE]]
        if batch:
            connection.execute(UPSERT_PLACE_SQL, batch)


def import_natural_earth(path: Path, args: argparse.Namespace) -> list[dict[str, Any]]:
    category = args.category
    if category not in CATEGORIES - {"airport"}:
        raise ValueError("Natural Earth category must be one of country/city/sea/ocean/river/mountain")
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("type") != "FeatureCollection":
        raise ValueError("expected GeoJSON FeatureCollection")
    allowed_classes = {value.casefold() for value in (args.featurecla_value or [])}
    output = []
    for index, feature in enumerate(payload.get("features", [])):
        props = feature.get("properties") or {}
        if allowed_classes:
            value = str(props.get(args.featurecla_field) or "").casefold()
            if value not in allowed_classes:
                continue
        latitude, longitude, coordinate_classification = coordinate_from_feature(feature, props, args)
        name = props.get(args.name_field)
        if not name:
            continue
        record_id = str(props.get(args.id_field) or feature.get("id") or f"row-{index}")
        output.append(
            {
                "id": f"{args.source_id}:{category}:{record_id}",
                "category": category,
                "name": str(name),
                "name_ar": props.get(args.name_ar_field) if args.name_ar_field else None,
                "aliases": [],
                "country_code": props.get(args.country_field) if args.country_field else None,
                "region_code": props.get(args.region_field) if args.region_field else None,
                "latitude": latitude,
                "longitude": longitude,
                "source_id": args.source_id,
                "source_record_id": f"{category}:{record_id}",
                "properties": props,
                "quality": {
                    "coordinate_classification": coordinate_classification,
                    "coordinate_mode": args.coordinate_mode,
                },
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
                    "id": f"{args.source_id}:airport:{record_id}",
                    "category": "airport",
                    "name": row["name"],
                    "name_ar": None,
                    "aliases": [value for value in (row.get("ident"), row.get("iata_code"), row.get("gps_code")) if value],
                    "country_code": row.get("iso_country") or None,
                    "region_code": row.get("iso_region") or None,
                    "latitude": latitude,
                    "longitude": longitude,
                    "source_id": args.source_id,
                    "source_record_id": f"airport:{record_id}",
                    "properties": {key: value for key, value in row.items() if key not in {"latitude_deg", "longitude_deg"}},
                    "quality": {"coordinate_classification": "SOURCE_POINT", "coordinate_mode": "source-fields"},
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
    result.add_argument("--coordinate-mode", choices=sorted(COORDINATE_MODES), default="point")
    result.add_argument("--latitude-field")
    result.add_argument("--longitude-field")
    result.add_argument("--featurecla-field", default="featurecla")
    result.add_argument("--featurecla-value", action="append")
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
        upsert_places(connection, items)
    print(json.dumps({"imported": len(items), "source_id": args.source_id, "category": args.category, "mode": args.mode}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
