from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app
from app.version import APP_VERSION


def make_client(tmp_path):
    settings = Settings(
        env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'api.db'}",
        cors_origins=["https://example.test"],
    )
    return TestClient(create_app(settings))


def test_health_endpoint_and_request_id(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.get("/api/v1/health", headers={"X-Request-ID": "phase3-test"})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "phase3-test"
    assert response.json()["version"] == APP_VERSION


def test_readiness_checks_database(tmp_path) -> None:
    with make_client(tmp_path) as client:
        payload = client.get("/api/v1/ready").json()
    assert payload["status"] == "ready"
    assert payload["database"]["reachable"] is True
    assert payload["database"]["dialect"] == "sqlite"


def test_capabilities_distinguish_implemented_features_from_phase_acceptance(tmp_path) -> None:
    with make_client(tmp_path) as client:
        payload = client.get("/api/v1/capabilities").json()
    assert payload["offline_core"] is True
    assert payload["gleason_projection"] is True
    assert payload["ae_projection"] is True
    assert payload["interactive_2d_map"] is True
    assert payload["historical_scan_embedded"] is False
    assert payload["wgs84_globe"] is True
    assert payload["wgs84_offline_math"] is True
    assert payload["release"] == f"v{APP_VERSION}"
    assert payload["phase"] == 6
    assert payload["accepted_phase"] == 5
    assert payload["phase_status"] == "in_progress"
    assert payload["cross_model_synchronization"] is True
    assert payload["measurement_semantics_contract"] is True
    assert payload["ordered_route_state"] is True
    assert payload["ordered_route_persistence"] is False
    assert payload["measurement_engine"] is True
    assert payload["wgs84_route_distance"] is True
    assert payload["route_engine"] is False
    assert payload["area_engine"] is False
    assert payload["astronomy_engine"] is False


def test_public_version_surfaces_match_package_metadata(tmp_path) -> None:
    with make_client(tmp_path) as client:
        assert client.get("/").json()["version"] == APP_VERSION
        assert client.get("/openapi.json").json()["info"]["version"] == APP_VERSION


def test_offline_search_core_endpoint_returns_versioned_pack(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.get("/api/v1/offline-search/core")
    assert response.status_code == 200
    payload = response.json()
    assert payload["schemaVersion"] == 1
    assert payload["id"] == "search-core-world-v1"
    assert payload["version"] == "1.0.0"
    assert payload["sourceIds"] == []
    assert payload["entries"] == []


def test_offline_search_country_endpoint_normalizes_code(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.get("/api/v1/offline-search/country/qa")
    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == "region-qa-v1"
    assert payload["entries"] == []


def test_offline_search_country_rejects_invalid_code(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.get("/api/v1/offline-search/country/qatar")
    assert response.status_code == 422


def test_cors_preflight(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.options(
            "/api/v1/health",
            headers={
                "Origin": "https://example.test",
                "Access-Control-Request-Method": "GET",
            },
        )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://example.test"
