from __future__ import annotations

from app.importers.adapters import adapt_natural_earth_geojson, adapt_ourairports_csv


def test_natural_earth_adapter_preserves_provenance() -> None:
    features = [{
        "type": "Feature",
        "properties": {"NE_ID": 101, "NAME": "Fixture City", "NAME_AR": "مدينة اختبار", "ISO_A2": "ZZ", "POP_MAX": 1234},
        "geometry": {"type": "Point", "coordinates": [10.0, 20.0]},
    }]
    records = adapt_natural_earth_geojson(features, entity_type="city", source_version="TEST-ONLY", id_prefix="populated_places")
    assert len(records) == 1
    record = records[0]
    assert record.id == "natural-earth:populated_places:101"
    assert record.source_id == "natural-earth"
    assert record.source_license == "Public Domain"
    assert record.name_ar == "مدينة اختبار"
    assert record.metadata["source_theme"] == "populated_places"


def test_ourairports_adapter_converts_coordinates_and_elevation() -> None:
    rows = [{
        "ident": "ZZZZ",
        "type": "large_airport",
        "name": "Fixture International",
        "latitude_deg": "25.0",
        "longitude_deg": "51.0",
        "elevation_ft": "100",
        "iso_country": "ZZ",
        "iso_region": "ZZ-01",
        "municipality": "Fixture",
        "gps_code": "ZZZZ",
        "iata_code": "ZZZ",
    }]
    records = adapt_ourairports_csv(rows, snapshot_version="TEST-ONLY")
    assert len(records) == 1
    record = records[0]
    assert record.id == "ourairports:airport:ZZZZ"
    assert record.source_id == "ourairports"
    assert record.source_license == "Public Domain"
    assert record.geometry_geojson["coordinates"] == [51.0, 25.0]
    assert record.elevation_m == 30.48
    assert record.aliases == ["ZZZ"]
