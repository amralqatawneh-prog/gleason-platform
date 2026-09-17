from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Any

from .geography import GeographicImportRecord

PUBLIC_DOMAIN = "Public Domain"


def _first(properties: Mapping[str, Any], *keys: str) -> Any:
    for key in keys:
        if key in properties and properties[key] not in (None, ""):
            return properties[key]
        upper = key.upper()
        if upper in properties and properties[upper] not in (None, ""):
            return properties[upper]
        lower = key.lower()
        if lower in properties and properties[lower] not in (None, ""):
            return properties[lower]
    return None


def adapt_natural_earth_geojson(
    features: Iterable[Mapping[str, Any]],
    *,
    entity_type: str,
    source_version: str,
    id_prefix: str,
) -> list[GeographicImportRecord]:
    records: list[GeographicImportRecord] = []
    for index, feature in enumerate(features):
        properties = feature.get("properties") or {}
        geometry = feature.get("geometry")
        if not isinstance(properties, Mapping) or not isinstance(geometry, Mapping):
            continue
        name = _first(properties, "name", "name_en", "name_long")
        if not name:
            continue
        stable_source_id = _first(properties, "ne_id", "wikidataid", "adm0_a3", "iso_a3")
        record_id = f"natural-earth:{id_prefix}:{stable_source_id or index}"
        aliases = []
        for key in ("namealt", "name_alt", "abbrev"):
            value = _first(properties, key)
            if isinstance(value, str) and value and value != name:
                aliases.extend(part.strip() for part in value.split("|") if part.strip())
        population = _first(properties, "pop_max", "pop_est")
        elevation = _first(properties, "elevation", "elev")
        records.append(GeographicImportRecord(
            id=record_id,
            entity_type=entity_type,
            name=str(name),
            name_ar=_first(properties, "name_ar"),
            aliases=sorted(set(aliases)),
            country_code=_first(properties, "iso_a2", "adm0_a3"),
            population=int(population) if population not in (None, "") else None,
            elevation_m=float(elevation) if elevation not in (None, "") else None,
            source_id="natural-earth",
            source_version=source_version,
            source_license=PUBLIC_DOMAIN,
            geometry_geojson=dict(geometry),
            metadata={"source_theme": id_prefix},
        ))
    return records


def adapt_ourairports_csv(
    rows: Iterable[Mapping[str, str]],
    *,
    snapshot_version: str,
) -> list[GeographicImportRecord]:
    records: list[GeographicImportRecord] = []
    for row in rows:
        ident = (row.get("ident") or "").strip()
        name = (row.get("name") or "").strip()
        latitude = (row.get("latitude_deg") or "").strip()
        longitude = (row.get("longitude_deg") or "").strip()
        if not ident or not name or not latitude or not longitude:
            continue
        aliases = [value for value in ((row.get("iata_code") or "").strip(), (row.get("gps_code") or "").strip()) if value and value != ident]
        elevation_ft = (row.get("elevation_ft") or "").strip()
        records.append(GeographicImportRecord(
            id=f"ourairports:airport:{ident}",
            entity_type="airport",
            name=name,
            aliases=sorted(set(aliases)),
            country_code=(row.get("iso_country") or "").strip() or None,
            admin1=(row.get("iso_region") or "").strip() or None,
            elevation_m=float(elevation_ft) * 0.3048 if elevation_ft else None,
            source_id="ourairports",
            source_version=snapshot_version,
            source_license=PUBLIC_DOMAIN,
            geometry_geojson={"type": "Point", "coordinates": [float(longitude), float(latitude)]},
            metadata={
                "airport_type": (row.get("type") or "").strip(),
                "municipality": (row.get("municipality") or "").strip(),
            },
        ))
    return records
