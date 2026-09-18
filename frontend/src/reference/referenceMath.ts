import type { BrowserCapabilities } from '../platform/capabilities';

export type ReferenceViewMode = 'webgl3d' | 'fallback2d';

export type ReferenceGeoPoint = {
  latitude: number;
  longitude: number;
};

export type ScreenProjection = {
  x: number;
  y: number;
  visible: boolean;
  depth: number;
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

export function draggedYaw(initialYaw: number, horizontalDeltaPx: number, sensitivity = 0.008): number {
  return initialYaw - horizontalDeltaPx * sensitivity;
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

export function projectGeoToScreen(
  point: ReferenceGeoPoint,
  width: number,
  height: number,
  yawRad: number,
  pitchRad: number,
): ScreenProjection | null {
  if (width <= 0 || height <= 0) return null;
  const [x0, y0, z0] = latLonToEllipsoid(point);
  const cy = Math.cos(yawRad);
  const sy = Math.sin(yawRad);
  const x1 = cy * x0 + sy * z0;
  const z1 = -sy * x0 + cy * z0;
  const cp = Math.cos(pitchRad);
  const sp = Math.sin(pitchRad);
  const y2 = cp * y0 - sp * z1;
  const z2 = sp * y0 + cp * z1;
  const aspect = width / height;
  const sx = aspect >= 1 ? 0.78 / aspect : 0.78;
  const syScale = aspect >= 1 ? 0.78 : 0.78 * aspect;
  const clipX = -x1 * sx;
  const clipY = y2 * syScale;
  return {
    x: (clipX * 0.5 + 0.5) * width,
    y: (0.5 - clipY * 0.5) * height,
    visible: z2 > 0,
    depth: z2,
  };
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
