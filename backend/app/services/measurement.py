from __future__ import annotations

import math

import pyproj

from ..domain.measurement import (
    AEPolygonOutput,
    AEPolygonSegment,
    AERouteDistanceOutput,
    AERouteDistanceSegment,
    AERoutePoint,
    GleasonPolygonOutput,
    GleasonPolygonSegment,
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
                distance_historical_fig43_mile_derived=(
                    distance
                    * _gleason_provider.historical_fig43_miles_per_normalized_radius_unit
                ),
                distance_legacy_radial60_nautical_mile=(
                    distance
                    * _gleason_provider.legacy_radial60_nautical_miles_per_normalized_radius_unit
                ),
            )
        )

    total_normalized = math.fsum(distances)
    output = GleasonRouteDistanceOutput(
        segment_count=len(segments),
        total_distance_normalized_radius_unit=total_normalized,
        total_distance_historical_fig43_mile_derived=(
            total_normalized
            * _gleason_provider.historical_fig43_miles_per_normalized_radius_unit
        ),
        total_distance_legacy_radial60_nautical_mile=(
            total_normalized
            * _gleason_provider.legacy_radial60_nautical_miles_per_normalized_radius_unit
        ),
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



def ae_polygon_measurement(polygon_id: str, points: list[AERoutePoint]) -> MeasurementResult:
    """Measure a closed ring in the independent AE projected plane."""

    projected = [
        _ae_provider.forward(GeoPoint(latitude=point.latitude, longitude=point.longitude))
        for point in points
    ]
    segments: list[AEPolygonSegment] = []
    lengths: list[float] = []
    cross_terms: list[float] = []

    for index, start in enumerate(points):
        end_index = (index + 1) % len(points)
        end = points[end_index]
        start_xy = projected[index]
        end_xy = projected[end_index]
        distance = math.hypot(end_xy.x - start_xy.x, end_xy.y - start_xy.y)
        if math.isclose(distance, 0.0, abs_tol=1e-9):
            distance = 0.0
        lengths.append(distance)
        cross_terms.append(start_xy.x * end_xy.y - end_xy.x * start_xy.y)
        segments.append(
            AEPolygonSegment(
                edge_id=f"polygon-edge:{start.point_id}->{end.point_id}",
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

    signed_area = math.fsum(cross_terms) / 2.0
    if not math.isfinite(signed_area) or math.isclose(signed_area, 0.0, abs_tol=1e-6):
        raise ValueError("AE polygon area is zero or numerically degenerate")
    output = AEPolygonOutput(
        orientation="counterclockwise" if signed_area > 0 else "clockwise",
        segment_count=len(segments),
        perimeter_m=math.fsum(lengths),
        signed_area_m2=signed_area,
        area_m2=abs(signed_area),
        segments=segments,
    )
    return MeasurementResult(
        operation="ae_polygon_measurement",
        input={
            "polygon_id": polygon_id,
            "points": [point.model_dump() for point in points],
        },
        output=output.model_dump(),
        provenance=MeasurementProvenance(
            provider_id=_ae_provider.model_id,
            provider_version=_ae_provider.model_version,
            reference_frame="WGS84 geographic input -> north-polar AE projected plane",
            operation="ae_polygon_measurement",
            implementation="pyproj + python-math",
            implementation_version=pyproj.__version__,
            algorithm=(
                "PROJ north-polar AE forward projection; Euclidean closed-edge "
                "perimeter; signed shoelace area"
            ),
            units={
                "projected_coordinates": "metres",
                "perimeter": "metres",
                "area": "square metres",
            },
            notes=[
                "P6.6 closes the ring implicitly from the last explicit vertex to the first.",
                "Self-intersecting rings use algebraic signed shoelace accumulation.",
                "Projected-plane metres and square metres are not relabeled as WGS84 ellipsoidal quantities.",
                "Projection distortion is part of this method.",
            ],
        ),
    )


def gleason_polygon_measurement(
    polygon_id: str,
    points: list[GleasonRoutePoint],
) -> MeasurementResult:
    """Measure a closed ring in the derived normalized Gleason plane."""

    projected = [
        _gleason_provider.forward(GeoPoint(latitude=point.latitude, longitude=point.longitude))
        for point in points
    ]
    segments: list[GleasonPolygonSegment] = []
    lengths: list[float] = []
    cross_terms: list[float] = []

    for index, start in enumerate(points):
        end_index = (index + 1) % len(points)
        end = points[end_index]
        start_xy = projected[index]
        end_xy = projected[end_index]
        distance = math.hypot(end_xy.x - start_xy.x, end_xy.y - start_xy.y)
        if math.isclose(distance, 0.0, abs_tol=1e-15):
            distance = 0.0
        lengths.append(distance)
        cross_terms.append(start_xy.x * end_xy.y - end_xy.x * start_xy.y)
        segments.append(
            GleasonPolygonSegment(
                edge_id=f"polygon-edge:{start.point_id}->{end.point_id}",
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

    signed_area = math.fsum(cross_terms) / 2.0
    if not math.isfinite(signed_area) or math.isclose(signed_area, 0.0, abs_tol=1e-15):
        raise ValueError("Gleason polygon area is zero or numerically degenerate")
    perimeter_normalized = math.fsum(lengths)
    historical_scale = _gleason_provider.historical_fig43_miles_per_normalized_radius_unit
    legacy_scale = _gleason_provider.legacy_radial60_nautical_miles_per_normalized_radius_unit
    output = GleasonPolygonOutput(
        orientation="counterclockwise" if signed_area > 0 else "clockwise",
        segment_count=len(segments),
        perimeter_normalized_radius_unit=perimeter_normalized,
        signed_area_normalized_radius_unit_squared=signed_area,
        area_normalized_radius_unit_squared=abs(signed_area),
        perimeter_historical_fig43_mile_derived=perimeter_normalized * historical_scale,
        area_historical_fig43_mile_squared_derived=abs(signed_area) * historical_scale**2,
        perimeter_legacy_radial60_nautical_mile=perimeter_normalized * legacy_scale,
        area_legacy_radial60_nautical_mile_squared=abs(signed_area) * legacy_scale**2,
        segments=segments,
    )
    return MeasurementResult(
        semantic_type="COMPUTED_RESULT",
        operation="gleason_polygon_measurement",
        input={
            "polygon_id": polygon_id,
            "points": [point.model_dump() for point in points],
        },
        output=output.model_dump(),
        provenance=MeasurementProvenance(
            semantic_type="COMPUTED_RESULT",
            provider_id=_gleason_provider.model_id,
            provider_version=_gleason_provider.model_version,
            reference_frame="WGS84 geographic input -> derived Gleason normalized-radius plane",
            operation="gleason_polygon_measurement",
            implementation="python-math",
            implementation_version="P6.6-v1",
            algorithm=(
                "GH-0.2.0 forward projection; Euclidean closed-edge perimeter; "
                "signed shoelace area"
            ),
            units={
                "projected_coordinates": "normalized-radius",
                "perimeter": "normalized-radius-unit",
                "area": "normalized-radius-unit-squared",
            },
            notes=[
                "P6.6 closes the ring implicitly from the last explicit vertex to the first.",
                "Self-intersecting rings use algebraic signed shoelace accumulation.",
                "The analytic reconstruction is project-derived, not claimed as a verbatim printed historical formula.",
                "No SI perimeter/area conversion exists without a separately documented scale rule.",
            ],
        ),
    )
