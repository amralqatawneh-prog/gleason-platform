import GeographicLib from 'geographiclib-geodesic';

export const WGS84_ROUTE_DISTANCE_VERSION = 1 as const;
export const WGS84_ROUTE_DISTANCE_MAX_POINTS = 50 as const;

export interface Wgs84RouteDistancePoint {
  readonly point_id: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface Wgs84RouteDistanceSegment {
  readonly segment_id: string;
  readonly index: number;
  readonly from_point_id: string;
  readonly to_point_id: string;
  readonly distance_m: number;
}

export interface Wgs84RouteDistanceResult {
  readonly semantic_type: 'REFERENCE_RESULT';
  readonly operation: 'wgs84_route_distance';
  readonly input: {
    readonly route_id: string;
    readonly points: readonly Wgs84RouteDistancePoint[];
  };
  readonly output: {
    readonly method_id: 'wgs84-geodesic';
    readonly quantity: 'distance';
    readonly unit: 'metre';
    readonly scale_basis: 'wgs84-ellipsoid';
    readonly path_semantics: 'open-polyline';
    readonly segment_count: number;
    readonly total_distance_m: number;
    readonly segments: readonly Wgs84RouteDistanceSegment[];
  };
  readonly provenance: {
    readonly semantic_type: 'REFERENCE_RESULT';
    readonly provider_id: 'wgs84-reference';
    readonly provider_version: string;
    readonly reference_frame: 'WGS 84';
    readonly operation: 'wgs84_route_distance';
    readonly implementation: string;
    readonly implementation_version: string;
    readonly algorithm: string;
    readonly units: Readonly<Record<string, string>>;
    readonly notes: readonly string[];
  };
}

export class Wgs84RouteDistanceError extends RangeError {
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
    this.name = 'Wgs84RouteDistanceError';
  }
}

export function validateWgs84RouteDistancePoints(
  points: readonly Wgs84RouteDistancePoint[],
): readonly Wgs84RouteDistancePoint[] {
  if (points.length < 2) {
    throw new Wgs84RouteDistanceError('too-few-points', 'WGS84 route distance requires at least two points.');
  }
  if (points.length > WGS84_ROUTE_DISTANCE_MAX_POINTS) {
    throw new Wgs84RouteDistanceError(
      'too-many-points',
      `WGS84 route distance accepts at most ${WGS84_ROUTE_DISTANCE_MAX_POINTS} points.`,
    );
  }

  const ids = new Set<string>();
  return Object.freeze(points.map(point => {
    const pointId = point.point_id.trim();
    if (!pointId) throw new Wgs84RouteDistanceError('invalid-point-id', 'Route point id must be non-empty.');
    if (ids.has(pointId)) throw new Wgs84RouteDistanceError('duplicate-point-id', 'Route point ids must be unique.');
    ids.add(pointId);
    if (!Number.isFinite(point.latitude) || Math.abs(point.latitude) > 90
      || !Number.isFinite(point.longitude) || Math.abs(point.longitude) > 180) {
      throw new Wgs84RouteDistanceError(
        'invalid-coordinate',
        'WGS84 route coordinates require finite latitude [-90,90] and longitude [-180,180].',
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

/** Independent offline P6.3 implementation; backend pyproj/PROJ remains acceptance authority. */
export function localWgs84RouteDistance(
  pointsInput: readonly Wgs84RouteDistancePoint[],
  routeId = 'transient-route',
): Wgs84RouteDistanceResult {
  const points = validateWgs84RouteDistancePoints(pointsInput);
  const segments: Wgs84RouteDistanceSegment[] = [];
  const distances: number[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const inverse = GeographicLib.Geodesic.WGS84.Inverse(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude,
    );
    const rawDistance = inverse.s12!;
    const distance = Math.abs(rawDistance) <= 1e-9 ? 0 : rawDistance;
    distances.push(distance);
    segments.push(Object.freeze({
      segment_id: `route-segment:${start.point_id}->${end.point_id}`,
      index,
      from_point_id: start.point_id,
      to_point_id: end.point_id,
      distance_m: distance,
    }));
  }

  return {
    semantic_type: 'REFERENCE_RESULT',
    operation: 'wgs84_route_distance',
    input: { route_id: routeId, points },
    output: {
      method_id: 'wgs84-geodesic',
      quantity: 'distance',
      unit: 'metre',
      scale_basis: 'wgs84-ellipsoid',
      path_semantics: 'open-polyline',
      segment_count: segments.length,
      total_distance_m: compensatedTotal(distances),
      segments: Object.freeze(segments),
    },
    provenance: {
      semantic_type: 'REFERENCE_RESULT',
      provider_id: 'wgs84-reference',
      provider_version: 'WGS84-0.4.0',
      reference_frame: 'WGS 84',
      operation: 'wgs84_route_distance',
      implementation: 'geographiclib-geodesic (browser)',
      implementation_version: '2.2.0',
      algorithm: 'Karney WGS84 ellipsoidal geodesic inverse per adjacent open-polyline segment',
      units: Object.freeze({ distance: 'metres' }),
      notes: Object.freeze([
        'Executed locally; backend pyproj/PROJ parity is an acceptance gate.',
        'P6.3 sums adjacent ordered segments only; the route remains an open polyline.',
        'Surface geodesic distance uses latitude/longitude only; no unknown height is invented.',
        'Repeated coordinates are valid and contribute a zero-length segment.',
        'This is not a road, flight, AE projected-plane, or Gleason-native route distance.',
      ]),
    },
  };
}
