from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.importers.geography import GeographicImportRecord


def valid_record(**overrides):
    payload = {
        "id": "test:city:doha",
        "entity_type": "city",
        "name": "Doha",
        "name_ar": "الدوحة",
        "aliases": ["Ad Dawhah"],
        "country_code": "QA",
        "source_id": "TEST_FIXTURE_ONLY",
        "source_version": "1",
        "source_license": "TEST_ONLY",
        "geometry_geojson": {"type": "Point", "coordinates": [51.531, 25.285]},
        "metadata": {"fixture": True},
    }
    payload.update(overrides)
    return GeographicImportRecord.model_validate(payload)


def test_import_record_requires_provenance() -> None:
    with pytest.raises(ValidationError):
        GeographicImportRecord.model_validate({
            "id": "x", "entity_type": "city", "name": "X",
            "geometry_geojson": {"type": "Point", "coordinates": [0, 0]},
        })


def test_import_record_rejects_non_geometry_object() -> None:
    with pytest.raises(ValidationError):
        valid_record(geometry_geojson={"type": "Point"})


def test_import_fixture_is_explicitly_non_production() -> None:
    record = valid_record()
    assert record.source_id == "TEST_FIXTURE_ONLY"
    assert record.metadata["fixture"] is True
    assert record.entity_type.value == "city"
