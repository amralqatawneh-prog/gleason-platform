import type { GeoPoint } from '../models/projectionTypes.js';

export const ROUTE_GUIDE_VERSION = 1 as const;
export const ROUTE_GUIDE_STEPS_PER_SEGMENT = 24 as const;

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
