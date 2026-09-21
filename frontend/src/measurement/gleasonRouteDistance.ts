import {
  GLEASON_MODEL_ID,
  GLEASON_MODEL_VERSION,
  gleasonForward,
  GLEASON_FIG43_CIRCLE_MILES_PER_NRU,
  GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU,
} from '../models/gleason.js';

export const GLEASON_ROUTE_DISTANCE_VERSION = 1 as const;
export const GLEASON_ROUTE_DISTANCE_MAX_POINTS = 50 as const;

export interface GleasonRouteDistancePoint {
  readonly point_id: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface GleasonRouteDistanceSegment {
  readonly segment_id: string;
  readonly index: number;
  readonly from_point_id: string;
  readonly to_point_id: string;
  readonly from_x_normalized_radius: number;
  readonly from_y_normalized_radius: number;
  readonly to_x_normalized_radius: number;
  readonly to_y_normalized_radius: number;
  readonly distance_normalized_radius_unit: number;
  readonly distance_historical_fig43_mile_derived: number;
  readonly distance_legacy_radial60_nautical_mile: number;
}

export interface GleasonRouteDistanceResult {
  readonly semantic_type: 'COMPUTED_RESULT';
  readonly operation: 'gleason_route_distance';
  readonly input: {
    readonly route_id: string;
    readonly points: readonly GleasonRouteDistancePoint[];
  };
  readonly output: {
    readonly method_id: 'gleason-native-normalized';
    readonly quantity: 'distance';
    readonly unit: 'normalized-radius-unit';
    readonly scale_basis: 'gleason-normalized-model-radius';
    readonly path_semantics: 'open-polyline';
    readonly segment_geometry: 'straight-projected-chord';
    readonly segment_count: number;
    readonly total_distance_normalized_radius_unit: number;
    readonly historical_scale_profile_id: 'gleason-fig43-circle-derived';
    readonly historical_scale_unit: 'historical-fig43-mile';
    readonly historical_scale_basis: 'equator-360x60-circle-radius';
    readonly historical_scale_evidence_level: 'DERIVED_FROM_DOCUMENTED';
    readonly total_distance_historical_fig43_mile_derived: number;
    readonly legacy_scale_profile_id: 'gleason-radial-60nm-legacy';
    readonly legacy_scale_unit: 'nautical-mile-legacy';
    readonly legacy_scale_evidence_level: 'SECONDARY_OBSERVED';
    readonly total_distance_legacy_radial60_nautical_mile: number;
    readonly segments: readonly GleasonRouteDistanceSegment[];
  };
  readonly provenance: {
    readonly semantic_type: 'COMPUTED_RESULT';
    readonly provider_id: 'gleason-historical';
    readonly provider_version: string;
    readonly reference_frame: string;
    readonly operation: 'gleason_route_distance';
    readonly implementation: string;
    readonly implementation_version: string;
    readonly algorithm: string;
    readonly units: Readonly<Record<string, string>>;
    readonly notes: readonly string[];
  };
}

export class GleasonRouteDistanceError extends RangeError {
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
    this.name = 'GleasonRouteDistanceError';
  }
}

