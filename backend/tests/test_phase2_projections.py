from __future__ import annotations

import math

import pytest
from fastapi.testclient import TestClient

from app.domain.projections import GeoPoint, ProjectedPoint
from app.main import app
from app.providers.projections import AzimuthalEquidistantProvider, GleasonHistoricalProjectionProvider


@pytest.mark.parametrize(("point", "expected_radius"), [(GeoPoint(latitude=90, longitude=0), 0.0), (GeoPoint(latitude=0, longitude=0), 0.5), (GeoPoint(latitude=-90, longitude=0), 1.0)])
def test_gleason_source_radial_cases(point: GeoPoint, expected_radius: float) -> None:
    provider = GleasonHistoricalProjectionProvider()
    projected = provider.forward(point)
    assert math.hypot(projected.x, projected.y) == pytest.approx(expected_radius, abs=1e-12)


@pytest.mark.parametrize("point", [GeoPoint(latitude=25.2854, longitude=51.5310), GeoPoint(latitude=-33.9249, longitude=18.4241), GeoPoint(latitude=51.5074, longitude=-0.1278), GeoPoint(latitude=0, longitude=90)])
def test_gleason_round_trip(point: GeoPoint) -> None:
    provider = GleasonHistoricalProjectionProvider()
    restored = provider.inverse(provider.forward(point))
    assert restored.latitude == pytest.approx(point.latitude, abs=1e-10)
    assert restored.longitude == pytest.approx(point.longitude, abs=1e-10)


def test_figure_43_derived_rule() -> None:
    provider = GleasonHistoricalProjectionProvider()
    assert provider.historical_longitude_degree_miles(90) == pytest.approx(0)
    assert provider.historical_longitude_degree_miles(0) == pytest.approx(60)
    assert provider.historical_longitude_degree_miles(-90) == pytest.approx(120)
    assert provider.historical_longitude_degree_miles(85) == pytest.approx(10 / 3)


def test_ae_round_trip() -> None:
    provider = AzimuthalEquidistantProvider()
    point = GeoPoint(latitude=25.2854, longitude=51.5310)
    restored = provider.inverse(provider.forward(point))
    assert restored.latitude == pytest.approx(point.latitude, abs=1e-8)
    assert restored.longitude == pytest.approx(point.longitude, abs=1e-8)


def test_projection_api_and_source_catalog() -> None:
    with TestClient(app) as client:
        models = client.get("/api/v1/models/projections")
        assert models.status_code == 200
        assert {item["model_id"] for item in models.json()} == {"gleason-historical", "ae-north-pole"}
        result = client.post("/api/v1/projections/gleason-historical/forward", json={"latitude": 0, "longitude": 90})
        assert result.status_code == 200
        assert result.json()["output"]["x"] == pytest.approx(0.5)
        source = client.get("/api/v1/sources/gleason")
        assert source.status_code == 200
        assert source.json()["georeferencing"]["historical_scan"] == "not-embedded"


def test_inverse_rejects_outside_historical_circle() -> None:
    provider = GleasonHistoricalProjectionProvider()
    with pytest.raises(ValueError):
        provider.inverse(ProjectedPoint(x=1.1, y=0, units="normalized-radius"))
