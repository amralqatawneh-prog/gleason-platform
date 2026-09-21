from __future__ import annotations

import math
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class WGS84GeodeticPoint(BaseModel):
    """WGS84 geographic coordinate with ellipsoidal height.

    Longitude is intentionally constrained to the canonical [-180, 180] domain.
    Values outside that domain are never silently normalized; callers must invoke
    the provider's explicit longitude-normalization operation first.
    """

    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)
    ellipsoidal_height_m: float = 0.0

    @field_validator("latitude", "longitude", "ellipsoidal_height_m")
    @classmethod
    def values_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("coordinate values must be finite")
        return value


class ECEFPoint(BaseModel):
    x_m: float
    y_m: float
    z_m: float

    @field_validator("x_m", "y_m", "z_m")
    @classmethod
    def values_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("ECEF values must be finite")
        return value


class GeodesicInverseOutput(BaseModel):
    distance_m: float = Field(ge=0.0)
    initial_bearing_deg: float | None = Field(default=None, ge=0.0, lt=360.0)
    final_bearing_deg: float | None = Field(default=None, ge=0.0, lt=360.0)
    reverse_bearing_deg: float | None = Field(default=None, ge=0.0, lt=360.0)


class WGS84RoutePoint(BaseModel):
    """Explicit WGS84 latitude/longitude route point for surface distance.

    Height is intentionally absent: P6.3 measures the ellipsoidal surface
    geodesic and must not invent an unknown ellipsoidal height.
    """

    point_id: str = Field(min_length=1, max_length=128)
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)

    @field_validator("point_id")
    @classmethod
    def point_id_must_be_explicit(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("point_id must be non-empty")
        return trimmed

    @field_validator("latitude", "longitude")
    @classmethod
    def route_coordinates_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("route coordinate values must be finite")
        return value


class WGS84RouteDistanceSegment(BaseModel):
    segment_id: str
    index: int = Field(ge=0)
    from_point_id: str
    to_point_id: str
    distance_m: float = Field(ge=0.0)


class WGS84RouteDistanceOutput(BaseModel):
    method_id: Literal["wgs84-geodesic"] = "wgs84-geodesic"
    quantity: Literal["distance"] = "distance"
    unit: Literal["metre"] = "metre"
    scale_basis: Literal["wgs84-ellipsoid"] = "wgs84-ellipsoid"
    path_semantics: Literal["open-polyline"] = "open-polyline"
    segment_count: int = Field(ge=1)
    total_distance_m: float = Field(ge=0.0)
    segments: list[WGS84RouteDistanceSegment]


class WGS84PolygonSegment(BaseModel):
    edge_id: str
    index: int = Field(ge=0)
    from_point_id: str
    to_point_id: str
    distance_m: float = Field(ge=0.0)


class WGS84PolygonOutput(BaseModel):
    method_id: Literal["wgs84-geodesic"] = "wgs84-geodesic"
    quantities: list[Literal["perimeter", "area"]] = Field(
        default_factory=lambda: ["perimeter", "area"]
    )
    perimeter_unit: Literal["metre"] = "metre"
    area_unit: Literal["square-metre"] = "square-metre"
    scale_basis: Literal["wgs84-ellipsoid"] = "wgs84-ellipsoid"
    path_semantics: Literal["closed-polygon"] = "closed-polygon"
    closure_semantics: Literal["implicit-last-to-first"] = "implicit-last-to-first"
    self_intersection_policy: Literal["algebraic-signed-area"] = "algebraic-signed-area"
    interior_rule: Literal["signed-half-surface-range"] = "signed-half-surface-range"
    orientation: Literal["counterclockwise", "clockwise"]
    segment_count: int = Field(ge=3)
    perimeter_m: float = Field(ge=0.0)
    signed_area_m2: float
    area_m2: float = Field(gt=0.0)
    segments: list[WGS84PolygonSegment]


class ReferenceProvenance(BaseModel):
    semantic_type: Literal["REFERENCE_RESULT"] = "REFERENCE_RESULT"
    provider_id: str
    provider_version: str
    reference_frame: str
    operation: str
    implementation: str
    implementation_version: str
    algorithm: str
    units: dict[str, str]
    notes: list[str] = Field(default_factory=list)


class ReferenceResult(BaseModel):
    semantic_type: Literal["REFERENCE_RESULT"] = "REFERENCE_RESULT"
    operation: str
    input: Any
    output: Any
    provenance: ReferenceProvenance
