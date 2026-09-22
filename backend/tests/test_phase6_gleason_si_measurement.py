from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def make_client(tmp_path) -> TestClient:
    settings = Settings(
        env="test",
        database_url=f"sqlite+pysqlite:///{tmp_path / 'phase6-c2-si.db'}",
        cors_origins=["https://example.test"],
    )
    return TestClient(create_app(settings))


def route_point(point_id: str, latitude: float, longitude: float) -> dict[str, object]:
    return {"point_id": point_id, "latitude": latitude, "longitude": longitude}


def test_p6_c2_si_endpoint_exposes_direct_and_assumption_profiles(tmp_path) -> None:
    with make_client(tmp_path) as client:
        response = client.post(
            "/api/v1/measurement/gleason/si-route-distance",
            json={
                "route_id": "transient-route",
                "points": [
                    route_point("A", 90.0, 0.0),
                    route_point("B", 0.0, 0.0),
                ],
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["semantic_type"] == "COMPUTED_RESULT"
    assert payload["operation"] == "gleason_si_route_distance"
    assert payload["output"]["base_method_id"] == "gleason-native-normalized"
    assert payload["output"]["base_distance_normalized_radius_unit"] == pytest.approx(0.5)

    profiles = {item["profile_id"]: item for item in payload["output"]["profiles"]}
    assert set(profiles) == {
        "walter-flat-plane-eq-10008",
        "fig43-circle-ch17-6075ft-assumption",
        "fig43-circle-fig37-ratio-assumption",
        "fig43-circle-ch19-6070ft-assumption",
        "legacy-radial60-intl-nm-assumption",
    }

    walter = profiles["walter-flat-plane-eq-10008"]
    assert walter["conversion_status"] == "direct-si"
    assert walter["source_class"] == "EXTERNAL_COMPARATIVE_MODEL"
    assert walter["calculation_space"] == "WALTER_SI_FLAT_PLANE"
    assert walter["assumption_id"] is None
    assert walter["distance_km"] == pytest.approx(10008.0)

    for profile_id in [
        "fig43-circle-ch17-6075ft-assumption",
        "fig43-circle-fig37-ratio-assumption",
        "fig43-circle-ch19-6070ft-assumption",
        "legacy-radial60-intl-nm-assumption",
    ]:
        assert profiles[profile_id]["conversion_status"] == "assumption-profile"
        assert profiles[profile_id]["evidence_level"] == "ASSUMPTION_PROFILE"
        assert profiles[profile_id]["assumption_id"] is not None

    assert profiles["fig43-circle-ch17-6075ft-assumption"]["calculation_space"] == "GLEASON_DERIVED_NORMALIZED_PLANE"
    assert profiles["fig43-circle-fig37-ratio-assumption"]["calculation_space"] == "GLEASON_DERIVED_NORMALIZED_PLANE"
    assert profiles["fig43-circle-ch19-6070ft-assumption"]["calculation_space"] == "GLEASON_DERIVED_NORMALIZED_PLANE"
    assert profiles["legacy-radial60-intl-nm-assumption"]["calculation_space"] == "GLEASON_LEGACY_COMPARISON"


def test_p6_c2_unresolved_historical_profile_stays_fail_closed(tmp_path) -> None:
    with make_client(tmp_path) as client:
        payload = client.post(
            "/api/v1/measurement/gleason/si-route-distance",
            json={
                "points": [
                    route_point("A", 25.0, 50.0),
                    route_point("B", 30.0, 40.0),
                ],
            },
        ).json()

    assert payload["output"]["unavailable_profile_ids"] == [
        "gleason-book-historical",
        "gleason-video-ruler-calibrated",
        "gleason-raster-calibrated",
        "gleason-fig43-circle-derived-diagnostic",
    ]
    assert all(
        profile["profile_id"] != "gleason-book-historical"
        for profile in payload["output"]["profiles"]
    )
    assert any(
        "unresolved gleason-book-historical" in note
        for note in payload["provenance"]["notes"]
    )


def test_p6_c2_segment_totals_and_reverse_route_are_stable(tmp_path) -> None:
    forward = {
        "points": [
            route_point("A", 25.285447, 51.53104),
            route_point("B", 31.9539, 35.9106),
            route_point("C", 40.0, 10.0),
        ]
    }
    reverse = {"points": list(reversed(forward["points"]))}

    with make_client(tmp_path) as client:
        forward_payload = client.post("/api/v1/measurement/gleason/si-route-distance", json=forward).json()
        reverse_payload = client.post("/api/v1/measurement/gleason/si-route-distance", json=reverse).json()

    forward_profiles = {item["profile_id"]: item for item in forward_payload["output"]["profiles"]}
    reverse_profiles = {item["profile_id"]: item for item in reverse_payload["output"]["profiles"]}

    for profile_id, profile in forward_profiles.items():
        assert sum(segment["distance_m"] for segment in profile["segments"]) == pytest.approx(
            profile["distance_m"], abs=1e-6
        )
        assert reverse_profiles[profile_id]["distance_m"] == pytest.approx(
            profile["distance_m"], abs=1e-6
        )
