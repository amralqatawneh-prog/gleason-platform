from __future__ import annotations

import math

import pytest
from pydantic import ValidationError

from app.domain.reference import ECEFPoint, WGS84GeodeticPoint
from app.providers.reference import WGS84ReferenceProvider


@pytest.fixture(scope="module")
def provider() -> WGS84ReferenceProvider:
    return WGS84ReferenceProvider()


def test_metadata_is_independent_reference_provider(provider: WGS84ReferenceProvider) -> None:
    metadata = provider.metadata()
    assert metadata["model_id"] == "wgs84-reference"
    assert metadata["model_version"] == "WGS84-0.4.0"
    assert metadata["geographic_crs"] == "EPSG:4979"
    assert metadata["ecef_crs"] == "EPSG:4978"
    assert metadata["semantic_type"] == "REFERENCE_RESULT"


def test_longitude_normalization_is_explicit(provider: WGS84ReferenceProvider) -> None:
    assert provider.normalize_longitude(181.0) == pytest.approx(-179.0)
    assert provider.normalize_longitude(-181.0) == pytest.approx(179.0)
    assert provider.normalize_longitude(540.0) == pytest.approx(-180.0)
    with pytest.raises(ValueError):
        provider.normalize_longitude(math.inf)


def test_geodetic_validation_rejects_out_of_domain_longitude() -> None:
    with pytest.raises(ValidationError):
        WGS84GeodeticPoint(latitude=0.0, longitude=181.0, ellipsoidal_height_m=0.0)


def test_geodetic_to_ecef_equator_prime_meridian(provider: WGS84ReferenceProvider) -> None:
    result = provider.geodetic_to_ecef(
        WGS84GeodeticPoint(latitude=0.0, longitude=0.0, ellipsoidal_height_m=0.0)
    )
    output = result.output
    assert output["x_m"] == pytest.approx(6378137.0, abs=1e-6)
    assert output["y_m"] == pytest.approx(0.0, abs=1e-6)
    assert output["z_m"] == pytest.approx(0.0, abs=1e-6)
    assert result.semantic_type == "REFERENCE_RESULT"
    assert result.provenance.semantic_type == "REFERENCE_RESULT"


def test_geodetic_to_ecef_north_pole(provider: WGS84ReferenceProvider) -> None:
    result = provider.geodetic_to_ecef(
        WGS84GeodeticPoint(latitude=90.0, longitude=0.0, ellipsoidal_height_m=0.0)
    )
    output = result.output
    assert output["x_m"] == pytest.approx(0.0, abs=1e-6)
    assert output["y_m"] == pytest.approx(0.0, abs=1e-6)
    assert output["z_m"] == pytest.approx(6356752.314245179, abs=1e-6)


def test_ecef_round_trip(provider: WGS84ReferenceProvider) -> None:
    original = WGS84GeodeticPoint(
        latitude=25.285447,
        longitude=51.531040,
        ellipsoidal_height_m=42.5,
    )
    ecef_result = provider.geodetic_to_ecef(original)
    ecef = ECEFPoint(**ecef_result.output)
    round_trip = provider.ecef_to_geodetic(ecef)
    output = round_trip.output
    assert output["latitude"] == pytest.approx(original.latitude, abs=1e-9)
    assert output["longitude"] == pytest.approx(original.longitude, abs=1e-9)
    assert output["ellipsoidal_height_m"] == pytest.approx(original.ellipsoidal_height_m, abs=1e-5)


def test_geodesic_equatorial_degree(provider: WGS84ReferenceProvider) -> None:
    start = WGS84GeodeticPoint(latitude=0.0, longitude=0.0)
    end = WGS84GeodeticPoint(latitude=0.0, longitude=1.0)
    result = provider.geodesic_inverse(start, end)
    output = result.output
    assert output["distance_m"] == pytest.approx(111319.49079327357, abs=1e-6)
    assert output["initial_bearing_deg"] == pytest.approx(90.0, abs=1e-12)
    assert output["final_bearing_deg"] == pytest.approx(90.0, abs=1e-12)
    assert output["reverse_bearing_deg"] == pytest.approx(270.0, abs=1e-12)


def test_geodesic_quarter_meridian(provider: WGS84ReferenceProvider) -> None:
    start = WGS84GeodeticPoint(latitude=0.0, longitude=0.0)
    end = WGS84GeodeticPoint(latitude=90.0, longitude=0.0)
    result = provider.geodesic_inverse(start, end)
    assert result.output["distance_m"] == pytest.approx(10001965.729312724, abs=1e-6)
    assert result.output["initial_bearing_deg"] == pytest.approx(0.0, abs=1e-12)


def test_identical_points_have_zero_distance_and_no_bearing(
    provider: WGS84ReferenceProvider,
) -> None:
    point = WGS84GeodeticPoint(latitude=12.5, longitude=-44.0, ellipsoidal_height_m=10.0)
    result = provider.geodesic_inverse(point, point)
    assert result.output["distance_m"] == 0.0
    assert result.output["initial_bearing_deg"] is None
    assert result.output["final_bearing_deg"] is None
    assert result.output["reverse_bearing_deg"] is None


def test_reference_provenance_is_complete(provider: WGS84ReferenceProvider) -> None:
    result = provider.geodesic_inverse(
        WGS84GeodeticPoint(latitude=25.0, longitude=51.0),
        WGS84GeodeticPoint(latitude=40.0, longitude=-74.0),
    )
    provenance = result.provenance
    assert provenance.semantic_type == "REFERENCE_RESULT"
    assert provenance.provider_id == "wgs84-reference"
    assert provenance.provider_version == "WGS84-0.4.0"
    assert provenance.reference_frame == "WGS 84"
    assert provenance.operation == "geodesic_inverse"
    assert provenance.implementation == "pyproj"
    assert provenance.implementation_version
    assert provenance.algorithm
    assert provenance.units["distance"] == "metres"
