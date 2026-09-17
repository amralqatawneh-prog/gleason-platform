from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def make_client(tmp_path) -> TestClient:
    settings = Settings(
        env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'phase4-reference-api.db'}",
        cors_origins=["https://example.test"],
    )
    return TestClient(create_app(settings))


def test_wgs84_metadata_endpoint(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.get("/api/v1/models/reference/wgs84")
    assert response.status_code == 200
    payload = response.json()
    assert payload["model_id"] == "wgs84-reference"
    assert payload["model_version"] == "WGS84-0.4.0"
    assert payload["geographic_crs"] == "EPSG:4979"
    assert payload["ecef_crs"] == "EPSG:4978"
    assert payload["semantic_type"] == "REFERENCE_RESULT"


def test_geodetic_to_ecef_endpoint(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/geodetic-to-ecef",
            json={"latitude": 0.0, "longitude": 0.0, "ellipsoidal_height_m": 0.0},
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["semantic_type"] == "REFERENCE_RESULT"
    assert payload["operation"] == "geodetic_to_ecef"
    assert payload["output"]["x_m"] == pytest.approx(6378137.0, abs=1e-6)
    assert payload["output"]["y_m"] == pytest.approx(0.0, abs=1e-6)
    assert payload["output"]["z_m"] == pytest.approx(0.0, abs=1e-6)
    assert payload["provenance"]["provider_id"] == "wgs84-reference"


def test_ecef_to_geodetic_endpoint(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/ecef-to-geodetic",
            json={"x_m": 6378137.0, "y_m": 0.0, "z_m": 0.0},
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["semantic_type"] == "REFERENCE_RESULT"
    assert payload["operation"] == "ecef_to_geodetic"
    assert payload["output"]["latitude"] == pytest.approx(0.0, abs=1e-12)
    assert payload["output"]["longitude"] == pytest.approx(0.0, abs=1e-12)
    assert payload["output"]["ellipsoidal_height_m"] == pytest.approx(0.0, abs=1e-6)


def test_geodesic_inverse_endpoint(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/geodesic-inverse",
            json={
                "start": {"latitude": 0.0, "longitude": 0.0, "ellipsoidal_height_m": 0.0},
                "end": {"latitude": 0.0, "longitude": 1.0, "ellipsoidal_height_m": 0.0},
            },
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["semantic_type"] == "REFERENCE_RESULT"
    assert payload["operation"] == "geodesic_inverse"
    assert payload["output"]["distance_m"] == pytest.approx(111319.49079327357, abs=1e-6)
    assert payload["output"]["initial_bearing_deg"] == pytest.approx(90.0, abs=1e-12)
    assert payload["output"]["final_bearing_deg"] == pytest.approx(90.0, abs=1e-12)
    assert payload["output"]["reverse_bearing_deg"] == pytest.approx(270.0, abs=1e-12)
    assert payload["provenance"]["units"]["distance"] == "metres"


def test_reference_api_rejects_invalid_geographic_coordinates(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/geodetic-to-ecef",
            json={"latitude": 91.0, "longitude": 0.0, "ellipsoidal_height_m": 0.0},
        )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any(item["loc"][-1] == "latitude" for item in detail)


def test_reference_api_rejects_silent_longitude_normalization(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/geodetic-to-ecef",
            json={"latitude": 0.0, "longitude": 181.0, "ellipsoidal_height_m": 0.0},
        )
    assert response.status_code == 422
    detail = response.json()["detail"]
    assert any(item["loc"][-1] == "longitude" for item in detail)
