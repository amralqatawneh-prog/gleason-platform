"""One provenance serializer for HTTP packs and the production CLI builder."""
import json
from collections.abc import Mapping


def coordinate_classification(quality: object) -> str | None:
    if isinstance(quality, str):
        try:
            quality = json.loads(quality)
        except json.JSONDecodeError:
            return None
    value = quality.get("coordinate_classification") if isinstance(quality, dict) else None
    return value if isinstance(value, str) and value else None


def offline_place_entry(row: Mapping) -> dict[str, object]:
    aliases = row["aliases"]
    if isinstance(aliases, str):
        try:
            aliases = json.loads(aliases)
        except json.JSONDecodeError:
            aliases = []
    return {
        "id": row["id"], "category": row["category"], "name": row["name"],
        **({"nameAr": row["name_ar"]} if row["name_ar"] else {}),
        "aliases": [item for item in aliases if isinstance(item, str)] if isinstance(aliases, list) else [],
        **({"countryCode": row["country_code"]} if row["country_code"] else {}),
        **({"regionCode": row["region_code"]} if row["region_code"] else {}),
        "latitude": row["latitude"], "longitude": row["longitude"],
        "sourceId": row["source_id"], "sourceRecordId": row["source_record_id"],
        "coordinateClassification": coordinate_classification(row["quality"]),
        "source": {
            "sourceId": row["source_id"], "name": row["source_name"],
            "version": row["source_version"], "license": row["source_license"],
            "sourceUrl": row["source_url"],
        },
    }
