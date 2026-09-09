from __future__ import annotations

import math

from ...domain.projections import (
    EvidenceLevel,
    GeoPoint,
    ProjectedPoint,
    ProjectionMetadata,
    SourceReference,
)


def normalize_longitude(longitude: float) -> float:
    value = (longitude + 180.0) % 360.0 - 180.0
    if value == -180.0 and longitude > 0:
        return 180.0
    return value


class GleasonHistoricalProjectionProvider:
    """Source-grounded normalized reconstruction of Gleason's circular map geometry.

    The book does not print an analytic forward/inverse formula. This provider is a
    DERIVED reconstruction from its description of radial latitude arms, the circular
    longitude/time dial, and Figure 43's straight/diverging longitude rule.
    """

    model_id = "gleason-historical"
    model_version = "GH-0.2.0"
    units = "normalized-radius"

    def forward(self, point: GeoPoint) -> ProjectedPoint:
        radius = (90.0 - point.latitude) / 180.0
        theta = math.radians(normalize_longitude(point.longitude))
        return ProjectedPoint(
            x=radius * math.sin(theta),
            y=-radius * math.cos(theta),
            units=self.units,
        )

    def inverse(self, point: ProjectedPoint) -> GeoPoint:
        if point.units != self.units:
            raise ValueError(f"expected units={self.units}")
        radius = math.hypot(point.x, point.y)
        if radius > 1.0 + 1e-12:
            raise ValueError("point lies outside the historical map circumference")
        if radius < 1e-15:
            return GeoPoint(latitude=90.0, longitude=0.0)
        latitude = 90.0 - 180.0 * radius
        longitude = normalize_longitude(math.degrees(math.atan2(point.x, -point.y)))
        return GeoPoint(latitude=latitude, longitude=longitude)

    @staticmethod
    def historical_longitude_degree_miles(latitude: float) -> float:
        if latitude < -90.0 or latitude > 90.0:
            raise ValueError("latitude must be in [-90, 90]")
        return 60.0 - (2.0 / 3.0) * latitude

    def metadata(self) -> ProjectionMetadata:
        return ProjectionMetadata(
            model_id=self.model_id,
            model_version=self.model_version,
            name="Gleason Historical circular reconstruction",
            units=self.units,
            coordinate_datum="WGS84 input coordinates; historical output is normalized",
            evidence=[
                SourceReference(
                    source_id="gleason-1893-upload-v1",
                    locator="PDF pp. 376-377 / printed pp. 349-350, Chapter XVII",
                    evidence_level=EvidenceLevel.DOCUMENTED,
                    note=(
                        "Source describes a circular map with a 24-hour time dial and two "
                        "radiating arms from center to circumference stamped with latitude."
                    ),
                ),
                SourceReference(
                    source_id="gleason-1893-upload-v1",
                    locator="PDF p. 429 / printed p. 402, Fig. 43",
                    evidence_level=EvidenceLevel.DOCUMENTED,
                    note=(
                        "Source states longitude lines are straight and continue diverging "
                        "southward at the same ratio, with 3 1/3 miles per five latitude degrees."
                    ),
                ),
                SourceReference(
                    source_id="application-convention",
                    locator="GH-0.2.0",
                    evidence_level=EvidenceLevel.DISPLAY_CONVENTION,
                    note="Prime meridian is rendered at the top; this fixes rotation only.",
                ),
            ],
            limitations=[
                "The book does not print this analytic forward/inverse formula.",
                "Normalized radius is a reconstruction for computation, not a physical scale.",
                "No historical scan control points are silently substituted for missing imagery.",
            ],
        )
