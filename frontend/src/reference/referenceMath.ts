import type { BrowserCapabilities } from '../platform/capabilities';

export type ReferenceViewMode = 'webgl3d' | 'fallback2d';

export type ReferenceGeoPoint = {
  latitude: number;
  longitude: number;
};

export function referenceViewMode(capabilities: BrowserCapabilities): ReferenceViewMode {
  return capabilities.webgl2 ? 'webgl3d' : 'fallback2d';
}

export function clampLatitude(latitude: number): number {
  return Math.max(-90, Math.min(90, latitude));
}

export function normalizeLongitude(longitude: number): number {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

export function geoPointToViewAngles(point: ReferenceGeoPoint): { yaw: number; pitch: number } {
  return {
    yaw: ((normalizeLongitude(point.longitude) - 90) * Math.PI) / 180,
    pitch: (clampLatitude(point.latitude) * Math.PI) / 180,
  };
}

export function latLonToEllipsoid(
  point: ReferenceGeoPoint,
  equatorialRadius = 1,
  polarRadius = 6356752.314245179 / 6378137,
): [number, number, number] {
  const lat = (point.latitude * Math.PI) / 180;
  const lon = (point.longitude * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return [
    equatorialRadius * cosLat * Math.cos(lon),
    polarRadius * Math.sin(lat),
    equatorialRadius * cosLat * Math.sin(lon),
  ];
}

export function screenPointToGeo(
  x: number,
  y: number,
  width: number,
  height: number,
  yawRad: number,
  pitchRad: number,
): ReferenceGeoPoint | null {
  if (width <= 0 || height <= 0) return null;
  const scale = Math.min(width, height) * 0.42;
  // The rendered external globe mirrors model-space X so east is visually to
  // the right; invert screen X here to recover the original model coordinate.
  const nx = -(x - width / 2) / scale;
  const ny = -(y - height / 2) / scale;
  const r2 = nx * nx + ny * ny;
  if (r2 > 1) return null;
  const nz = Math.sqrt(Math.max(0, 1 - r2));

  const cp = Math.cos(-pitchRad);
  const sp = Math.sin(-pitchRad);
  const py = ny * cp - nz * sp;
  const pz = ny * sp + nz * cp;

  const cy = Math.cos(-yawRad);
  const sy = Math.sin(-yawRad);
  const px = nx * cy + pz * sy;
  const pzz = -nx * sy + pz * cy;

  return {
    latitude: clampLatitude((Math.asin(Math.max(-1, Math.min(1, py))) * 180) / Math.PI),
    longitude: normalizeLongitude((Math.atan2(pzz, px) * 180) / Math.PI),
  };
}
