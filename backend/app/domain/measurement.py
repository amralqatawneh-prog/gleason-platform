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


class MeasurementProvenance(BaseModel):
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


class MeasurementResult(BaseModel):
    semantic_type: Literal["REFERENCE_RESULT"] = "REFERENCE_RESULT"
    operation: str
    input: Any
    output: Any
    provenance: MeasurementProvenance
