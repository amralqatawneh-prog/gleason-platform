#!/usr/bin/env python3
"""P6.6 backend/browser parity for WGS84, AE and Gleason polygon engines.

Run after `cd frontend && npm run test:core`. All coordinates are deterministic
synthetic fixtures; production place records are not used.
"""
from __future__ import annotations

import json
from pathlib import Path
import random
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.domain.measurement import AERoutePoint, GleasonRoutePoint  # noqa: E402
from app.domain.reference import WGS84RoutePoint  # noqa: E402
from app.providers.reference.wgs84 import WGS84ReferenceProvider  # noqa: E402
from app.services.measurement import ae_polygon_measurement, gleason_polygon_measurement  # noqa: E402


def make_points(vertices: list[tuple[float, float]]) -> list[dict[str, object]]:
    return [
        {
            "point_id": f"polygon-point-{index + 1}",
            "latitude": latitude,
            "longitude": longitude,
        }
        for index, (latitude, longitude) in enumerate(vertices)
    ]


def main() -> None:
    rng = random.Random(20260921)
    polygons = [
        make_points([(90, 0), (0, 0), (0, 90)]),
        make_points([(10, 179), (-10, 179), (0, -179)]),
        make_points([(89, 0), (89, 120), (89, -120)]),
        make_points([(25.285447, 51.531040), (31.9454, 35.9284), (25.273, 51.608)]),
    ]
    for _ in range(100):
        latitude = rng.uniform(-75, 75)
        longitude = rng.uniform(-160, 160)
        d_lat = rng.uniform(0.02, 0.5)
        d_lon = rng.uniform(0.02, 0.5)
        polygons.append(make_points([
            (latitude, longitude),
            (latitude + d_lat, longitude),
            (latitude, longitude + d_lon),
        ]))

    source = """
      import {localWgs84PolygonMeasurement}
        from './frontend/.phase1-test-build/measurement/wgs84Polygon.js';
      import {localAEPolygonMeasurement}
        from './frontend/.phase1-test-build/measurement/aePolygon.js';
      import {localGleasonPolygonMeasurement}
        from './frontend/.phase1-test-build/measurement/gleasonPolygon.js';
      let input=''; for await (const part of process.stdin) input+=part;
      const polygons=JSON.parse(input);
      console.log(JSON.stringify(polygons.map(points=>({
        wgs84:localWgs84PolygonMeasurement(points),
        ae:localAEPolygonMeasurement(points),
        gleason:localGleasonPolygonMeasurement(points),
      }))));
    """
    run = subprocess.run(
        ["node", "--input-type=module", "-e", source],
        cwd=ROOT,
        input=json.dumps(polygons),
        text=True,
        capture_output=True,
        check=True,
    )
    browser_results = json.loads(run.stdout)
    wgs84_provider = WGS84ReferenceProvider()

    max_deltas = {
        "wgs84_perimeter_m": 0.0,
        "wgs84_area_m2": 0.0,
        "ae_perimeter_m": 0.0,
        "ae_area_m2": 0.0,
        "gleason_perimeter_nru": 0.0,
        "gleason_area_nru2": 0.0,
    }

    for inputs, browser in zip(polygons, browser_results, strict=True):
        wgs_points = [WGS84RoutePoint(**point) for point in inputs]
        ae_points = [AERoutePoint(**point) for point in inputs]
        gleason_points = [GleasonRoutePoint(**point) for point in inputs]

        backend_wgs = wgs84_provider.polygon_measurement("transient-polygon", wgs_points).model_dump()
        backend_ae = ae_polygon_measurement("transient-polygon", ae_points).model_dump()
        backend_gleason = gleason_polygon_measurement("transient-polygon", gleason_points).model_dump()

        pairs = [
            ("wgs84", browser["wgs84"], backend_wgs, "perimeter_m", "area_m2", 1e-5, 0.1, 0.0),
            ("ae", browser["ae"], backend_ae, "perimeter_m", "area_m2", 0.1, 1.0, 5e-9),
            (
                "gleason",
                browser["gleason"],
                backend_gleason,
                "perimeter_normalized_radius_unit",
                "area_normalized_radius_unit_squared",
                1e-12,
                1e-12,
                0.0,
            ),
        ]
        for (
            name,
            actual,
            expected,
            perimeter_key,
            area_key,
            perimeter_tolerance,
            area_absolute_tolerance,
            area_relative_tolerance,
        ) in pairs:
            assert actual["output"]["method_id"] == expected["output"]["method_id"]
            assert actual["output"]["orientation"] == expected["output"]["orientation"]
            assert actual["output"]["segment_count"] == expected["output"]["segment_count"] == len(inputs)
            perimeter_delta = abs(actual["output"][perimeter_key] - expected["output"][perimeter_key])
            area_delta = abs(actual["output"][area_key] - expected["output"][area_key])
            max_deltas[
                {
                    "wgs84": "wgs84_perimeter_m",
                    "ae": "ae_perimeter_m",
                    "gleason": "gleason_perimeter_nru",
                }[name]
            ] = max(max_deltas[
                {
                    "wgs84": "wgs84_perimeter_m",
                    "ae": "ae_perimeter_m",
                    "gleason": "gleason_perimeter_nru",
                }[name]
            ], perimeter_delta)
            max_deltas[
                {
                    "wgs84": "wgs84_area_m2",
                    "ae": "ae_area_m2",
                    "gleason": "gleason_area_nru2",
                }[name]
            ] = max(max_deltas[
                {
                    "wgs84": "wgs84_area_m2",
                    "ae": "ae_area_m2",
                    "gleason": "gleason_area_nru2",
                }[name]
            ], area_delta)
            area_tolerance = max(
                area_absolute_tolerance,
                abs(expected["output"][area_key]) * area_relative_tolerance,
            )
            assert perimeter_delta < perimeter_tolerance, (
                name, inputs, perimeter_delta, perimeter_tolerance
            )
            assert area_delta < area_tolerance, (
                name, inputs, area_delta, area_tolerance
            )

    print(json.dumps({
        "status": "PASS",
        "polygon_cases": len(polygons),
        **max_deltas,
    }, indent=2))


if __name__ == "__main__":
    main()
