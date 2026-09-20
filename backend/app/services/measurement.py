from __future__ import annotations

import math

import pyproj

from ..domain.measurement import (
    AERouteDistanceOutput,
    AERouteDistanceSegment,
    AERoutePoint,
    MeasurementProvenance,
    MeasurementResult,
)
from ..providers.projections import AzimuthalEquidistantProvider


_provider = AzimuthalEquidistantProvider()


def ae_route_distance(route_id: str, points: list[AERoutePoint]) -> MeasurementResult:
    """Measure adjacent straight chords in the independent AE projected plane."""

    segments: list[AERouteDistanceSegment] = []
    distances: list[float] = []

    projected = [
        _provider.forward(
            __import__("app.domain.projections", fromlist=["GeoPoint"]).GeoPoint(
                latitude=point.latitude,
                longitude=point.longitude,
            )
        )
        for point in points
    ]

    for index, ((start, end), (start_xy, end_xy)) in enumerate(
        zip(zip(points, points[1:]), zip(projected, projected[1:]))
    ):
        distance = math.hypot(end_xy.x - start_xy.x, end_xy.y - start_xy.y)
        if math.isclose(distance, 0.0, abs_tol=1e-9):
            distance = 0.0
        distances.append(distance)
        segments.append(
            AERouteDistanceSegment(
                segment_id=f"route-segment:{start.point_id}->{end.point_id}",
                index=index,
                from_point_id=start.point_id,
                to_point_id=end.point_id,
                from_x_m=start_xy.x,
                from_y_m=start_xy.y,
                to_x_m=end_xy.x,
                to_y_m=end_xy.y,
                distance_m=distance,
            )
        )

    output = AERouteDistanceOutput(
        segment_count=len(segments),
        total_distance_m=math.fsum(distances),
        segments=segments,
    )
    return MeasurementResult(
        operation="ae_route_distance",
        input={
            "route_id": route_id,
            "points": [point.model_dump() for point in points],
        },
        output=output.model_dump(),
        provenance=MeasurementProvenance(
            provider_id=_provider.model_id,
            provider_version=_provider.model_version,
            reference_frame="WGS84 geographic input -> north-polar AE projected plane",
            operation="ae_route_distance",
            implementation="pyproj",
            implementation_version=pyproj.__version__,
            algorithm=(
                "PROJ north-polar azimuthal equidistant forward projection for each "
                "canonical geographic point, then Euclidean distance between adjacent "
                "projected coordinates"
            ),
            units={"projected_coordinates": "metres", "distance": "metres"},
            notes=[
                "P6.4 measures straight adjacent chords in the AE projected plane.",
                "Projected-plane metres are not relabeled as WGS84 ellipsoidal geodesic distance.",
                "Projection distortion is part of this method and depends on route position/orientation.",
                "The azimuthal equidistant projection preserves radial distance from the north-pole center, not arbitrary pairwise surface distance.",
                "Repeated coordinates are valid and contribute a zero-length segment.",
                "This is not a road, flight, WGS84-geodesic, or Gleason-native route distance.",
            ],
        ),
    )
