from __future__ import annotations

from fastapi import APIRouter

from ..domain.measurement import AERouteDistanceRequest, GleasonRouteDistanceRequest
from ..services.measurement import ae_route_distance, gleason_route_distance

router = APIRouter()


@router.post("/measurement/ae/route-distance", tags=["measurement"])
def ae_route_distance_endpoint(request: AERouteDistanceRequest) -> dict[str, object]:
    return ae_route_distance(request.route_id, request.points).model_dump()


@router.post("/measurement/gleason/route-distance", tags=["measurement"])
def gleason_route_distance_endpoint(request: GleasonRouteDistanceRequest) -> dict[str, object]:
    return gleason_route_distance(request.route_id, request.points).model_dump()
