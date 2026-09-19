import { localGeodeticToEcef, localEcefToGeodetic } from '../../reference/offlineWgs84.js';
import { AdapterInputError, result, validateCoordinate, validatePosition, type AdapterMetadata, type ModelAdapter, type EcefCoordinate } from './contract.js';

const metadata: AdapterMetadata = Object.freeze({
  modelId: 'wgs84-reference', modelVersion: 'WGS84-0.4.0', units: 'metre',
  semanticType: 'REFERENCE_RESULT', evidenceLevel: 'REFERENCE', heightPolicy: 'required-ellipsoidal-metres',
  domain: 'EPSG:4979 geographic degrees [-90,90]/[-180,180] with explicit height; EPSG:4978 finite ECEF outside 1 metre of geocentre.',
  evidence: Object.freeze([Object.freeze({ sourceId: 'PROJ/proj4js', locator: 'EPSG:4979 ↔ EPSG:4978', evidenceLevel: 'REFERENCE' as const,
    note: 'Existing independent offline WGS84 provider; backend PROJ parity remains the acceptance reference.' })]),
  limitations: Object.freeze(['Ellipsoidal height is not orthometric or sea-level height.',
    'Missing height is rejected, never silently set to zero by this adapter.',
    'Longitude at the polar axis is undefined; inverse uses display convention 0 degrees.',
    'Local ECEF conversion does not replace backend authoritative calculations or create a distance comparison.']),
});
export const wgs84Adapter = Object.freeze<ModelAdapter<EcefCoordinate>>({
  metadata,
  forward(point) {
    validatePosition(point);
    if (point.ellipsoidalHeightM === undefined) throw new AdapterInputError('height-required', 'ECEF requires an explicit WGS84 ellipsoidal height in metres');
    const p = localGeodeticToEcef({ latitude: point.latitude, longitude: point.longitude, ellipsoidal_height_m: point.ellipsoidalHeightM }).output;
    if (![p.x_m, p.y_m, p.z_m].every(Number.isFinite) || Math.hypot(p.x_m, p.y_m, p.z_m) < 1) {
      throw new AdapterInputError('outside-domain', 'ECEF result is outside the supported inverse domain');
    }
    return result({ kind: 'ecef' as const, modelId: metadata.modelId, modelVersion: metadata.modelVersion,
      units: metadata.units, x: p.x_m, y: p.y_m, z: p.z_m }, metadata);
  },
  inverse(p) {
    validateCoordinate(p, metadata, 'ecef');
    if (Math.hypot(p.x, p.y, p.z) < 1) throw new AdapterInputError('outside-domain', 'Geodetic position is undefined near geocentre');
    const output = localEcefToGeodetic({ x_m: p.x, y_m: p.y, z_m: p.z }).output;
    const onAxis = Math.hypot(p.x, p.y) < 1e-8;
    const point = { latitude: output.latitude, longitude: onAxis ? 0 : output.longitude, ellipsoidalHeightM: output.ellipsoidal_height_m };
    validatePosition(point);
    return result(point, metadata, onAxis ? ['Pole longitude is a display convention: 0 degrees.'] : []);
  },
});
