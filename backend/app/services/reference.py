from __future__ import annotations

from ..domain.reference import ECEFPoint, ReferenceResult, WGS84GeodeticPoint, WGS84RoutePoint
from ..providers.reference import WGS84ReferenceProvider


_provider = WGS84ReferenceProvider()


def reference_metadata() -> dict[str, object]:
    return _provider.metadata()


def geodetic_to_ecef(point: WGS84GeodeticPoint) -> ReferenceResult:
    return _provider.geodetic_to_ecef(point)


def ecef_to_geodetic(point: ECEFPoint) -> ReferenceResult:
    return _provider.ecef_to_geodetic(point)


def geodesic_inverse(
    start: WGS84GeodeticPoint,
    end: WGS84GeodeticPoint,
) -> ReferenceResult:
    return _provider.geodesic_inverse(start, end)


def wgs84_polygon_measurement(
    polygon_id: str,
    points: list[WGS84RoutePoint],
) -> ReferenceResult:
    return _provider.polygon_measurement(polygon_id, points)


def wgs84_route_distance(
    route_id: str,
    points: list[WGS84RoutePoint],
) -> ReferenceResult:
    return _provider.route_distance(route_id, points)
