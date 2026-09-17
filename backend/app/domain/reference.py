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
