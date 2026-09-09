from __future__ import annotations

from typing import Protocol

from ...domain.projections import GeoPoint, ProjectedPoint, ProjectionMetadata


class ProjectionProvider(Protocol):
    def forward(self, point: GeoPoint) -> ProjectedPoint: ...
    def inverse(self, point: ProjectedPoint) -> GeoPoint: ...
    def metadata(self) -> ProjectionMetadata: ...
