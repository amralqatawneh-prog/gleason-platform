import type { GeoPoint, ProjectedPoint, ProjectionMetadata } from './projectionTypes';

export const GLEASON_MODEL_ID = 'gleason-historical';
export const GLEASON_MODEL_VERSION = 'GH-0.2.0';
export const GLEASON_UNITS = 'normalized-radius';

export function normalizeLongitude(longitude: number): number {
  let value = ((longitude + 180) % 360 + 360) % 360 - 180;
  if (value === -180 && longitude > 0) value = 180;
  return value;
}

export function gleasonForward(point: GeoPoint): ProjectedPoint {
  if (point.latitude < -90 || point.latitude > 90) throw new RangeError('latitude must be in [-90, 90]');
  const radius = (90 - point.latitude) / 180;
  const theta = normalizeLongitude(point.longitude) * Math.PI / 180;
  return { x: radius * Math.sin(theta), y: -radius * Math.cos(theta), units: GLEASON_UNITS };
}

export function gleasonInverse(point: ProjectedPoint): GeoPoint {
  if (point.units !== GLEASON_UNITS) throw new Error(`expected units=${GLEASON_UNITS}`);
  const radius = Math.hypot(point.x, point.y);
  if (radius > 1 + 1e-12) throw new RangeError('point lies outside historical map circumference');
  if (radius < 1e-15) return { latitude: 90, longitude: 0 };
  return {
    latitude: 90 - 180 * radius,
    longitude: normalizeLongitude(Math.atan2(point.x, -point.y) * 180 / Math.PI),
  };
}

export function historicalLongitudeDegreeMiles(latitude: number): number {
  if (latitude < -90 || latitude > 90) throw new RangeError('latitude must be in [-90, 90]');
  return 60 - (2 / 3) * latitude;
}

export const gleasonMetadata: ProjectionMetadata = {
  modelId: GLEASON_MODEL_ID,
  modelVersion: GLEASON_MODEL_VERSION,
  name: 'Gleason Historical circular reconstruction',
  units: GLEASON_UNITS,
  evidence: [
    { sourceId: 'gleason-1893-upload-v1', locator: 'PDF pp. 376–377 / printed pp. 349–350, Chapter XVII', evidenceLevel: 'DOCUMENTED', note: 'Circular map, 24-hour dial, and radiating latitude arms are described in the source.' },
    { sourceId: 'gleason-1893-upload-v1', locator: 'PDF p. 429 / printed p. 402, Fig. 43', evidenceLevel: 'DOCUMENTED', note: 'Source states straight longitude lines and continuing divergence south of the Equator.' },
    { sourceId: 'application-convention', locator: GLEASON_MODEL_VERSION, evidenceLevel: 'DISPLAY_CONVENTION', note: 'Prime meridian is rendered at the top; this fixes display rotation only.' },
  ],
  limitations: ['The book does not print this analytic forward/inverse formula.', 'Normalized radius is a computational reconstruction, not a claimed physical scale.'],
};
