import { AE_DEFINITION, AE_MODEL_VERSION, aeForward } from '../models/ae.js';

export const AE_ROUTE_DISTANCE_VERSION = 1 as const;
export const AE_ROUTE_DISTANCE_MAX_POINTS = 50 as const;

export interface AERouteDistancePoint {
  readonly point_id: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface AERouteDistanceSegment {
  readonly segment_id: string;
  readonly index: number;
  readonly from_point_id: string;
  readonly to_point_id: string;
  readonly from_x_m: number;
  readonly from_y_m: number;
  readonly to_x_m: number;
  readonly to_y_m: number;
  readonly distance_m: number;
}

export interface AERouteDistanceResult {
  readonly semantic_type: 'REFERENCE_RESULT';
  readonly operation: 'ae_route_distance';
  readonly input: {
    readonly route_id: string;
    readonly points: readonly AERouteDistancePoint[];
  };
  readonly output: {
    readonly method_id: 'ae-projected-plane';
    readonly quantity: 'distance';
    readonly unit: 'metre';
    readonly scale_basis: 'ae-projected-plane-si-metre';
    readonly path_semantics: 'open-polyline';
    readonly segment_geometry: 'straight-projected-chord';
    readonly segment_count: number;
    readonly total_distance_m: number;
    readonly segments: readonly AERouteDistanceSegment[];
  };
  readonly provenance: {
    readonly semantic_type: 'REFERENCE_RESULT';
    readonly provider_id: 'ae-north-pole';
    readonly provider_version: string;
    readonly reference_frame: string;
    readonly operation: 'ae_route_distance';
    readonly implementation: string;
    readonly implementation_version: string;
    readonly algorithm: string;
    readonly units: Readonly<Record<string, string>>;
    readonly notes: readonly string[];
  };
}

export class AERouteDistanceError extends RangeError {
  constructor(
    readonly code:
      | 'too-few-points'
      | 'too-many-points'
      | 'duplicate-point-id'
      | 'invalid-point-id'
      | 'invalid-coordinate',
    message: string,
  ) {
    super(message);
    this.name = 'AERouteDistanceError';
  }
}

export function validateAERouteDistancePoints(
  points: readonly AERouteDistancePoint[],
): readonly AERouteDistancePoint[] {
  if (points.length < 2) {
    throw new AERouteDistanceError('too-few-points', 'AE route distance requires at least two points.');
  }
  if (points.length > AE_ROUTE_DISTANCE_MAX_POINTS) {
    throw new AERouteDistanceError(
      'too-many-points',
      `AE route distance accepts at most ${AE_ROUTE_DISTANCE_MAX_POINTS} points.`,
    );
  }

  const ids = new Set<string>();
  return Object.freeze(points.map(point => {
    const pointId = point.point_id.trim();
    if (!pointId) throw new AERouteDistanceError('invalid-point-id', 'Route point id must be non-empty.');
    if (ids.has(pointId)) throw new AERouteDistanceError('duplicate-point-id', 'Route point ids must be unique.');
    ids.add(pointId);
    if (!Number.isFinite(point.latitude) || Math.abs(point.latitude) > 90
      || !Number.isFinite(point.longitude) || Math.abs(point.longitude) > 180) {
      throw new AERouteDistanceError(
        'invalid-coordinate',
        'AE route coordinates require finite latitude [-90,90] and longitude [-180,180].',
      );
    }
    return Object.freeze({
      point_id: pointId,
      latitude: point.latitude,
      longitude: point.longitude,
    });
  }));
}

function compensatedTotal(values: readonly number[]): number {
  let sum = 0;
  let compensation = 0;
  for (const value of values) {
    const next = value - compensation;
    const combined = sum + next;
    compensation = (combined - sum) - next;
    sum = combined;
  }
  return sum;
}

/**
 * Independent browser/offline P6.4 implementation.
 * Each canonical geographic point is projected through the existing AE provider,
 * then adjacent projected coordinates are measured with Euclidean distance.
 */
export function localAERouteDistance(
  pointsInput: readonly AERouteDistancePoint[],
  routeId = 'transient-route',
): AERouteDistanceResult {
  const points = validateAERouteDistancePoints(pointsInput);
  const projected = points.map(point => aeForward({
    latitude: point.latitude,
    longitude: point.longitude,
  }));
  const segments: AERouteDistanceSegment[] = [];
  const distances: number[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const startXY = projected[index];
    const endXY = projected[index + 1];
    const rawDistance = Math.hypot(endXY.x - startXY.x, endXY.y - startXY.y);
    const distance = Math.abs(rawDistance) <= 1e-9 ? 0 : rawDistance;
    distances.push(distance);
    segments.push(Object.freeze({
      segment_id: `route-segment:${start.point_id}->${end.point_id}`,
      index,
      from_point_id: start.point_id,
      to_point_id: end.point_id,
      from_x_m: startXY.x,
      from_y_m: startXY.y,
      to_x_m: endXY.x,
      to_y_m: endXY.y,
      distance_m: distance,
    }));
  }

  return Object.freeze({
    semantic_type: 'REFERENCE_RESULT',
    operation: 'ae_route_distance',
    input: Object.freeze({ route_id: routeId, points }),
    output: Object.freeze({
      method_id: 'ae-projected-plane',
      quantity: 'distance',
      unit: 'metre',
      scale_basis: 'ae-projected-plane-si-metre',
      path_semantics: 'open-polyline',
      segment_geometry: 'straight-projected-chord',
      segment_count: segments.length,
      total_distance_m: compensatedTotal(distances),
      segments: Object.freeze(segments),
    }),
    provenance: Object.freeze({
      semantic_type: 'REFERENCE_RESULT',
      provider_id: 'ae-north-pole',
      provider_version: AE_MODEL_VERSION,
      reference_frame: 'WGS84 geographic input -> north-polar AE projected plane',
      operation: 'ae_route_distance',
      implementation: 'proj4 (browser)',
      implementation_version: '2.22.0',
      algorithm: `${AE_DEFINITION}; Euclidean distance between adjacent projected coordinates`,
      units: Object.freeze({ projected_coordinates: 'metres', distance: 'metres' }),
      notes: Object.freeze([
        'P6.4 measures straight adjacent chords in the AE projected plane.',
        'Projected-plane metres are not relabeled as WGS84 ellipsoidal geodesic distance.',
        'Projection distortion is part of this method and depends on route position/orientation.',
        'Azimuthal equidistant preserves radial distance from the north-pole center, not arbitrary pairwise surface distance.',
        'Repeated coordinates are valid and contribute a zero-length segment.',
        'This is not a road, flight, WGS84-geodesic, or Gleason-native route distance.',
      ]),
    }),
  });
}
