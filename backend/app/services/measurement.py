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


INTERNATIONAL_FOOT_METRES = 0.3048
INTERNATIONAL_NAUTICAL_MILE_METRES = 1852.0
WALTER_DEFAULT_KM_PER_NRU = 20016.0
CHAPTER17_6075FT_METRES_PER_MILE = 6075.0 * INTERNATIONAL_FOOT_METRES
FIG37_RATIO_METRES_PER_MILE = (208.0 / 180.0) * (5280.0 * INTERNATIONAL_FOOT_METRES)
CHAPTER19_6070FT_METRES_PER_MILE = 6070.0 * INTERNATIONAL_FOOT_METRES


def gleason_si_route_distance(route_id: str, points: list[GleasonRoutePoint]) -> MeasurementResult:
    """Execute P6.C2 direct-SI and explicitly labeled assumption profiles."""

    base = gleason_route_distance(route_id, points)
    output = base.output
    segments = output["segments"]

    specs = [
        {
            "profile_id": "walter-flat-plane-eq-10008",
            "source_profile_id": "walter-flat-plane-eq-10008",
            "source_class": "EXTERNAL_COMPARATIVE_MODEL",
            "evidence_level": "EXTERNAL_COMPARATIVE",
            "calculation_space": "WALTER_SI_FLAT_PLANE",
            "conversion_status": "direct-si",
            "assumption_id": None,
            "native_distance_unit": "normalized-radius-unit",
            "native_total": output["total_distance_normalized_radius_unit"],
            "native_segment_key": "distance_normalized_radius_unit",
            "metres_per_native_unit": WALTER_DEFAULT_KM_PER_NRU * 1000.0,
            "conversion_basis": (
                "Walter external comparison: E=10008 km north-pole-to-Equator, "
                "therefore 1 NRU=20016 km in the shared polar normalized geometry."
            ),
            "provenance": [
                "walter-distances-globe-flat-earth",
                "walter-globe-flat-transformations",
                "gleason-measurement-profile-contract:P6.C1-1",
            ],
            "limitations": [
                "External comparative SI model only; it is not a Gleason-book historical rule.",
                "The result preserves Walter source identity even when rendered on Gleason.",
            ],
        },
        {
            "profile_id": "fig43-circle-ch17-6075ft-assumption",
            "source_profile_id": "gleason-fig43-circle-derived-diagnostic",
            "source_class": "GLEASON_PRIMARY_HISTORICAL",
            "evidence_level": "ASSUMPTION_PROFILE",
            "calculation_space": "GLEASON_DERIVED_NORMALIZED_PLANE",
            "conversion_status": "assumption-profile",
            "assumption_id": "chapter17-nautical-6075ft-context-assumption",
            "native_distance_unit": "historical-fig43-mile",
            "native_total": output["total_distance_historical_fig43_mile_derived"],
            "native_segment_key": "distance_historical_fig43_mile_derived",
            "metres_per_native_unit": CHAPTER17_6075FT_METRES_PER_MILE,
            "conversion_basis": (
                "Explicit assumption: interpret each diagnostic Figure 43 mile as "
                "the Chapter XVII nautical/sea/Solar mile stated as 6075 feet; "
                "1 international foot=0.3048 m."
            ),
            "provenance": [
                "gleason-1893-upload-v1:Fig.43",
                "gleason-1893-upload-v1:Chapter XVII 6075-foot context",
                "gleason-measurement-unit-audit-2026-09-22",
            ],
            "limitations": [
                "The Figure 43 passage does not itself prove that its mile is the Chapter XVII 6075-foot mile.",
                "This is an explicit assumption profile, not the automatic Gleason historical SI result.",
            ],
        },
        {
            "profile_id": "fig43-circle-fig37-ratio-assumption",
            "source_profile_id": "gleason-fig43-circle-derived-diagnostic",
            "source_class": "GLEASON_PRIMARY_HISTORICAL",
            "evidence_level": "ASSUMPTION_PROFILE",
            "calculation_space": "GLEASON_DERIVED_NORMALIZED_PLANE",
            "conversion_status": "assumption-profile",
            "assumption_id": "fig37-208english-180nautical-context-assumption",
            "native_distance_unit": "historical-fig43-mile",
            "native_total": output["total_distance_historical_fig43_mile_derived"],
            "native_segment_key": "distance_historical_fig43_mile_derived",
            "metres_per_native_unit": FIG37_RATIO_METRES_PER_MILE,
            "conversion_basis": (
                "Explicit assumption: interpret each diagnostic Figure 43 mile as "
                "the nautical/geographical side of Fig.37 ratio 180 nautical/geographical "
                "= 208 English miles; English mile=5280 international feet."
            ),
            "provenance": [
                "gleason-1893-upload-v1:Figs.37-38",
                "gleason-1893-upload-v1:Fig.43",
                "gleason-measurement-unit-audit-2026-09-22",
            ],
            "limitations": [
                "The Figure 37 ratio is preserved separately because it is not numerically identical to the 6075-foot statement.",
                "This is an explicit assumption profile, not the automatic Gleason historical SI result.",
            ],
        },
        {
            "profile_id": "fig43-circle-ch19-6070ft-assumption",
            "source_profile_id": "gleason-fig43-circle-derived-diagnostic",
            "source_class": "GLEASON_PRIMARY_HISTORICAL",
            "evidence_level": "ASSUMPTION_PROFILE",
            "calculation_space": "GLEASON_DERIVED_NORMALIZED_PLANE",
            "conversion_status": "assumption-profile",
            "assumption_id": "chapter19-navigator-6070ft-context",
            "native_distance_unit": "historical-fig43-mile",
            "native_total": output["total_distance_historical_fig43_mile_derived"],
            "native_segment_key": "distance_historical_fig43_mile_derived",
            "metres_per_native_unit": CHAPTER19_6070FT_METRES_PER_MILE,
            "conversion_basis": (
                "Explicit assumption: interpret each diagnostic Figure 43 mile "
                "using the reproduced Chapter XIX navigator statement of 6070 feet "
                "per nautical mile; 1 international foot=0.3048 m."
            ),
            "provenance": [
                "gleason-1893-upload-v1:Chapter XIX navigator correspondence",
                "gleason-1893-upload-v1:Fig.43",
                "gleason-measurement-unit-audit-2026-09-22",
            ],
            "limitations": [
                "This historical statement conflicts slightly with the Chapter XVII 6075-foot statement and is not silently reconciled.",
                "This is an explicit assumption profile, not the automatic Gleason historical SI result.",
            ],
        },
        {
            "profile_id": "legacy-radial60-intl-nm-assumption",
            "source_profile_id": "gleason-radial-60nm-legacy",
            "source_class": "OWNER_SECONDARY_OBSERVED",
            "evidence_level": "ASSUMPTION_PROFILE",
            "calculation_space": "GLEASON_LEGACY_COMPARISON",
            "conversion_status": "assumption-profile",
            "assumption_id": "legacy-radial60-intl-nm-assumption",
            "native_distance_unit": "nautical-mile-legacy",
            "native_total": output["total_distance_legacy_radial60_nautical_mile"],
            "native_segment_key": "distance_legacy_radial60_nautical_mile",
            "metres_per_native_unit": INTERNATIONAL_NAUTICAL_MILE_METRES,
            "conversion_basis": (
                "Explicit comparison assumption: interpret the legacy secondary-video "
                "60-NM/radial-degree profile with the international nautical mile of 1852 m."
            ),
            "provenance": [
                "gleason-video-measurement-audit-2026-09-21",
                "international-nautical-mile-display-conversion",
            ],
            "limitations": [
                "Secondary/legacy comparison only; it is not promoted to the preferred Gleason historical result.",
                "P6.C3 must evaluate this profile against the approved fixture set before any calibration claim.",
            ],
        },
    ]

    profiles: list[dict[str, object]] = []
    for spec in specs:
        total_m = float(spec["native_total"]) * float(spec["metres_per_native_unit"])
        profile_segments: list[dict[str, object]] = []
        for segment in segments:
            segment_m = float(segment[str(spec["native_segment_key"])]) * float(
                spec["metres_per_native_unit"]
            )
            profile_segments.append(
                {
                    "segment_id": segment["segment_id"],
                    "index": segment["index"],
                    "distance_m": segment_m,
                    "distance_km": segment_m / 1000.0,
                    "distance_nmi": segment_m / INTERNATIONAL_NAUTICAL_MILE_METRES,
                }
            )
        profiles.append(
            {
                "profile_id": spec["profile_id"],
                "profile_version": "P6.C2-1",
                "source_profile_id": spec["source_profile_id"],
                "source_class": spec["source_class"],
                "evidence_level": spec["evidence_level"],
                "calculation_space": spec["calculation_space"],
                "conversion_status": spec["conversion_status"],
                "assumption_id": spec["assumption_id"],
                "native_distance_value": spec["native_total"],
                "native_distance_unit": spec["native_distance_unit"],
                "distance_m": total_m,
                "distance_km": total_m / 1000.0,
                "distance_nmi": total_m / INTERNATIONAL_NAUTICAL_MILE_METRES,
                "conversion_basis": spec["conversion_basis"],
                "provenance": spec["provenance"],
                "limitations": spec["limitations"],
                "segments": profile_segments,
            }
        )

    return MeasurementResult(
        semantic_type="COMPUTED_RESULT",
        operation="gleason_si_route_distance",
        input=base.input,
        output={
            "quantity": "distance",
            "path_semantics": "open-polyline",
            "base_method_id": "gleason-native-normalized",
            "base_distance_normalized_radius_unit": output[
                "total_distance_normalized_radius_unit"
            ],
            "profiles": profiles,
            "unavailable_profile_ids": [
                "gleason-book-historical",
                "gleason-video-ruler-calibrated",
                "gleason-raster-calibrated",
                "gleason-fig43-circle-derived-diagnostic",
            ],
        },
        provenance=MeasurementProvenance(
            semantic_type="COMPUTED_RESULT",
            provider_id="gleason-si-profiles",
            provider_version="P6.C2-1",
            reference_frame=(
                "canonical WGS84 geographic input -> profile-specific "
                "Gleason/Walter SI interpretations"
            ),
            operation="gleason_si_route_distance",
            implementation="python-math",
            implementation_version="P6.C2-1",
            algorithm=(
                "Execute only P6.C1-approved direct-SI or explicitly labeled "
                "assumption conversions over the preserved native Gleason route result; "
                "no hidden normalization or WGS84 substitution."
            ),
            units={
                "distance_m": "metre",
                "distance_km": "kilometre",
                "distance_nmi": "international-nautical-mile-display",
            },
            notes=[
                "The unresolved gleason-book-historical profile remains fail-closed for direct SI.",
                "The circle-derived diagnostic remains diagnostic; SI values derived from it are exposed only under explicit assumption profiles.",
                "Video and raster calibrated profiles remain unavailable until P6.C3 calibration evidence is versioned.",
                "Walter output remains an external comparative model and is never relabeled as Gleason historical.",
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
