from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..domain.reference import ECEFPoint, WGS84GeodeticPoint
from ..domain.reference_api import GeodesicInverseRequest, WGS84PolygonRequest, WGS84RouteDistanceRequest
from ..services.reference import (
    ecef_to_geodetic,
    geodesic_inverse,
    geodetic_to_ecef,
    reference_metadata,
    wgs84_polygon_measurement,
    wgs84_route_distance,
)

router = APIRouter()


@router.get("/models/reference/wgs84", tags=["reference"])
def wgs84_metadata() -> dict[str, object]:
    return reference_metadata()


@router.post("/reference/wgs84/geodetic-to-ecef", tags=["reference"])
def wgs84_geodetic_to_ecef(point: WGS84GeodeticPoint) -> dict[str, object]:
    return geodetic_to_ecef(point).model_dump()


@router.post("/reference/wgs84/ecef-to-geodetic", tags=["reference"])
def wgs84_ecef_to_geodetic(point: ECEFPoint) -> dict[str, object]:
    return ecef_to_geodetic(point).model_dump()


@router.post("/reference/wgs84/geodesic-inverse", tags=["reference"])
def wgs84_geodesic_inverse(request: GeodesicInverseRequest) -> dict[str, object]:
    return geodesic_inverse(request.start, request.end).model_dump()


@router.post("/reference/wgs84/route-distance", tags=["reference", "measurement"])
def wgs84_route_distance_endpoint(request: WGS84RouteDistanceRequest) -> dict[str, object]:
    return wgs84_route_distance(request.route_id, request.points).model_dump()


@router.post("/reference/wgs84/polygon", tags=["reference", "measurement"])
def wgs84_polygon_endpoint(request: WGS84PolygonRequest) -> dict[str, object]:
    try:
        return wgs84_polygon_measurement(request.polygon_id, request.points).model_dump()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
