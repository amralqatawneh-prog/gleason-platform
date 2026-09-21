#!/usr/bin/env python3
"""P6.5 parity check between backend and browser Gleason measurement engines.

Run after `cd frontend && npm run test:core`. Inputs are synthetic deterministic
test coordinates; no production place record is used.
"""
from __future__ import annotations

import json
from pathlib import Path
import random
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.domain.measurement import GleasonRoutePoint  # noqa: E402
from app.services.measurement import gleason_route_distance  # noqa: E402


def main() -> None:
    rng = random.Random(20260921)
    route_coords = [
        [(90, 0), (0, 0), (0, 90)],
        [(0, 179), (0, -179)],
        [(89.999, -180), (89.999, 180)],
        [(25.285447, 51.531040), (25.285447, 51.531040), (31.9539, 35.9106)],
        [(-90, 0), (90, 0)],
        [(0, 180), (0, -180)],
    ]
    for _ in range(200):
        route_coords.append([
            (rng.uniform(-90, 90), rng.uniform(-180, 180))
            for _point in range(rng.randint(2, 8))
        ])

    routes = [
        [
            {
                "point_id": f"route-point-{index + 1}",
                "latitude": latitude,
                "longitude": longitude,
            }
            for index, (latitude, longitude) in enumerate(route)
        ]
        for route in route_coords
    ]

    source = """
      import {localGleasonRouteDistance}
        from './frontend/.phase1-test-build/measurement/gleasonRouteDistance.js';
      let input=''; for await (const part of process.stdin) input+=part;
      const routes=JSON.parse(input);
      console.log(JSON.stringify(routes.map(points=>localGleasonRouteDistance(points))));
    """
    run = subprocess.run(
        ["node", "--input-type=module", "-e", source],
        cwd=ROOT,
        input=json.dumps(routes),
        text=True,
        capture_output=True,
        check=True,
    )
    browser_results = json.loads(run.stdout)

    max_segment_delta = 0.0
    max_total_delta = 0.0
    max_coordinate_delta = 0.0
    max_historical_scale_delta = 0.0
    max_legacy_scale_delta = 0.0

    for inputs, browser in zip(routes, browser_results, strict=True):
        backend = gleason_route_distance(
            "transient-route",
            [GleasonRoutePoint(**point) for point in inputs],
        ).model_dump()
        assert browser["semantic_type"] == backend["semantic_type"] == "COMPUTED_RESULT"
        assert browser["output"]["method_id"] == backend["output"]["method_id"] == "gleason-native-normalized"
        assert browser["output"]["unit"] == backend["output"]["unit"] == "normalized-radius-unit"
        assert browser["output"]["scale_basis"] == backend["output"]["scale_basis"] == "gleason-normalized-model-radius"
        assert browser["output"]["segment_count"] == backend["output"]["segment_count"]

        for actual, expected in zip(
            browser["output"]["segments"],
            backend["output"]["segments"],
            strict=True,
        ):
            assert actual["segment_id"] == expected["segment_id"]
            delta = abs(
                actual["distance_normalized_radius_unit"]
                - expected["distance_normalized_radius_unit"]
            )
            max_segment_delta = max(max_segment_delta, delta)
            assert delta < 1e-12, (inputs, actual, expected)
            historical_delta = abs(
                actual["distance_historical_fig43_mile_derived"]
                - expected["distance_historical_fig43_mile_derived"]
            )
            legacy_delta = abs(
                actual["distance_legacy_radial60_nautical_mile"]
                - expected["distance_legacy_radial60_nautical_mile"]
            )
            max_historical_scale_delta = max(max_historical_scale_delta, historical_delta)
            max_legacy_scale_delta = max(max_legacy_scale_delta, legacy_delta)
            assert historical_delta < 1e-8, (inputs, actual, expected)
            assert legacy_delta < 1e-8, (inputs, actual, expected)
            for key in [
                "from_x_normalized_radius",
                "from_y_normalized_radius",
                "to_x_normalized_radius",
                "to_y_normalized_radius",
            ]:
                coordinate_delta = abs(actual[key] - expected[key])
                max_coordinate_delta = max(max_coordinate_delta, coordinate_delta)
                assert coordinate_delta < 1e-12, (inputs, key, actual[key], expected[key])

        total_delta = abs(
            browser["output"]["total_distance_normalized_radius_unit"]
            - backend["output"]["total_distance_normalized_radius_unit"]
        )
        max_total_delta = max(max_total_delta, total_delta)
        assert total_delta < 1e-12, (inputs, browser["output"], backend["output"])

    print(json.dumps({
        "status": "PASS",
        "route_cases": len(routes),
        "max_segment_difference_normalized_radius_unit": max_segment_delta,
        "max_total_difference_normalized_radius_unit": max_total_delta,
        "max_projected_coordinate_difference": max_coordinate_delta,
        "max_historical_fig43_scale_difference": max_historical_scale_delta,
        "max_legacy_radial60_scale_difference": max_legacy_scale_delta,
    }, indent=2))


if __name__ == "__main__":
    main()