export function validateGleasonRouteDistancePoints(
  points: readonly GleasonRouteDistancePoint[],
): readonly GleasonRouteDistancePoint[] {
  if (points.length < 2) {
    throw new GleasonRouteDistanceError(
      'too-few-points',
      'Gleason route distance requires at least two points.',
    );
  }
  if (points.length > GLEASON_ROUTE_DISTANCE_MAX_POINTS) {
    throw new GleasonRouteDistanceError(
      'too-many-points',
      `Gleason route distance accepts at most ${GLEASON_ROUTE_DISTANCE_MAX_POINTS} points.`,
    );
  }

  const ids = new Set<string>();
  return Object.freeze(points.map(point => {
    const pointId = point.point_id.trim();
    if (!pointId) {
      throw new GleasonRouteDistanceError('invalid-point-id', 'Route point id must be non-empty.');
    }
    if (ids.has(pointId)) {
      throw new GleasonRouteDistanceError('duplicate-point-id', 'Route point ids must be unique.');
    }
    ids.add(pointId);
    if (!Number.isFinite(point.latitude) || Math.abs(point.latitude) > 90
      || !Number.isFinite(point.longitude) || Math.abs(point.longitude) > 180) {
      throw new GleasonRouteDistanceError(
        'invalid-coordinate',
        'Gleason route coordinates require finite latitude [-90,90] and longitude [-180,180].',
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
 * Independent browser/offline P6.5 implementation.
 * Canonical geography is projected through the existing GH-0.2.0 reconstruction,
 * then adjacent projected coordinates are measured in normalized model units.
 */
export function localGleasonRouteDistance(
  pointsInput: readonly GleasonRouteDistancePoint[],
  routeId = 'transient-route',
): GleasonRouteDistanceResult {
  const points = validateGleasonRouteDistancePoints(pointsInput);
  const projected = points.map(point => gleasonForward({
    latitude: point.latitude,
    longitude: point.longitude,
  }));
  const segments: GleasonRouteDistanceSegment[] = [];
  const distances: number[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const startXY = projected[index];
    const endXY = projected[index + 1];
    const rawDistance = Math.hypot(endXY.x - startXY.x, endXY.y - startXY.y);
    const distance = Math.abs(rawDistance) <= 1e-15 ? 0 : rawDistance;
    distances.push(distance);
    segments.push(Object.freeze({
      segment_id: `route-segment:${start.point_id}->${end.point_id}`,
      index,
      from_point_id: start.point_id,
      to_point_id: end.point_id,
      from_x_normalized_radius: startXY.x,
      from_y_normalized_radius: startXY.y,
      to_x_normalized_radius: endXY.x,
      to_y_normalized_radius: endXY.y,
      distance_normalized_radius_unit: distance,
      distance_historical_fig43_mile_derived:
        distance * GLEASON_FIG43_CIRCLE_MILES_PER_NRU,
      distance_legacy_radial60_nautical_mile:
        distance * GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU,
    }));
  }

  return Object.freeze({
    semantic_type: 'COMPUTED_RESULT',
    operation: 'gleason_route_distance',
    input: Object.freeze({ route_id: routeId, points }),
    output: Object.freeze({
      method_id: 'gleason-native-normalized',
      quantity: 'distance',
      unit: 'normalized-radius-unit',
      scale_basis: 'gleason-normalized-model-radius',
      path_semantics: 'open-polyline',
      segment_geometry: 'straight-projected-chord',
      segment_count: segments.length,
      total_distance_normalized_radius_unit: compensatedTotal(distances),
      historical_scale_profile_id: 'gleason-fig43-circle-derived',
      historical_scale_unit: 'historical-fig43-mile',
      historical_scale_basis: 'equator-360x60-circle-radius',
      historical_scale_evidence_level: 'DERIVED_FROM_DOCUMENTED',
      total_distance_historical_fig43_mile_derived:
        compensatedTotal(distances) * GLEASON_FIG43_CIRCLE_MILES_PER_NRU,
      legacy_scale_profile_id: 'gleason-radial-60nm-legacy',
      legacy_scale_unit: 'nautical-mile-legacy',
      legacy_scale_evidence_level: 'SECONDARY_OBSERVED',
      total_distance_legacy_radial60_nautical_mile:
        compensatedTotal(distances) * GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU,
      segments: Object.freeze(segments),
    }),
    provenance: Object.freeze({
      semantic_type: 'COMPUTED_RESULT',
      provider_id: GLEASON_MODEL_ID,
      provider_version: GLEASON_MODEL_VERSION,
      reference_frame: 'WGS84 geographic input -> derived Gleason normalized-radius plane',
      operation: 'gleason_route_distance',
      implementation: 'typescript-math (browser)',
      implementation_version: 'P6.5-v1',
      algorithm: 'GH-0.2.0 r=(90-latitude_deg)/180 plus normalized longitude angle; Euclidean adjacent projected chord',
      units: Object.freeze({
        projected_coordinates: 'normalized-radius',
        distance: 'normalized-radius-unit',
      }),
      notes: Object.freeze([
        'P6.5 measures straight adjacent chords in the project DERIVED Gleason reconstruction.',
        'The historical book does not print this modern analytic forward/inverse formula.',
        'Normalized-radius-unit is model-native and has no automatic metre/kilometre conversion.',
        'No WGS84 or AE distance is substituted or normalized to force agreement.',
        'Repeated coordinates are valid and contribute a zero-length segment.',
        'This is not a road, flight, WGS84-geodesic, or AE projected-plane route distance.',
      ]),
    }),
  });
}
