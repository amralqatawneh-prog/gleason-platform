from __future__ import annotations

import math
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class AERoutePoint(BaseModel):
    """Canonical geographic route point projected into the independent AE plane."""

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
    def coordinates_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("route coordinate values must be finite")
        return value


class AERouteDistanceRequest(BaseModel):
    route_id: str = Field(default="transient-route", min_length=1, max_length=128)
    points: list[AERoutePoint] = Field(min_length=2, max_length=50)

    @field_validator("route_id")
    @classmethod
    def route_id_must_be_explicit(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("route_id must be non-empty")
        return trimmed

    @model_validator(mode="after")
    def point_ids_must_be_unique(self) -> "AERouteDistanceRequest":
        ids = [point.point_id for point in self.points]
        if len(ids) != len(set(ids)):
            raise ValueError("route point_id values must be unique")
        return self


class AERouteDistanceSegment(BaseModel):
    segment_id: str
    index: int = Field(ge=0)
    from_point_id: str
    to_point_id: str
    from_x_m: float
    from_y_m: float
    to_x_m: float
    to_y_m: float
    distance_m: float = Field(ge=0.0)


class AERouteDistanceOutput(BaseModel):
    method_id: Literal["ae-projected-plane"] = "ae-projected-plane"
    quantity: Literal["distance"] = "distance"
    unit: Literal["metre"] = "metre"
    scale_basis: Literal["ae-projected-plane-si-metre"] = "ae-projected-plane-si-metre"
    path_semantics: Literal["open-polyline"] = "open-polyline"
    segment_geometry: Literal["straight-projected-chord"] = "straight-projected-chord"
    segment_count: int = Field(ge=1)
    total_distance_m: float = Field(ge=0.0)
    segments: list[AERouteDistanceSegment]


class GleasonRoutePoint(BaseModel):
    """Canonical geographic route point projected into the derived Gleason plane."""

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
    def coordinates_must_be_finite(cls, value: float) -> float:
        if not math.isfinite(value):
            raise ValueError("route coordinate values must be finite")
        return value


class GleasonRouteDistanceRequest(BaseModel):
    route_id: str = Field(default="transient-route", min_length=1, max_length=128)
    points: list[GleasonRoutePoint] = Field(min_length=2, max_length=50)

    @field_validator("route_id")
    @classmethod
    def route_id_must_be_explicit(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("route_id must be non-empty")
        return trimmed

    @model_validator(mode="after")
    def point_ids_must_be_unique(self) -> "GleasonRouteDistanceRequest":
        ids = [point.point_id for point in self.points]
        if len(ids) != len(set(ids)):
            raise ValueError("route point_id values must be unique")
        return self


class GleasonRouteDistanceSegment(BaseModel):
    segment_id: str
    index: int = Field(ge=0)
    from_point_id: str
    to_point_id: str
    from_x_normalized_radius: float
    from_y_normalized_radius: float
    to_x_normalized_radius: float
    to_y_normalized_radius: float
    distance_normalized_radius_unit: float = Field(ge=0.0)
    distance_map_ruler_nautical_mile_derived: float = Field(ge=0.0)


class GleasonRouteDistanceOutput(BaseModel):
    method_id: Literal["gleason-native-normalized"] = "gleason-native-normalized"
    quantity: Literal["distance"] = "distance"
    unit: Literal["normalized-radius-unit"] = "normalized-radius-unit"
    scale_basis: Literal["gleason-normalized-model-radius"] = "gleason-normalized-model-radius"
    path_semantics: Literal["open-polyline"] = "open-polyline"
    segment_geometry: Literal["straight-projected-chord"] = "straight-projected-chord"
    segment_count: int = Field(ge=1)
    total_distance_normalized_radius_unit: float = Field(ge=0.0)
    map_ruler_method_id: Literal["gleason-map-ruler-derived"] = "gleason-map-ruler-derived"
    map_ruler_unit: Literal["nautical-mile-derived"] = "nautical-mile-derived"
    map_ruler_scale_basis: Literal[
        "60-nautical-miles-per-radial-latitude-degree"
    ] = "60-nautical-miles-per-radial-latitude-degree"
    map_ruler_evidence_level: Literal["DERIVED"] = "DERIVED"
    total_distance_map_ruler_nautical_mile_derived: float = Field(ge=0.0)
    segments: list[GleasonRouteDistanceSegment]


class AEPolygonMeasurementRequest(BaseModel):
    polygon_id: str = Field(default="transient-polygon", min_length=1, max_length=128)
    points: list[AERoutePoint] = Field(min_length=3, max_length=50)

    @field_validator("polygon_id")
    @classmethod
    def polygon_id_must_be_explicit(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("polygon_id must be non-empty")
        return trimmed

    @model_validator(mode="after")
    def vertices_must_be_unique(self) -> "AEPolygonMeasurementRequest":
        ids = [point.point_id for point in self.points]
        if len(ids) != len(set(ids)):
            raise ValueError("polygon point_id values must be unique")
        coordinates = [(point.latitude, point.longitude) for point in self.points]
        if len(coordinates) != len(set(coordinates)):
            raise ValueError(
                "polygon coordinates must be unique; closure from last to first is implicit"
            )
        return self


class AEPolygonSegment(BaseModel):
    edge_id: str
    index: int = Field(ge=0)
    from_point_id: str
    to_point_id: str
    from_x_m: float
    from_y_m: float
    to_x_m: float
    to_y_m: float
    distance_m: float = Field(ge=0.0)


class AEPolygonOutput(BaseModel):
    method_id: Literal["ae-projected-plane"] = "ae-projected-plane"
    quantities: list[Literal["perimeter", "area"]] = Field(
        default_factory=lambda: ["perimeter", "area"]
    )
    perimeter_unit: Literal["metre"] = "metre"
    area_unit: Literal["square-metre"] = "square-metre"
    scale_basis: Literal["ae-projected-plane-si-metre"] = "ae-projected-plane-si-metre"
    path_semantics: Literal["closed-polygon"] = "closed-polygon"
    closure_semantics: Literal["implicit-last-to-first"] = "implicit-last-to-first"
    self_intersection_policy: Literal["algebraic-signed-area"] = "algebraic-signed-area"
    interior_rule: Literal["absolute-algebraic-planar-area"] = "absolute-algebraic-planar-area"
    orientation: Literal["counterclockwise", "clockwise"]
    segment_geometry: Literal["straight-projected-chord"] = "straight-projected-chord"
    segment_count: int = Field(ge=3)
    perimeter_m: float = Field(ge=0.0)
    signed_area_m2: float
    area_m2: float = Field(gt=0.0)
    segments: list[AEPolygonSegment]


class GleasonPolygonMeasurementRequest(BaseModel):
    polygon_id: str = Field(default="transient-polygon", min_length=1, max_length=128)
    points: list[GleasonRoutePoint] = Field(min_length=3, max_length=50)

    @field_validator("polygon_id")
    @classmethod
    def polygon_id_must_be_explicit(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("polygon_id must be non-empty")
        return trimmed

    @model_validator(mode="after")
    def vertices_must_be_unique(self) -> "GleasonPolygonMeasurementRequest":
        ids = [point.point_id for point in self.points]
        if len(ids) != len(set(ids)):
            raise ValueError("polygon point_id values must be unique")
        coordinates = [(point.latitude, point.longitude) for point in self.points]
        if len(coordinates) != len(set(coordinates)):
            raise ValueError(
                "polygon coordinates must be unique; closure from last to first is implicit"
            )
        return self


class GleasonPolygonSegment(BaseModel):
    edge_id: str
    index: int = Field(ge=0)
    from_point_id: str
    to_point_id: str
    from_x_normalized_radius: float
    from_y_normalized_radius: float
    to_x_normalized_radius: float
    to_y_normalized_radius: float
    distance_normalized_radius_unit: float = Field(ge=0.0)


class GleasonPolygonOutput(BaseModel):
    method_id: Literal["gleason-native-normalized"] = "gleason-native-normalized"
    quantities: list[Literal["perimeter", "area"]] = Field(
        default_factory=lambda: ["perimeter", "area"]
    )
    perimeter_unit: Literal["normalized-radius-unit"] = "normalized-radius-unit"
    area_unit: Literal["normalized-radius-unit-squared"] = "normalized-radius-unit-squared"
    scale_basis: Literal["gleason-normalized-model-radius"] = "gleason-normalized-model-radius"
    path_semantics: Literal["closed-polygon"] = "closed-polygon"
    closure_semantics: Literal["implicit-last-to-first"] = "implicit-last-to-first"
    self_intersection_policy: Literal["algebraic-signed-area"] = "algebraic-signed-area"
    interior_rule: Literal["absolute-algebraic-planar-area"] = "absolute-algebraic-planar-area"
    orientation: Literal["counterclockwise", "clockwise"]
    segment_geometry: Literal["straight-projected-chord"] = "straight-projected-chord"
    segment_count: int = Field(ge=3)
    perimeter_normalized_radius_unit: float = Field(ge=0.0)
    signed_area_normalized_radius_unit_squared: float
    area_normalized_radius_unit_squared: float = Field(gt=0.0)
    map_ruler_method_id: Literal["gleason-map-ruler-derived"] = "gleason-map-ruler-derived"
    map_ruler_evidence_level: Literal["DERIVED"] = "DERIVED"
    perimeter_map_ruler_nautical_mile_derived: float = Field(ge=0.0)
    area_map_ruler_nautical_mile_squared_derived: float = Field(gt=0.0)
    segments: list[GleasonPolygonSegment]


class MeasurementProvenance(BaseModel):
    semantic_type: Literal["REFERENCE_RESULT", "COMPUTED_RESULT"] = "REFERENCE_RESULT"
    provider_id: str
    provider_version: str
    reference_frame: str
    operation: str
    implementation: str
    implementation_version: str
    algorithm: str
    units: dict[str, str]
    notes: list[str] = Field(default_factory=list)


class MeasurementResult(BaseModel):
    semantic_type: Literal["REFERENCE_RESULT", "COMPUTED_RESULT"] = "REFERENCE_RESULT"
    operation: str
    input: Any
    output: Any
    provenance: MeasurementProvenance
