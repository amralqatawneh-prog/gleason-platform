from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def make_client(tmp_path) -> TestClient:
    settings = Settings(
        env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'phase6-gleason-distance.db'}",
        cors_origins=["https://example.test"],
    )
    return TestClient(create_app(settings))


def route_point(point_id: str, latitude: float, longitude: float) -> dict[str, object]:
    return {"point_id": point_id, "latitude": latitude, "longitude": longitude}


def test_p6_5_gleason_open_polyline_returns_normalized_segments_total_and_identity(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/measurement/gleason/route-distance",
            json={
                "route_id": "transient-route",
                "points": [
                    route_point("route-point-1", 90.0, 0.0),
                    route_point("route-point-2", 0.0, 0.0),
                    route_point("route-point-3", 0.0, 90.0),
                ],
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["semantic_type"] == "COMPUTED_RESULT"
    assert payload["operation"] == "gleason_route_distance"
    assert payload["output"]["method_id"] == "gleason-native-normalized"
    assert payload["output"]["quantity"] == "distance"
    assert payload["output"]["unit"] == "normalized-radius-unit"
    assert payload["output"]["scale_basis"] == "gleason-normalized-model-radius"
    assert payload["output"]["path_semantics"] == "open-polyline"
    assert payload["output"]["segment_geometry"] == "straight-projected-chord"
    assert payload["output"]["segment_count"] == 2
    assert payload["output"]["segments"][0]["distance_normalized_radius_unit"] == pytest.approx(0.5)
    assert payload["output"]["segments"][1]["distance_normalized_radius_unit"] == pytest.approx(
        0.7071067811865475
    )
    assert payload["output"]["total_distance_normalized_radius_unit"] == pytest.approx(
        1.2071067811865475
    )
    first = payload["output"]["segments"][0]
    assert first["from_x_normalized_radius"] == pytest.approx(0.0)
    assert first["from_y_normalized_radius"] == pytest.approx(0.0)
    assert first["to_x_normalized_radius"] == pytest.approx(0.0)
    assert first["to_y_normalized_radius"] == pytest.approx(-0.5)
    assert payload["provenance"]["provider_id"] == "gleason-historical"
    assert payload["provenance"]["provider_version"] == "GH-0.2.0"
    assert payload["provenance"]["semantic_type"] == "COMPUTED_RESULT"
    assert any("no automatic metre/kilometre conversion" in note for note in payload["provenance"]["notes"])


def test_p6_5_gleason_antimeridian_is_deterministic_projected_chord(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/measurement/gleason/route-distance",
            json={
                "points": [
                    route_point("route-point-1", 0.0, 179.0),
                    route_point("route-point-2", 0.0, -179.0),
                ],
            },
        )

    assert response.status_code == 200
    distance = response.json()["output"]["total_distance_normalized_radius_unit"]
    assert distance == pytest.approx(0.01745240643728344, abs=1e-15)


def test_p6_5_repeated_coordinate_zero_reverse_total_and_model_center(tmp_path) -> None:
    forward = {
        "points": [
            route_point("route-point-1", 25.285447, 51.53104),
            route_point("route-point-2", 25.285447, 51.53104),
            route_point("route-point-3", 31.9539, 35.9106),
            route_point("route-point-4", 90.0, 0.0),
        ]
    }
    reverse = {"points": list(reversed(forward["points"]))}

    with make_client(tmp_path) as client:
        forward_payload = client.post("/api/v1/measurement/gleason/route-distance", json=forward).json()
        reverse_payload = client.post("/api/v1/measurement/gleason/route-distance", json=reverse).json()

    assert forward_payload["output"]["segments"][0]["distance_normalized_radius_unit"] == 0.0
    assert forward_payload["output"]["segments"][1]["distance_normalized_radius_unit"] > 0.0
    assert forward_payload["output"]["segments"][-1]["to_x_normalized_radius"] == pytest.approx(0.0)
    assert forward_payload["output"]["segments"][-1]["to_y_normalized_radius"] == pytest.approx(0.0)
    assert reverse_payload["output"]["total_distance_normalized_radius_unit"] == pytest.approx(
        forward_payload["output"]["total_distance_normalized_radius_unit"], abs=1e-15
    )


@pytest.mark.parametrize(
    "points",
    [
        [route_point("route-point-1", 0.0, 0.0)],
        [
            route_point("route-point-1", 0.0, 0.0),
            route_point("route-point-1", 0.0, 1.0),
        ],
        [
            route_point("route-point-1", 91.0, 0.0),
            route_point("route-point-2", 0.0, 1.0),
        ],
        [
            route_point("route-point-1", 0.0, 181.0),
            route_point("route-point-2", 0.0, 1.0),
        ],
    ],
)
def test_p6_5_invalid_route_inputs_fail_closed(tmp_path, points) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/measurement/gleason/route-distance",
            json={"points": points},
        )
    assert response.status_code == 422
