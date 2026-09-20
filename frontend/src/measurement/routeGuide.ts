import type { GeoPoint } from '../models/projectionTypes.js';

export const ROUTE_GUIDE_VERSION = 1 as const;
export const ROUTE_GUIDE_STEPS_PER_SEGMENT = 24 as const;
export const GREAT_CIRCLE_STEPS_PER_SEGMENT = 64 as const;

export interface RouteGuideSegment {
  readonly segmentId: string;
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly samples: readonly GeoPoint[];
}

function normalizeLongitude(longitude: number): number {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

function shortestLongitudeDelta(from: number, to: number): number {
  return normalizeLongitude(to - from);
}

/**
 * Builds a display-only canonical geographic connector between ordered route
 * vertices. It is deliberately not a measurement path, road/flight route, or
 * model-native distance geometry. Numeric distance remains P6.3 WGS84 geodesic.
 */
export function buildRouteGuideSegments(
  points: readonly GeoPoint[],
  stepsPerSegment = ROUTE_GUIDE_STEPS_PER_SEGMENT,
): readonly RouteGuideSegment[] {
  const steps = Math.max(1, Math.floor(stepsPerSegment));
  if (points.length < 2) return Object.freeze([]);

  return Object.freeze(points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    const longitudeDelta = shortestLongitudeDelta(start.longitude, end.longitude);
    const samples: GeoPoint[] = [];
    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      samples.push(Object.freeze({
        latitude: start.latitude + (end.latitude - start.latitude) * t,
        longitude: normalizeLongitude(start.longitude + longitudeDelta * t),
      }));
    }
    return Object.freeze({
      segmentId: `route-guide:${index}->${index + 1}`,
      fromIndex: index,
      toIndex: index + 1,
      samples: Object.freeze(samples),
    });
  }));
}


export interface StraightProjectedRouteSegment {
  readonly segmentId: string;
  readonly coordinates: readonly [readonly [number, number], readonly [number, number]];
}

/**
 * Flat-map display rule: connect each adjacent route point with exactly one
 * straight segment in that model's projected plane. No intermediate geographic
 * samples are inserted, so OpenLayers renders an exact straight chord between
 * the two projected endpoints.
 */
export function buildStraightProjectedRouteSegments(
  points: readonly GeoPoint[],
  project: (point: GeoPoint) => readonly [number, number],
): readonly StraightProjectedRouteSegment[] {
  if (points.length < 2) return Object.freeze([]);
  return Object.freeze(points.slice(0, -1).map((start, index) => Object.freeze({
    segmentId: `route-guide:${index}->${index + 1}`,
    coordinates: Object.freeze([
      Object.freeze([...project(start)] as [number, number]),
      Object.freeze([...project(points[index + 1])] as [number, number]),
    ]) as readonly [readonly [number, number], readonly [number, number]],
  })));
}


export interface GreatCircleRouteSegment {
  readonly segmentId: string;
  readonly fromIndex: number;
  readonly toIndex: number;
  readonly samples: readonly GeoPoint[];
}

type Vec3 = readonly [number, number, number];

function geoToUnitVector(point: GeoPoint): Vec3 {
  const lat = point.latitude * Math.PI / 180;
  const lon = point.longitude * Math.PI / 180;
  const cosLat = Math.cos(lat);
  return [cosLat * Math.cos(lon), cosLat * Math.sin(lon), Math.sin(lat)];
}

function unitVectorToGeo(vector: Vec3): GeoPoint {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  const x = vector[0] / length;
  const y = vector[1] / length;
  const z = vector[2] / length;
  return Object.freeze({
    latitude: Math.asin(Math.max(-1, Math.min(1, z))) * 180 / Math.PI,
    longitude: normalizeLongitude(Math.atan2(y, x) * 180 / Math.PI),
  });
}

function normalizedCross(a: Vec3, b: Vec3): Vec3 {
  const x = a[1] * b[2] - a[2] * b[1];
  const y = a[2] * b[0] - a[0] * b[2];
  const z = a[0] * b[1] - a[1] * b[0];
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

/**
 * Display-only spherical great-circle interpolation for the WGS84 globe view.
 * Numeric P6.3 distance remains the independent WGS84 ellipsoidal geodesic.
 * This is not an observed or provider-supplied flight track.
 */
export function buildGreatCircleRouteSegments(
  points: readonly GeoPoint[],
  stepsPerSegment = GREAT_CIRCLE_STEPS_PER_SEGMENT,
): readonly GreatCircleRouteSegment[] {
  const steps = Math.max(1, Math.floor(stepsPerSegment));
  if (points.length < 2) return Object.freeze([]);

  return Object.freeze(points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    const a = geoToUnitVector(start);
    const b = geoToUnitVector(end);
    const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    const omega = Math.acos(dot);
    const sinOmega = Math.sin(omega);
    const samples: GeoPoint[] = [];

    let antipodalPerpendicular: Vec3 | null = null;
    if (Math.abs(Math.PI - omega) < 1e-8) {
      const reference: Vec3 = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
      antipodalPerpendicular = normalizedCross(reference, a);
    }

    for (let step = 0; step <= steps; step += 1) {
      const t = step / steps;
      let vector: Vec3;
      if (omega < 1e-12) {
        vector = a;
      } else if (antipodalPerpendicular) {
        vector = [
          a[0] * Math.cos(Math.PI * t) + antipodalPerpendicular[0] * Math.sin(Math.PI * t),
          a[1] * Math.cos(Math.PI * t) + antipodalPerpendicular[1] * Math.sin(Math.PI * t),
          a[2] * Math.cos(Math.PI * t) + antipodalPerpendicular[2] * Math.sin(Math.PI * t),
        ];
      } else {
        const startWeight = Math.sin((1 - t) * omega) / sinOmega;
        const endWeight = Math.sin(t * omega) / sinOmega;
        vector = [
          a[0] * startWeight + b[0] * endWeight,
          a[1] * startWeight + b[1] * endWeight,
          a[2] * startWeight + b[2] * endWeight,
        ];
      }
      samples.push(unitVectorToGeo(vector));
    }

    // Preserve exact user-selected endpoints after numerical interpolation.
    samples[0] = Object.freeze({ latitude: start.latitude, longitude: normalizeLongitude(start.longitude) });
    samples[samples.length - 1] = Object.freeze({ latitude: end.latitude, longitude: normalizeLongitude(end.longitude) });

    return Object.freeze({
      segmentId: `great-circle-guide:${index}->${index + 1}`,
      fromIndex: index,
      toIndex: index + 1,
      samples: Object.freeze(samples),
    });
  }));
}
