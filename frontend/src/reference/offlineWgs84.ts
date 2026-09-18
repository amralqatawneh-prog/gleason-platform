import GeographicLib from 'geographiclib-geodesic';
import proj4 from 'proj4';
import type { GeodesicInverseResult, ReferenceGeoInput } from '../api';

export type ECEFInput = { x_m: number; y_m: number; z_m: number };
const geographic = '+proj=longlat +datum=WGS84 +no_defs';
const geocentric = '+proj=geocent +datum=WGS84 +units=m +no_defs';

export function validateGeo(point: ReferenceGeoInput): Required<ReferenceGeoInput> {
  const height = point.ellipsoidal_height_m ?? 0;
  if (![point.latitude, point.longitude, height].every(Number.isFinite) || Math.abs(point.latitude) > 90 || Math.abs(point.longitude) > 180) {
    throw new RangeError('WGS84 requires finite coordinates, latitude [-90,90] and longitude [-180,180]');
  }
  return { latitude: point.latitude, longitude: point.longitude, ellipsoidal_height_m: height };
}

function provenance(operation: string, implementation: string, version: string, algorithm: string, units: Record<string, string>) {
  return {
    semantic_type: 'REFERENCE_RESULT' as const,
    provider_id: 'wgs84-reference', provider_version: 'WGS84-0.4.0', reference_frame: 'WGS 84',
    operation, implementation, implementation_version: version, algorithm, units,
    notes: ['Executed locally without a server. Backend PROJ parity is an acceptance gate.',
      'EPSG:4979 geographic coordinates; EPSG:4978 ECEF metres. Height is ellipsoidal, not sea-level height.',
      'Input longitude is not silently normalized.'],
  };
}

/** Independent offline implementation; never a spherical distance fallback. */
export function localGeodesicInverse(startInput: ReferenceGeoInput, endInput: ReferenceGeoInput): GeodesicInverseResult {
  const start = validateGeo(startInput), end = validateGeo(endInput);
  const inverse = GeographicLib.Geodesic.WGS84.Inverse(start.latitude, start.longitude, end.latitude, end.longitude);
  const bearing = (value: number) => ((value % 360) + 360) % 360;
  const distance = inverse.s12!;
  const identical = Math.abs(distance) <= 1e-9;
  return {
    semantic_type: 'REFERENCE_RESULT', operation: 'geodesic_inverse', input: { start, end },
    output: { distance_m: identical ? 0 : distance,
      initial_bearing_deg: identical ? null : bearing(inverse.azi1!),
      final_bearing_deg: identical ? null : bearing(inverse.azi2!),
      reverse_bearing_deg: identical ? null : bearing(inverse.azi2! + 180) },
    provenance: { ...provenance('geodesic_inverse', 'geographiclib-geodesic (browser)', '2.2.0',
      'Karney WGS84 ellipsoidal geodesic inverse', { distance: 'metres', bearings: 'degrees clockwise from true north' }),
      notes: ['Executed locally; compared against backend PROJ in acceptance tests.',
        'Surface geodesic ignores input heights. Identical-point bearings are undefined and null.',
        'Final bearing is forward arrival; reverse bearing is endpoint-to-start.'] },
  };
}

export function localGeodeticToEcef(input: ReferenceGeoInput) {
  const point = validateGeo(input);
  const [x_m, y_m, z_m] = proj4(geographic, geocentric, [point.longitude, point.latitude, point.ellipsoidal_height_m]);
  return { semantic_type: 'REFERENCE_RESULT' as const, operation: 'geodetic_to_ecef', input: point,
    output: { x_m, y_m, z_m }, provenance: provenance('geodetic_to_ecef', 'proj4js (browser)', proj4.version,
      'WGS84 geodetic to geocentric', { input_angles: 'degrees', input_height: 'metres', output: 'metres' }) };
}

export function localEcefToGeodetic(input: ECEFInput) {
  if (![input.x_m, input.y_m, input.z_m].every(Number.isFinite)) throw new RangeError('ECEF requires finite coordinates');
  if (Math.hypot(input.x_m, input.y_m, input.z_m) < 1) throw new RangeError('Geodetic position is undefined near the geocentre');
  const [longitude, latitude, ellipsoidal_height_m] = proj4(geocentric, geographic, [input.x_m, input.y_m, input.z_m]);
  return { semantic_type: 'REFERENCE_RESULT' as const, operation: 'ecef_to_geodetic', input: { ...input },
    output: { latitude, longitude, ellipsoidal_height_m }, provenance: provenance('ecef_to_geodetic', 'proj4js (browser)', proj4.version,
      'WGS84 geocentric to geodetic', { input: 'metres', output_angles: 'degrees', output_height: 'metres' }) };
}
