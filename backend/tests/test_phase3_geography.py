from __future__ import annotations

from fastapi.testclient import TestClient

from app.domain.geography import GeographicEntity, GeographicEntityType, GeographicProvenance
from app.main import app


def test_geographic_entity_contract_requires_provenance() -> None:
    entity = GeographicEntity(
        id="fixture:city",
        entity_type=GeographicEntityType.CITY,
        name="Fixture City",
        aliases=["Example"],
        provenance=GeographicProvenance(
            source_id="test-fixture",
            source_version="1",
            source_license="test-only",
        ),
    )
    assert entity.entity_type == GeographicEntityType.CITY
    assert entity.provenance.source_license == "test-only"


def test_entity_types_endpoint_lists_phase3_contract() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/search/entity-types")
    assert response.status_code == 200
    assert response.json() == [
        "country",
        "city",
        "sea",
        "ocean",
        "river",
        "mountain",
        "airport",
    ]


def test_server_search_does_not_fake_results_without_postgis() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/search", params={"q": "Doha"})
    assert response.status_code == 503
    detail = response.json()["detail"]
    assert detail["code"] == "geographic_search_unavailable"
