from __future__ import annotations

from ..domain.projections import GeoPoint, ProjectedPoint, ProjectionResult
from ..providers.projections import AzimuthalEquidistantProvider, GleasonHistoricalProjectionProvider


_PROVIDERS = {
    "gleason-historical": GleasonHistoricalProjectionProvider(),
    "ae-north-pole": AzimuthalEquidistantProvider(),
}


def projection_metadata() -> list[dict[str, object]]:
    return [provider.metadata().model_dump() for provider in _PROVIDERS.values()]


def forward(model_id: str, point: GeoPoint) -> ProjectionResult:
    provider = _PROVIDERS.get(model_id)
    if provider is None:
        raise KeyError(model_id)
    output = provider.forward(point)
    return ProjectionResult(model_id=provider.model_id, model_version=provider.model_version, input=point, output=output, metadata=provider.metadata())


def inverse(model_id: str, point: ProjectedPoint) -> ProjectionResult:
    provider = _PROVIDERS.get(model_id)
    if provider is None:
        raise KeyError(model_id)
    output = provider.inverse(point)
    return ProjectionResult(model_id=provider.model_id, model_version=provider.model_version, input=point, output=output, metadata=provider.metadata())
