from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..domain.measurement import (
    AEPolygonMeasurementRequest,
    AERouteDistanceRequest,
    GleasonPolygonMeasurementRequest,
    GleasonRouteDistanceRequest,
)
from ..services.measurement import (
    ae_polygon_measurement,
    ae_route_distance,
    gleason_polygon_measurement,
    gleason_route_distance,
)

router = APIRouter()


@router.post("/measurement/ae/route-distance", tags=["measurement"])
def ae_route_distance_endpoint(request: AERouteDistanceRequest) -> dict[str, object]:
    return ae_route_distance(request.route_id, request.points).model_dump()


@router.post("/measurement/gleason/route-distance", tags=["measurement"])
def gleason_route_distance_endpoint(request: GleasonRouteDistanceRequest) -> dict[str, object]:
    return gleason_route_distance(request.route_id, request.points).model_dump()



@router.post("/measurement/ae/polygon", tags=["measurement"])
def ae_polygon_endpoint(request: AEPolygonMeasurementRequest) -> dict[str, object]:
    try:
        return ae_polygon_measurement(request.polygon_id, request.points).model_dump()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/measurement/gleason/polygon", tags=["measurement"])
def gleason_polygon_endpoint(request: GleasonPolygonMeasurementRequest) -> dict[str, object]:
    try:
        return gleason_polygon_measurement(request.polygon_id, request.points).model_dump()
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
