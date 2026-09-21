import { gleasonForward, normalizeLongitude } from './gleason.js';
import type { GeoPoint } from './projectionTypes.js';

export const GLEASON_RESTORED_RASTER = Object.freeze({
  source_id: 'gleason-restored-map-owner-upload-2026-09-21',
  pdf_sha256: '26105ca1f98ec9d862eb5ab52ef94b01b8b4f642a41b678cf5fbe21cff19f327',
  embedded_raster_sha256: 'dc7f96ef7a473a4db334f721ce54963474792814280cf21dd00307f4b14619b0',
  width_px: 4653,
  height_px: 6506,
  calibration_status: 'provisional-geometric-fit',
  center_x_px: 2315.1835844095776,
  center_y_px: 3287.4068173009764,
  south_pole_ring_radius_px: 1851.8383776797139,
  outer_ring_fit_rms_px: 5.768749489287826,
  outer_ring_fit_median_abs_px: 4.706116332701413,
  orientation: 'greenwich-ray-right-east-longitudes-counterclockwise',
  source_lineage: 'owner-supplied restored raster; archival restoration lineage not independently verified',
} as const);

export interface HistoricalRasterPoint {
  readonly x_px: number;
  readonly y_px: number;
}

/**
 * Visualization transform only. Computation coordinates remain independent.
 * The provisional historical raster fit maps the north pole to the fitted
 * center; Greenwich points right; positive/east longitude rotates upward.
 */
export function gleasonGeoToHistoricalRasterPixel(point: GeoPoint): HistoricalRasterPoint {
  const projected = gleasonForward(point);
  const scale = GLEASON_RESTORED_RASTER.south_pole_ring_radius_px;
  return Object.freeze({
    x_px: GLEASON_RESTORED_RASTER.center_x_px - projected.y * scale,
    y_px: GLEASON_RESTORED_RASTER.center_y_px - projected.x * scale,
  });
}

export function gleasonRasterRulerSegment(start: GeoPoint, end: GeoPoint) {
  const a = gleasonGeoToHistoricalRasterPixel(start);
  const b = gleasonGeoToHistoricalRasterPixel(end);
  return Object.freeze({
    start: a,
    end: b,
    length_px: Math.hypot(b.x_px - a.x_px, b.y_px - a.y_px),
  });
}

export function gleasonOuterDialSunTimeMinutes(longitude: number): number {
  return normalizeLongitude(longitude) * 4;
}
