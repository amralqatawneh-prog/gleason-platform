from __future__ import annotations

import hashlib
import json
from datetime import UTC, datetime

from pydantic import BaseModel
from sqlalchemy import text

from ..database import DatabaseManager


class RegionPackUnavailable(RuntimeError):
    pass


class RegionPackManifest(BaseModel):
    id: str
    version: str
    region: str
    generatedAt: str
    entityCount: int
    sha256: str
    sourceIds: list[str]


class RegionPack(BaseModel):
    manifest: RegionPackManifest
    entities: list[dict[str, object]]


def _stable_payload(entities: list[dict[str, object]]) -> str:
    normalized = sorted(entities, key=lambda item: str(item["id"]))
    return json.dumps(normalized, ensure_ascii=False, separators=(",", ":"))


def build_region_pack(database: DatabaseManager, region: str, version: str = "1") -> RegionPack:
    normalized_region = region.strip().upper()
    if not normalized_region:
        raise ValueError("region is required")
    engine = database.engine()
    if engine.dialect.name != "postgresql":
        raise RegionPackUnavailable("region pack export requires PostgreSQL/PostGIS")

    sql = text(
        """
        SELECT id, entity_type, name, name_ar, aliases, country_code,
               source_id, source_version, source_license,
               ST_Y(ST_PointOnSurface(geom)) AS latitude,
               ST_X(ST_PointOnSurface(geom)) AS longitude
        FROM geographic_entities
        WHERE upper(coalesce(country_code, '')) = :region
           OR upper(coalesce(metadata->>'region', '')) = :region
        ORDER BY id
        """
    )
    try:
        with engine.connect() as connection:
            rows = list(connection.execute(sql, {"region": normalized_region}))
    except Exception as exc:
        raise RegionPackUnavailable(exc.__class__.__name__) from exc

    entities: list[dict[str, object]] = []
    source_ids: set[str] = set()
    for row in rows:
        item = row._mapping
        source_ids.add(str(item["source_id"]))
        entities.append({
            "id": item["id"],
            "entityType": item["entity_type"],
            "name": item["name"],
            "nameAr": item["name_ar"],
            "aliases": sorted(list(item["aliases"] or [])),
            "latitude": float(item["latitude"]),
            "longitude": float(item["longitude"]),
            "countryCode": item["country_code"],
            "provenance": {
                "sourceId": item["source_id"],
                "sourceVersion": item["source_version"],
                "sourceLicense": item["source_license"],
            },
        })

    payload = _stable_payload(entities)
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    return RegionPack(
        manifest=RegionPackManifest(
            id=f"geography-{normalized_region.lower()}-{version}",
            version=version,
            region=normalized_region,
            generatedAt=datetime.now(UTC).isoformat(),
            entityCount=len(entities),
            sha256=digest,
            sourceIds=sorted(source_ids),
        ),
        entities=entities,
    )
