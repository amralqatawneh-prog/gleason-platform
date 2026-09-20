from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def make_client(tmp_path) -> TestClient:
    settings = Settings(
        env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'phase6-route-distance.db'}",
        cors_origins=["https://example.test"],
    )
    return TestClient(create_app(settings))


def route_point(point_id: str, latitude: float, longitude: float) -> dict[str, object]:
    return {"point_id": point_id, "latitude": latitude, "longitude": longitude}


def test_p6_3_wgs84_open_polyline_returns_segments_total_and_identity(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/route-distance",
            json={
                "route_id": "transient-route",
                "points": [
                    route_point("route-point-1", 0.0, 0.0),
                    route_point("route-point-2", 0.0, 1.0),
                    route_point("route-point-3", 0.0, 2.0),
                ],
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["semantic_type"] == "REFERENCE_RESULT"
    assert payload["operation"] == "wgs84_route_distance"
    assert payload["output"]["method_id"] == "wgs84-geodesic"
    assert payload["output"]["quantity"] == "distance"
    assert payload["output"]["unit"] == "metre"
    assert payload["output"]["scale_basis"] == "wgs84-ellipsoid"
    assert payload["output"]["path_semantics"] == "open-polyline"
    assert payload["output"]["segment_count"] == 2
    assert payload["output"]["segments"][0]["segment_id"] == (
        "route-segment:route-point-1->route-point-2"
    )
    assert payload["output"]["segments"][1]["segment_id"] == (
        "route-segment:route-point-2->route-point-3"
    )
    assert payload["output"]["segments"][0]["distance_m"] == pytest.approx(
        111319.49079327357, abs=1e-6
    )
    assert payload["output"]["segments"][1]["distance_m"] == pytest.approx(
        111319.49079327357, abs=1e-6
    )
    assert payload["output"]["total_distance_m"] == pytest.approx(
        222638.98158654713, abs=1e-6
    )
    assert payload["provenance"]["implementation"] == "pyproj"
    assert payload["provenance"]["units"]["distance"] == "metres"
    assert any("no unknown height is invented" in note for note in payload["provenance"]["notes"])


def test_p6_3_antimeridian_segment_uses_short_wgs84_geodesic(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/route-distance",
            json={
                "points": [
                    route_point("route-point-1", 0.0, 179.0),
                    route_point("route-point-2", 0.0, -179.0),
                ],
            },
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["output"]["segments"][0]["distance_m"] == pytest.approx(
        222638.98158654713, abs=1e-6
    )
    assert payload["output"]["total_distance_m"] == pytest.approx(
        222638.98158654713, abs=1e-6
    )


def test_p6_3_repeated_coordinate_is_explicit_zero_length_segment(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/route-distance",
            json={
                "points": [
                    route_point("route-point-1", 25.0, 51.0),
                    route_point("route-point-2", 25.0, 51.0),
                    route_point("route-point-3", 26.0, 52.0),
                ],
            },
        )
    assert response.status_code == 200
    payload = response.json()
    assert payload["output"]["segments"][0]["distance_m"] == 0.0
    assert payload["output"]["segments"][1]["distance_m"] > 0.0
    assert payload["output"]["total_distance_m"] == pytest.approx(
        payload["output"]["segments"][1]["distance_m"], abs=1e-9
    )


def test_p6_3_reversed_route_preserves_total_distance(tmp_path) -> None:
    forward = {
        "points": [
            route_point("route-point-1", 25.285447, 51.53104),
            route_point("route-point-2", 31.9539, 35.9106),
            route_point("route-point-3", 40.7128, -74.0060),
        ],
    }
    reverse = {
        "points": [
            route_point("route-point-3", 40.7128, -74.0060),
            route_point("route-point-2", 31.9539, 35.9106),
            route_point("route-point-1", 25.285447, 51.53104),
        ],
    }
    with make_client(tmp_path) as client:
        forward_payload = client.post(
            "/api/v1/reference/wgs84/route-distance", json=forward
        ).json()
        reverse_payload = client.post(
            "/api/v1/reference/wgs84/route-distance", json=reverse
        ).json()

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
    ],
)
def test_p6_3_invalid_route_inputs_fail_closed(tmp_path, points) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/route-distance",
            json={"points": points},
        )
    assert response.status_code == 422
