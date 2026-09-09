import proj4 from 'proj4';
import type { GeoPoint, ProjectedPoint, ProjectionMetadata } from './projectionTypes';

export const AE_MODEL_ID = 'ae-north-pole';
export const AE_MODEL_VERSION = 'AE-0.2.0';
export const AE_CODE = 'AE:NP';
export const AE_DEFINITION = '+proj=aeqd +lat_0=90 +lon_0=0 +datum=WGS84 +units=m +no_defs';

export function aeForward(point: GeoPoint): ProjectedPoint {
  const [x, y] = proj4('EPSG:4326', AE_DEFINITION, [point.longitude, point.latitude]);
  return { x, y, units: 'metre' };
}

export function aeInverse(point: ProjectedPoint): GeoPoint {
  if (point.units !== 'metre') throw new Error('expected units=metre');
  const [longitude, latitude] = proj4(AE_DEFINITION, 'EPSG:4326', [point.x, point.y]);
  return { latitude, longitude };
}

export const aeMetadata: ProjectionMetadata = {
  modelId: AE_MODEL_ID,
  modelVersion: AE_MODEL_VERSION,
  name: 'North-polar Azimuthal Equidistant reference',
  units: 'metre',
  evidence: [{ sourceId: 'PROJ/proj4js', locator: AE_DEFINITION, evidenceLevel: 'REFERENCE', note: 'Independent modern reference projection. It is not attributed to Gleason.' }],
  limitations: ['Kept mathematically and semantically separate from the historical provider.'],
};
