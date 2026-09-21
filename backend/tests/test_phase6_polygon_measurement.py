from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def make_client(tmp_path) -> TestClient:
    settings = Settings(
        env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'phase6-polygon.db'}",
        cors_origins=["https://example.test"],
    )
    return TestClient(create_app(settings))


def point(point_id: str, latitude: float, longitude: float) -> dict[str, object]:
    return {"point_id": point_id, "latitude": latitude, "longitude": longitude}


@pytest.mark.parametrize(
    ("path", "semantic_type", "method_id"),
    [
        ("/api/v1/reference/wgs84/polygon", "REFERENCE_RESULT", "wgs84-geodesic"),
        ("/api/v1/measurement/ae/polygon", "REFERENCE_RESULT", "ae-projected-plane"),
        ("/api/v1/measurement/gleason/polygon", "COMPUTED_RESULT", "gleason-native-normalized"),
    ],
)
def test_p6_6_closed_polygon_identity_and_implicit_closure(
    tmp_path, path: str, semantic_type: str, method_id: str
) -> None:
    payload = {
        "polygon_id": "transient-polygon",
        "points": [
            point("A", 90.0, 0.0),
            point("B", 0.0, 0.0),
            point("C", 0.0, 90.0),
        ],
    }
    with make_client(tmp_path) as client:
        response = client.post(path, json=payload)

    assert response.status_code == 200, response.text
    result = response.json()
    assert result["semantic_type"] == semantic_type
    assert result["output"]["method_id"] == method_id
    assert result["output"]["quantities"] == ["perimeter", "area"]
    assert result["output"]["path_semantics"] == "closed-polygon"
    assert result["output"]["closure_semantics"] == "implicit-last-to-first"
    assert result["output"]["self_intersection_policy"] == "algebraic-signed-area"
    assert result["output"]["segment_count"] == 3
    assert result["output"]["segments"][-1]["to_point_id"] == "A"


def test_p6_6_wgs84_reference_triangle_has_geodesic_area_and_perimeter(tmp_path) -> None:
    with make_client(tmp_path) as client:
        result = client.post(
            "/api/v1/reference/wgs84/polygon",
            json={
                "points": [
                    point("A", 90.0, 0.0),
                    point("B", 0.0, 0.0),
                    point("C", 0.0, 90.0),
                ]
            },
        ).json()

    assert result["output"]["orientation"] == "counterclockwise"
    assert result["output"]["perimeter_m"] == pytest.approx(30022685.630020067, abs=1e-6)
    assert result["output"]["area_m2"] == pytest.approx(63758202715511.055, abs=0.1)
    assert result["output"]["signed_area_m2"] > 0


def test_p6_6_gleason_triangle_has_native_normalized_area_without_si_conversion(tmp_path) -> None:
    with make_client(tmp_path) as client:
        result = client.post(
            "/api/v1/measurement/gleason/polygon",
            json={
                "points": [
                    point("A", 90.0, 0.0),
                    point("B", 0.0, 0.0),
                    point("C", 0.0, 90.0),
                ]
            },
        ).json()

    assert result["output"]["perimeter_unit"] == "normalized-radius-unit"
    assert result["output"]["area_unit"] == "normalized-radius-unit-squared"
    assert result["output"]["perimeter_normalized_radius_unit"] == pytest.approx(
        1.0 + 2 ** -0.5, abs=1e-15
    )
    assert result["output"]["area_normalized_radius_unit_squared"] == pytest.approx(0.125)
    assert "metre" not in result["output"]["area_unit"]


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/reference/wgs84/polygon",
        "/api/v1/measurement/ae/polygon",
        "/api/v1/measurement/gleason/polygon",
    ],
)
def test_p6_6_reversed_ring_preserves_primary_quantities_and_flips_sign(tmp_path, path: str) -> None:
    forward_points = [
        point("A", 25.285447, 51.53104),
        point("B", 31.9539, 35.9106),
        point("C", 40.7128, -74.006),
    ]
    with make_client(tmp_path) as client:
        forward = client.post(path, json={"points": forward_points}).json()["output"]
        reverse = client.post(path, json={"points": list(reversed(forward_points))}).json()["output"]

    if "perimeter_m" in forward:
        assert reverse["perimeter_m"] == pytest.approx(forward["perimeter_m"], abs=1e-6)
        assert reverse["area_m2"] == pytest.approx(forward["area_m2"], abs=0.1)
        assert reverse["signed_area_m2"] == pytest.approx(-forward["signed_area_m2"], abs=0.1)
    else:
        assert reverse["perimeter_normalized_radius_unit"] == pytest.approx(
            forward["perimeter_normalized_radius_unit"], abs=1e-15
        )
        assert reverse["area_normalized_radius_unit_squared"] == pytest.approx(
            forward["area_normalized_radius_unit_squared"], abs=1e-15
        )
        assert reverse["signed_area_normalized_radius_unit_squared"] == pytest.approx(
            -forward["signed_area_normalized_radius_unit_squared"], abs=1e-15
        )
    assert reverse["orientation"] != forward["orientation"]


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/reference/wgs84/polygon",
        "/api/v1/measurement/ae/polygon",
        "/api/v1/measurement/gleason/polygon",
    ],
)
def test_p6_6_repeated_explicit_closure_fails_closed(tmp_path, path: str) -> None:
    payload = {
        "points": [
            point("A", 0.0, 0.0),
            point("B", 0.0, 1.0),
            point("C", 1.0, 0.0),
            point("D", 0.0, 0.0),
        ]
    }
    with make_client(tmp_path) as client:
        response = client.post(path, json=payload)
    assert response.status_code == 422


def test_p6_6_wgs84_collinear_geodesic_ring_fails_closed(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/reference/wgs84/polygon",
            json={
                "points": [
                    point("A", 0.0, 0.0),
                    point("B", 0.0, 1.0),
                    point("C", 0.0, 2.0),
                ]
            },
        )
    assert response.status_code == 422
