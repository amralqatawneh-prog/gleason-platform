from __future__ import annotations

from enum import StrEnum

from pydantic import BaseModel, Field, field_validator


class EvidenceLevel(StrEnum):
    DOCUMENTED = "DOCUMENTED"
    DERIVED = "DERIVED"
    DISPLAY_CONVENTION = "DISPLAY_CONVENTION"
    REFERENCE = "REFERENCE"


class SourceReference(BaseModel):
    source_id: str
    locator: str
    evidence_level: EvidenceLevel
    note: str


class GeoPoint(BaseModel):
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float

    @field_validator("longitude")
    @classmethod
    def longitude_is_finite(cls, value: float) -> float:
        if not -1e9 < value < 1e9:
            raise ValueError("longitude must be finite")
        return value


class ProjectedPoint(BaseModel):
    x: float
    y: float
    units: str


class ProjectionMetadata(BaseModel):
    model_id: str
    model_version: str
    name: str
    units: str
    coordinate_datum: str
    evidence: list[SourceReference]
    limitations: list[str]


class ProjectionResult(BaseModel):
    model_id: str
    model_version: str
    input: GeoPoint | ProjectedPoint
    output: GeoPoint | ProjectedPoint
    metadata: ProjectionMetadata
