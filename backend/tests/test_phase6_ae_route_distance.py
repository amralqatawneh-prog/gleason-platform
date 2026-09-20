from __future__ import annotations

import math

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def make_client(tmp_path) -> TestClient:
    settings = Settings(
        env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'phase6-ae-distance.db'}",
        cors_origins=["https://example.test"],
    )
    return TestClient(create_app(settings))


def route_point(point_id: str, latitude: float, longitude: float) -> dict[str, object]:
    return {"point_id": point_id, "latitude": latitude, "longitude": longitude}


def test_p6_4_ae_open_polyline_returns_projected_segments_total_and_identity(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/measurement/ae/route-distance",
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
    assert payload["semantic_type"] == "REFERENCE_RESULT"
    assert payload["operation"] == "ae_route_distance"
    assert payload["output"]["method_id"] == "ae-projected-plane"
    assert payload["output"]["quantity"] == "distance"
    assert payload["output"]["unit"] == "metre"
    assert payload["output"]["scale_basis"] == "ae-projected-plane-si-metre"
    assert payload["output"]["path_semantics"] == "open-polyline"
    assert payload["output"]["segment_geometry"] == "straight-projected-chord"
    assert payload["output"]["segment_count"] == 2
    assert payload["output"]["segments"][0]["segment_id"] == (
        "route-segment:route-point-1->route-point-2"
    )
    assert payload["output"]["segments"][1]["segment_id"] == (
        "route-segment:route-point-2->route-point-3"
    )
    assert payload["output"]["segments"][0]["distance_m"] == pytest.approx(
        10001965.729312722, abs=1e-6
    )
    assert payload["output"]["segments"][1]["distance_m"] == pytest.approx(
        14144915.584784957, abs=1e-6
    )
    assert payload["output"]["total_distance_m"] == pytest.approx(
        24146881.31409768, abs=1e-6
    )
    first = payload["output"]["segments"][0]
    assert first["from_x_m"] == pytest.approx(0.0, abs=1e-9)
    assert first["from_y_m"] == pytest.approx(0.0, abs=1e-9)
    assert first["to_x_m"] == pytest.approx(0.0, abs=1e-9)
    assert first["to_y_m"] == pytest.approx(-10001965.729312722, abs=1e-6)
    assert payload["provenance"]["provider_id"] == "ae-north-pole"
    assert payload["provenance"]["implementation"] == "pyproj"
    assert any("not relabeled as WGS84" in note for note in payload["provenance"]["notes"])


def test_p6_4_ae_antimeridian_uses_projected_chord_not_wgs84_geodesic(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/measurement/ae/route-distance",
            json={
                "points": [
                    route_point("route-point-1", 0.0, 179.0),
                    route_point("route-point-2", 0.0, -179.0),
                ],
            },
        )

    assert response.status_code == 200
    distance = response.json()["output"]["total_distance_m"]
    assert distance == pytest.approx(349116.7421594914, abs=1e-6)
    # Explicitly different from the WGS84 short geodesic (~222.639 km).
    assert abs(distance - 222638.98158654713) > 100000.0


def test_p6_4_repeated_coordinate_is_zero_and_reverse_preserves_total(tmp_path) -> None:
    forward = {
        "points": [
            route_point("route-point-1", 25.285447, 51.53104),
            route_point("route-point-2", 25.285447, 51.53104),
            route_point("route-point-3", 31.9539, 35.9106),
        ]
    }
    reverse = {"points": list(reversed(forward["points"]))}

    with make_client(tmp_path) as client:
        forward_payload = client.post("/api/v1/measurement/ae/route-distance", json=forward).json()
        reverse_payload = client.post("/api/v1/measurement/ae/route-distance", json=reverse).json()

    assert forward_payload["output"]["segments"][0]["distance_m"] == 0.0
    assert forward_payload["output"]["segments"][1]["distance_m"] > 0.0
    assert reverse_payload["output"]["total_distance_m"] == pytest.approx(
        forward_payload["output"]["total_distance_m"], abs=1e-6
    )
    assert [item["distance_m"] for item in reverse_payload["output"]["segments"]] == pytest.approx(
        list(reversed([item["distance_m"] for item in forward_payload["output"]["segments"]])),
        abs=1e-6,
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
def test_p6_4_invalid_route_inputs_fail_closed(tmp_path, points) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/measurement/ae/route-distance",
            json={"points": points},
        )
    assert response.status_code == 422
