from __future__ import annotations

import math

import pyproj

from ..domain.measurement import (
    AERouteDistanceOutput,
    AERouteDistanceSegment,
    AERoutePoint,
    GleasonRouteDistanceOutput,
    GleasonRouteDistanceSegment,
    GleasonRoutePoint,
    MeasurementProvenance,
    MeasurementResult,
)
from ..domain.projections import GeoPoint
from ..providers.projections import AzimuthalEquidistantProvider, GleasonHistoricalProjectionProvider


_ae_provider = AzimuthalEquidistantProvider()
_gleason_provider = GleasonHistoricalProjectionProvider()


def ae_route_distance(route_id: str, points: list[AERoutePoint]) -> MeasurementResult:
    """Measure adjacent straight chords in the independent AE projected plane."""

    segments: list[AERouteDistanceSegment] = []
    distances: list[float] = []

    projected = [
        _ae_provider.forward(GeoPoint(latitude=point.latitude, longitude=point.longitude))
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
            provider_id=_ae_provider.model_id,
            provider_version=_ae_provider.model_version,
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


def gleason_route_distance(route_id: str, points: list[GleasonRoutePoint]) -> MeasurementResult:
    """Measure adjacent straight chords in the derived normalized Gleason plane."""

    segments: list[GleasonRouteDistanceSegment] = []
    distances: list[float] = []
    projected = [
        _gleason_provider.forward(GeoPoint(latitude=point.latitude, longitude=point.longitude))
        for point in points
    ]

    for index, ((start, end), (start_xy, end_xy)) in enumerate(
        zip(zip(points, points[1:]), zip(projected, projected[1:]))
    ):
        distance = math.hypot(end_xy.x - start_xy.x, end_xy.y - start_xy.y)
        if math.isclose(distance, 0.0, abs_tol=1e-15):
            distance = 0.0
        distances.append(distance)
        segments.append(
            GleasonRouteDistanceSegment(
                segment_id=f"route-segment:{start.point_id}->{end.point_id}",
                index=index,
                from_point_id=start.point_id,
                to_point_id=end.point_id,
                from_x_normalized_radius=start_xy.x,
                from_y_normalized_radius=start_xy.y,
                to_x_normalized_radius=end_xy.x,
                to_y_normalized_radius=end_xy.y,
                distance_normalized_radius_unit=distance,
            )
        )

    output = GleasonRouteDistanceOutput(
        segment_count=len(segments),
        total_distance_normalized_radius_unit=math.fsum(distances),
        segments=segments,
    )
    return MeasurementResult(
        semantic_type="COMPUTED_RESULT",
        operation="gleason_route_distance",
        input={
            "route_id": route_id,
            "points": [point.model_dump() for point in points],
        },
        output=output.model_dump(),
        provenance=MeasurementProvenance(
            semantic_type="COMPUTED_RESULT",
            provider_id=_gleason_provider.model_id,
            provider_version=_gleason_provider.model_version,
            reference_frame="WGS84 geographic input -> derived Gleason normalized-radius plane",
            operation="gleason_route_distance",
            implementation="python-math",
            implementation_version="stdlib",
            algorithm=(
                "Project each canonical geographic point with GH-0.2.0 "
                "r=(90-latitude_deg)/180 and normalized longitude angle, then "
                "measure Euclidean distance between adjacent projected coordinates"
            ),
            units={
                "projected_coordinates": "normalized-radius",
                "distance": "normalized-radius-unit",
            },
            notes=[
                "P6.5 measures straight adjacent chords in the project DERIVED Gleason reconstruction.",
                "The historical book does not print this modern analytic forward/inverse formula.",
                "Normalized-radius-unit is model-native and has no automatic metre/kilometre conversion.",
                "No WGS84 or AE distance is substituted or normalized to force agreement.",
                "Repeated coordinates are valid and contribute a zero-length segment.",
                "This is not a road, flight, WGS84-geodesic, or AE projected-plane route distance.",
            ],
        ),
    )
