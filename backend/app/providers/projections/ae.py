from __future__ import annotations

from pyproj import CRS, Transformer

from ...domain.projections import EvidenceLevel, GeoPoint, ProjectedPoint, ProjectionMetadata, SourceReference


class AzimuthalEquidistantProvider:
    model_id = "ae-north-pole"
    model_version = "AE-0.2.0"
    units = "metre"

    def __init__(self) -> None:
        self._crs = CRS.from_proj4("+proj=aeqd +lat_0=90 +lon_0=0 +datum=WGS84 +units=m +no_defs")
        self._forward = Transformer.from_crs("EPSG:4326", self._crs, always_xy=True)
        self._inverse = Transformer.from_crs(self._crs, "EPSG:4326", always_xy=True)

    def forward(self, point: GeoPoint) -> ProjectedPoint:
        x, y = self._forward.transform(point.longitude, point.latitude)
        return ProjectedPoint(x=x, y=y, units=self.units)

    def inverse(self, point: ProjectedPoint) -> GeoPoint:
        if point.units != self.units:
            raise ValueError(f"expected units={self.units}")
        lon, lat = self._inverse.transform(point.x, point.y)
        return GeoPoint(latitude=lat, longitude=lon)

    def metadata(self) -> ProjectionMetadata:
        return ProjectionMetadata(
            model_id=self.model_id,
            model_version=self.model_version,
            name="North-polar Azimuthal Equidistant reference",
            units=self.units,
            coordinate_datum="WGS84",
            evidence=[SourceReference(source_id="PROJ/pyproj", locator="+proj=aeqd +lat_0=90 +lon_0=0 +datum=WGS84", evidence_level=EvidenceLevel.REFERENCE, note="Independent modern AE engine; not attributed to Gleason.")],
            limitations=["This modern reference projection is kept separate from the historical provider."],
        )
