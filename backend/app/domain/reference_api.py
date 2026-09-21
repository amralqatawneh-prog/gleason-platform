from __future__ import annotations

from pydantic import BaseModel, Field, field_validator, model_validator

from .reference import WGS84GeodeticPoint, WGS84RoutePoint


class GeodesicInverseRequest(BaseModel):
    start: WGS84GeodeticPoint
    end: WGS84GeodeticPoint


class WGS84PolygonRequest(BaseModel):
    polygon_id: str = Field(default="transient-polygon", min_length=1, max_length=128)
    points: list[WGS84RoutePoint] = Field(min_length=3, max_length=50)

    @field_validator("polygon_id")
    @classmethod
    def polygon_id_must_be_explicit(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError("polygon_id must be non-empty")
        return trimmed

    @model_validator(mode="after")
    def vertices_must_be_unique(self) -> "WGS84PolygonRequest":
        ids = [point.point_id for point in self.points]
        if len(ids) != len(set(ids)):
            raise ValueError("polygon point_id values must be unique")
        coordinates = [(point.latitude, point.longitude) for point in self.points]
        if len(coordinates) != len(set(coordinates)):
            raise ValueError(
                "polygon coordinates must be unique; closure from last to first is implicit"
            )
        return self


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
