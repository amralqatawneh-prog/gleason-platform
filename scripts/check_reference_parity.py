#!/usr/bin/env python3
"""Compare the shipped browser implementation with the authoritative backend.

Run after `cd frontend && npm run test:core` in an environment with the backend
installed. All random inputs are seeded, synthetic test inputs, not place data.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
import random
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.domain.reference import WGS84GeodeticPoint, WGS84RoutePoint  # noqa: E402
from app.providers.reference.wgs84 import WGS84ReferenceProvider  # noqa: E402


def main() -> None:
    rng = random.Random(20260918)
    anchors = [(0, 0), (90, 0), (-90, 0), (0, 180), (0, -180),
               (25.285447, 51.531040), (31.9454, 35.9284), (45, 0), (89.99999, -179.99999)]
    points = [dict(latitude=lat, longitude=lon, ellipsoidal_height_m=h)
              for lat, lon in anchors for h in [0, -430, 10000]]
    pairs = [dict(start=points[i], end=points[j]) for i in range(0, len(points), 3)
             for j in range(0, len(points), 3)]
    pairs += [dict(start=dict(latitude=0, longitude=0), end=dict(latitude=0.0001, longitude=179.9999))]
    for _ in range(1000):
        pairs.append(dict(start=dict(latitude=rng.uniform(-90, 90), longitude=rng.uniform(-180, 180)),
                          end=dict(latitude=rng.uniform(-90, 90), longitude=rng.uniform(-180, 180))))
    route_coords = [
        [(0, 0), (0, 1), (0, 2)],
        [(0, 179), (0, -179)],
        [(89.9, 0), (89.9, 90), (89.9, 180)],
        [(25.285447, 51.531040), (25.285447, 51.531040), (31.9539, 35.9106)],
        [(40.7128, -74.0060), (31.9539, 35.9106), (25.285447, 51.531040)],
    ]
    for _ in range(100):
        route_coords.append([
            (rng.uniform(-90, 90), rng.uniform(-180, 180))
            for _point in range(rng.randint(2, 8))
        ])
    routes = [
        [
            dict(point_id=f"route-point-{index + 1}", latitude=lat, longitude=lon)
            for index, (lat, lon) in enumerate(route)
        ]
        for route in route_coords
    ]

    source = """
      import {localGeodesicInverse, localGeodeticToEcef, localEcefToGeodetic}
        from './frontend/.phase1-test-build/reference/offlineWgs84.js';
      import {localWgs84RouteDistance}
        from './frontend/.phase1-test-build/measurement/wgs84RouteDistance.js';
      let input=''; for await (const part of process.stdin) input+=part;
      const data=JSON.parse(input);
      console.log(JSON.stringify({pairs:data.pairs.map(p=>localGeodesicInverse(p.start,p.end)),
        routes:data.routes.map(points=>localWgs84RouteDistance(points)),
        points:data.points.map(p=>{const forward=localGeodeticToEcef(p);return {forward,back:localEcefToGeodetic(forward.output)}})}));
    """
    run = subprocess.run(["node", "--input-type=module", "-e", source], cwd=ROOT,
                         input=json.dumps(dict(points=points, pairs=pairs, routes=routes)), text=True, capture_output=True, check=True)
    actual = json.loads(run.stdout)
    provider = WGS84ReferenceProvider()
    max_distance = max_route_segment = max_route_total = max_bearing = max_ecef = max_lat = max_height = 0.0
    for inputs, browser in zip(pairs, actual["pairs"], strict=True):
        expected = provider.geodesic_inverse(WGS84GeodeticPoint(**inputs["start"]), WGS84GeodeticPoint(**inputs["end"])).output
        assert browser["semantic_type"] == "REFERENCE_RESULT"
        output = browser["output"]
        delta = abs(output["distance_m"] - expected["distance_m"])
        max_distance = max(max_distance, delta)
        assert delta < 1e-5, (inputs, output, expected)
        for key in ["initial_bearing_deg", "final_bearing_deg", "reverse_bearing_deg"]:
            if expected[key] is None:
                assert output[key] is None
            else:
                difference = abs((output[key] - expected[key] + 180) % 360 - 180)
                max_bearing = max(max_bearing, difference)
                assert difference < 1e-8, (inputs, key, difference)
    for inputs, browser in zip(routes, actual["routes"], strict=True):
        backend_points = [WGS84RoutePoint(**point) for point in inputs]
        expected = provider.route_distance("transient-route", backend_points).output
        output = browser["output"]
        assert output["method_id"] == "wgs84-geodesic"
        assert output["unit"] == "metre"
        assert output["path_semantics"] == "open-polyline"
        assert output["segment_count"] == expected["segment_count"]
        assert len(output["segments"]) == len(expected["segments"])
        for browser_segment, backend_segment in zip(output["segments"], expected["segments"], strict=True):
            assert browser_segment["segment_id"] == backend_segment["segment_id"]
            delta = abs(browser_segment["distance_m"] - backend_segment["distance_m"])
            max_route_segment = max(max_route_segment, delta)
            assert delta < 1e-5, (inputs, browser_segment, backend_segment)
        total_delta = abs(output["total_distance_m"] - expected["total_distance_m"])
        max_route_total = max(max_route_total, total_delta)
        assert total_delta < 1e-5, (inputs, output["total_distance_m"], expected["total_distance_m"])

    for inputs, browser in zip(points, actual["points"], strict=True):
        expected = provider.geodetic_to_ecef(WGS84GeodeticPoint(**inputs)).output
        actual_ecef = browser["forward"]["output"]
        delta = max(abs(actual_ecef[key] - expected[key]) for key in expected)
        max_ecef = max(max_ecef, delta)
        assert delta < 1e-6
        back = browser["back"]["output"]
        backend_back = provider.ecef_to_geodetic(actual_ecef).output
        max_lat = max(max_lat, abs(back["latitude"] - backend_back["latitude"]))
        max_height = max(max_height, abs(back["ellipsoidal_height_m"] - backend_back["ellipsoidal_height_m"]))
        assert abs(back["latitude"] - inputs["latitude"]) < 1e-8
        assert abs(back["ellipsoidal_height_m"] - inputs["ellipsoidal_height_m"]) < 1e-5
        assert abs(back["latitude"] - backend_back["latitude"]) < 1e-8
        assert abs(back["ellipsoidal_height_m"] - backend_back["ellipsoidal_height_m"]) < 1e-5
        if abs(inputs["latitude"]) < 90:
            assert abs((back["longitude"] - inputs["longitude"] + 180) % 360 - 180) < 1e-8
        assert all(math.isfinite(value) for value in back.values())
    print(json.dumps(dict(status="PASS", geodesic_cases=len(pairs), route_cases=len(routes),
                         ecef_roundtrips=len(points), max_distance_difference_m=max_distance,
                         max_route_segment_difference_m=max_route_segment,
                         max_route_total_difference_m=max_route_total,
                         max_bearing_difference_deg=max_bearing, max_ecef_difference_m=max_ecef,
                         max_inverse_lat_difference_deg=max_lat,
                         max_inverse_height_difference_m=max_height), indent=2))


if __name__ == "__main__":
    main()
