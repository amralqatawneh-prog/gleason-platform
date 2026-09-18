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

// The renderer uses x/equator, y/polar, z/equator; ECEF uses z/polar.
export const WGS84_POLAR_RATIO = 6356752.314245179 / 6378137;
export const GLOBE_CLIP_SCALE = 0.78;

export function geoPointToViewAngles(point: ReferenceGeoPoint): { yaw: number; pitch: number } {
  const [x, y, z] = latLonToEllipsoid(point);
  return {
    yaw: ((normalizeLongitude(point.longitude) - 90) * Math.PI) / 180,
    // Aim at the surface position, not its geodetic normal.
    pitch: Math.atan2(y, Math.hypot(x, z)),
  };
}

/** Geodetic latitude on the ellipsoid, not parametric/spherical latitude. */
export function latLonToEllipsoid(
  point: ReferenceGeoPoint,
  equatorialRadius = 1,
  polarRadius = WGS84_POLAR_RATIO,
): [number, number, number] {
  const lat = point.latitude * Math.PI / 180;
  const lon = point.longitude * Math.PI / 180;
  const e2 = 1 - (polarRadius / equatorialRadius) ** 2;
  const n = equatorialRadius / Math.sqrt(1 - e2 * Math.sin(lat) ** 2);
  return [n * Math.cos(lat) * Math.cos(lon), n * (1 - e2) * Math.sin(lat), n * Math.cos(lat) * Math.sin(lon)];
}

type Vector3 = [number, number, number];
function rotate([x, y, z]: Vector3, yaw: number, pitch: number): Vector3 {
  const x1 = Math.cos(yaw) * x + Math.sin(yaw) * z;
  const z1 = -Math.sin(yaw) * x + Math.cos(yaw) * z;
  return [x1, Math.cos(pitch) * y - Math.sin(pitch) * z1, Math.sin(pitch) * y + Math.cos(pitch) * z1];
}
function unrotate([x, y, z]: Vector3, yaw: number, pitch: number): Vector3 {
  const y1 = Math.cos(pitch) * y + Math.sin(pitch) * z;
  const z1 = -Math.sin(pitch) * y + Math.cos(pitch) * z;
  return [Math.cos(yaw) * x - Math.sin(yaw) * z1, y1, Math.sin(yaw) * x + Math.cos(yaw) * z1];
}

export function projectGeoToScreen(
  point: ReferenceGeoPoint, width: number, height: number, yawRad: number, pitchRad: number,
): ScreenProjection | null {
  if (![width, height, yawRad, pitchRad, point.latitude, point.longitude].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  const body = latLonToEllipsoid(point);
  const [x, y] = rotate(body, yawRad, pitchRad);
  const normal: Vector3 = [body[0], body[1] / WGS84_POLAR_RATIO ** 2, body[2]];
  const depth = rotate(normal, yawRad, pitchRad)[2] / Math.hypot(...normal);
  const scale = Math.min(width, height) * GLOBE_CLIP_SCALE / 2;
  return { x: width / 2 - x * scale, y: height / 2 - y * scale, visible: depth > 0, depth };
}

/** Orthographic ray/ellipsoid intersection using the exact rendering transform. */
export function screenPointToGeo(
  x: number, y: number, width: number, height: number, yawRad: number, pitchRad: number,
): ReferenceGeoPoint | null {
  if (![x, y, width, height, yawRad, pitchRad].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  const scale = Math.min(width, height) * GLOBE_CLIP_SCALE / 2;
  const origin = unrotate([-(x - width / 2) / scale, -(y - height / 2) / scale, 0], yawRad, pitchRad);
  const direction = unrotate([0, 0, 1], yawRad, pitchRad);
  const dot = (a: Vector3, b: Vector3) => a[0] * b[0] + a[1] * b[1] / WGS84_POLAR_RATIO ** 2 + a[2] * b[2];
  const a = dot(direction, direction), b = 2 * dot(origin, direction), c = dot(origin, origin) - 1;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < -1e-14) return null;
  const t = (-b + Math.sqrt(Math.max(0, discriminant))) / (2 * a);
  const body = origin.map((value, i) => value + t * direction[i]);
  return {
    latitude: Math.atan2(body[1] / WGS84_POLAR_RATIO ** 2, Math.hypot(body[0], body[2])) * 180 / Math.PI,
    longitude: normalizeLongitude(Math.atan2(body[2], body[0]) * 180 / Math.PI),
  };
}

/** SVG xMidYMid meet: reject letterboxing instead of stretching coordinates. */
export function fallbackScreenPointToGeo(x: number, y: number, width: number, height: number): ReferenceGeoPoint | null {
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  const scale = Math.min(width / 360, height / 180);
  const mapX = (x - (width - 360 * scale) / 2) / scale;
  const mapY = (y - (height - 180 * scale) / 2) / scale;
  if (mapX < 0 || mapX > 360 || mapY < 0 || mapY > 180) return null;
  return { latitude: 90 - mapY, longitude: mapX - 180 };
}
