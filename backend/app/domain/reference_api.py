from __future__ import annotations

from pydantic import BaseModel, Field, field_validator, model_validator

from .reference import WGS84GeodeticPoint, WGS84RoutePoint


class GeodesicInverseRequest(BaseModel):
    start: WGS84GeodeticPoint
    end: WGS84GeodeticPoint


class WGS84RouteDistanceRequest(BaseModel):
    route_id: str = Field(default="transient-route", min_length=1, max_length=128)
    points: list[WGS84RoutePoint] = Field(min_length=2, max_length=50)

    @field_validator("route_id")
    @classmethod
    def route_id_must_be_explicit(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("route_id must be non-empty")
        return trimmed

    @model_validator(mode="after")
    def point_ids_must_be_unique(self) -> "WGS84RouteDistanceRequest":
        ids = [point.point_id for point in self.points]
        if len(ids) != len(set(ids)):
            raise ValueError("route point_id values must be unique")
        return self
