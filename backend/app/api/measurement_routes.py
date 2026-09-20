from __future__ import annotations

from fastapi import APIRouter

from ..domain.measurement import AERouteDistanceRequest
from ..services.measurement import ae_route_distance

router = APIRouter()


@router.post("/measurement/ae/route-distance", tags=["measurement"])
def ae_route_distance_endpoint(request: AERouteDistanceRequest) -> dict[str, object]:
    return ae_route_distance(request.route_id, request.points).model_dump()
