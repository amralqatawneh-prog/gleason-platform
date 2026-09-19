from __future__ import annotations

from ..domain.reference import ECEFPoint, ReferenceResult, WGS84GeodeticPoint
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
