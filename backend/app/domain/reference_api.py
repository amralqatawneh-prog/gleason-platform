from __future__ import annotations

from pydantic import BaseModel

from .reference import WGS84GeodeticPoint


class GeodesicInverseRequest(BaseModel):
    start: WGS84GeodeticPoint
    end: WGS84GeodeticPoint
