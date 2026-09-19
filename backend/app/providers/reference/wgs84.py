from __future__ import annotations

import math
from collections.abc import Mapping

import pyproj
from pyproj import Geod, Transformer

from ...domain.reference import (
    ECEFPoint,
    GeodesicInverseOutput,
    ReferenceProvenance,
    ReferenceResult,
    WGS84GeodeticPoint,
)


class WGS84ReferenceProvider:
    """Independent modern geodetic reference provider for Phase 4.

    This provider is deliberately separate from the Gleason Historical and AE
    visualization providers. Backend calculations are authoritative; rendering
    layers must not substitute their own geodesy for these results.
    """

    MODEL_ID = "wgs84-reference"
    MODEL_VERSION = "WGS84-0.4.0"
    GEOGRAPHIC_CRS = "EPSG:4979"
    ECEF_CRS = "EPSG:4978"
    REFERENCE_FRAME = "WGS 84"

    def __init__(self) -> None:
        self._to_ecef = Transformer.from_crs(
            self.GEOGRAPHIC_CRS,
            self.ECEF_CRS,
            always_xy=True,
        )
        self._to_geodetic = Transformer.from_crs(
            self.ECEF_CRS,
            self.GEOGRAPHIC_CRS,
            always_xy=True,
        )
        self._geod = Geod(ellps="WGS84")

    @staticmethod
    def normalize_longitude(longitude: float) -> float:
        """Explicitly normalize a finite longitude to [-180, 180).

        No other provider operation silently normalizes longitude. This makes
        antimeridian behavior reproducible and visible to callers.
        """
        if not math.isfinite(longitude):
            raise ValueError("longitude must be finite")
        return ((longitude + 180.0) % 360.0) - 180.0

    @staticmethod
    def _bearing_360(value: float) -> float:
        normalized = value % 360.0
        # Avoid emitting 360 because the result contract is [0, 360).
        return 0.0 if math.isclose(normalized, 360.0, abs_tol=1e-12) else normalized

    def metadata(self) -> dict[str, object]:
        return {
            "model_id": self.MODEL_ID,
            "model_version": self.MODEL_VERSION,
            "name": "WGS84 Reference Model",
            "reference_frame": self.REFERENCE_FRAME,
            "geographic_crs": self.GEOGRAPHIC_CRS,
            "ecef_crs": self.ECEF_CRS,
            "ellipsoid": "WGS84",
            "implementation": "pyproj",
            "implementation_version": pyproj.__version__,
            "semantic_type": "REFERENCE_RESULT",
            "longitude_policy": (
                "input longitude must already be within [-180, 180]; explicit "
                "normalize_longitude() maps arbitrary finite values to [-180, 180)"
            ),
            "limitations": [
                "Ellipsoidal height is referenced to the WGS84 ellipsoid, not a geoid/mean-sea-level model.",
                "This provider does not perform cross-model synchronization or astronomy.",
            ],
        }

    def _provenance(
        self,
        *,
        operation: str,
        algorithm: str,
        units: dict[str, str],
        notes: list[str] | None = None,
    ) -> ReferenceProvenance:
        return ReferenceProvenance(
            provider_id=self.MODEL_ID,
            provider_version=self.MODEL_VERSION,
            reference_frame=self.REFERENCE_FRAME,
            operation=operation,
            implementation="pyproj",
            implementation_version=pyproj.__version__,
            algorithm=algorithm,
            units=units,
            notes=notes or [],
        )

    def geodetic_to_ecef(self, point: WGS84GeodeticPoint) -> ReferenceResult:
        x_m, y_m, z_m = self._to_ecef.transform(
            point.longitude,
            point.latitude,
            point.ellipsoidal_height_m,
        )
        output = ECEFPoint(x_m=x_m, y_m=y_m, z_m=z_m)
        return ReferenceResult(
            operation="geodetic_to_ecef",
            input=point.model_dump(),
            output=output.model_dump(),
            provenance=self._provenance(
                operation="geodetic_to_ecef",
                algorithm="PROJ CRS transformation EPSG:4979 -> EPSG:4978",
                units={
                    "input_angles": "degrees",
                    "input_height": "metres",
                    "output": "metres",
                },
                notes=["Longitude is not silently normalized."],
            ),
        )

    def ecef_to_geodetic(self, point: ECEFPoint | Mapping[str, float]) -> ReferenceResult:
        """Convert ECEF to geodetic coordinates.

        ``ReferenceResult.output`` is intentionally JSON-ready. Accepting either an
        ``ECEFPoint`` or its serialized mapping lets callers safely chain
        ``geodetic_to_ecef(...).output`` into this operation without reconstructing
        the domain object manually.
        """
        ecef_point = ECEFPoint.model_validate(point)
        longitude, latitude, height_m = self._to_geodetic.transform(
            ecef_point.x_m,
            ecef_point.y_m,
            ecef_point.z_m,
        )
        # PROJ may choose +180; the schema permits both antimeridian spellings.
        output = WGS84GeodeticPoint(
            latitude=latitude,
            longitude=longitude,
            ellipsoidal_height_m=height_m,
        )
        return ReferenceResult(
            operation="ecef_to_geodetic",
            input=ecef_point.model_dump(),
            output=output.model_dump(),
            provenance=self._provenance(
                operation="ecef_to_geodetic",
                algorithm="PROJ CRS transformation EPSG:4978 -> EPSG:4979",
                units={"input": "metres", "output_angles": "degrees", "output_height": "metres"},
                notes=["Output height is ellipsoidal height, not orthometric height."],
            ),
        )

    def geodesic_inverse(
        self,
        start: WGS84GeodeticPoint,
        end: WGS84GeodeticPoint,
    ) -> ReferenceResult:
        azimuth_forward, azimuth_back, distance_m = self._geod.inv(
            start.longitude,
            start.latitude,
            end.longitude,
            end.latitude,
        )

        if math.isclose(distance_m, 0.0, abs_tol=1e-9):
            output = GeodesicInverseOutput(
                distance_m=0.0,
                initial_bearing_deg=None,
                final_bearing_deg=None,
                reverse_bearing_deg=None,
            )
        else:
            reverse = self._bearing_360(azimuth_back)
            output = GeodesicInverseOutput(
                distance_m=distance_m,
                initial_bearing_deg=self._bearing_360(azimuth_forward),
                # pyproj/PROJ returns the back azimuth at the endpoint. The
                # forward continuation on arrival is 180 degrees opposite.
                final_bearing_deg=self._bearing_360(azimuth_back + 180.0),
                reverse_bearing_deg=reverse,
            )

        return ReferenceResult(
            operation="geodesic_inverse",
            input={"start": start.model_dump(), "end": end.model_dump()},
            output=output.model_dump(),
            provenance=self._provenance(
                operation="geodesic_inverse",
                algorithm="PROJ/GeographicLib-compatible WGS84 ellipsoidal geodesic inverse",
                units={"distance": "metres", "bearings": "degrees clockwise from true north"},
                notes=[
                    "reverse_bearing_deg is the endpoint-to-start azimuth.",
                    "final_bearing_deg is the forward arrival direction and is reverse bearing + 180 degrees modulo 360.",
                    "Bearings are null for identical points because direction is undefined.",
                ],
            ),
        )
