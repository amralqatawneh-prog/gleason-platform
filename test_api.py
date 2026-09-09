from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def make_client(tmp_path):
    settings = Settings(
        env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'api.db'}",
        cors_origins=["https://example.test"],
    )
    return TestClient(create_app(settings))


def test_health_endpoint_and_request_id(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.get("/api/v1/health", headers={"X-Request-ID": "phase1-test"})
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "phase1-test"
    assert response.json()["version"] == "0.1.0"


def test_readiness_checks_database(tmp_path) -> None:
    with make_client(tmp_path) as client:
        payload = client.get("/api/v1/ready").json()
    assert payload["status"] == "ready"
    assert payload["database"]["reachable"] is True
    assert payload["database"]["dialect"] == "sqlite"


def test_capabilities_do_not_claim_future_features(tmp_path) -> None:
    with make_client(tmp_path) as client:
        payload = client.get("/api/v1/capabilities").json()
    assert payload["offline_core"] is True
    assert payload["gleason_projection"] is False
    assert payload["wgs84_globe"] is False
    assert payload["astronomy_engine"] is False


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
