export const POLYGON_MEASUREMENT_VERSION = 1 as const;
export const POLYGON_MEASUREMENT_MAX_POINTS = 50 as const;

export interface PolygonMeasurementPoint {
  readonly point_id: string;
  readonly latitude: number;
  readonly longitude: number;
}

export type PolygonOrientation = 'counterclockwise' | 'clockwise';
export type PolygonSelfIntersectionPolicy = 'algebraic-signed-area';
export type PolygonClosureSemantics = 'implicit-last-to-first';

export class PolygonMeasurementError extends RangeError {
  constructor(
    readonly code:
      | 'too-few-points'
      | 'too-many-points'
      | 'duplicate-point-id'
      | 'invalid-point-id'
      | 'invalid-coordinate'
      | 'repeated-coordinate'
      | 'degenerate-area',
    message: string,
  ) {
    super(message);
    this.name = 'PolygonMeasurementError';
  }
}

export function validatePolygonMeasurementPoints(
  points: readonly PolygonMeasurementPoint[],
): readonly Readonly<PolygonMeasurementPoint>[] {
  if (points.length < 3) {
    throw new PolygonMeasurementError('too-few-points', 'Polygon measurement requires at least three vertices.');
  }
  if (points.length > POLYGON_MEASUREMENT_MAX_POINTS) {
    throw new PolygonMeasurementError(
      'too-many-points',
      `Polygon measurement accepts at most ${POLYGON_MEASUREMENT_MAX_POINTS} vertices.`,
    );
  }

  const ids = new Set<string>();
  const coordinates = new Set<string>();
  return Object.freeze(points.map(point => {
    const pointId = point.point_id.trim();
    if (!pointId) throw new PolygonMeasurementError('invalid-point-id', 'Polygon point id must be non-empty.');
    if (ids.has(pointId)) throw new PolygonMeasurementError('duplicate-point-id', 'Polygon point ids must be unique.');
    ids.add(pointId);

    if (!Number.isFinite(point.latitude) || Math.abs(point.latitude) > 90
      || !Number.isFinite(point.longitude) || Math.abs(point.longitude) > 180) {
      throw new PolygonMeasurementError(
        'invalid-coordinate',
        'Polygon coordinates require finite latitude [-90,90] and longitude [-180,180].',
      );
    }

    const latitude = Object.is(point.latitude, -0) ? 0 : point.latitude;
    const longitude = Object.is(point.longitude, -0) ? 0 : point.longitude;
    const coordinateKey = `${latitude}|${longitude}`;
    if (coordinates.has(coordinateKey)) {
      throw new PolygonMeasurementError(
        'repeated-coordinate',
        'Explicit polygon vertices must use distinct geographic coordinate pairs; closure is implicit.',
      );
    }
    coordinates.add(coordinateKey);
    return Object.freeze({ point_id: pointId, latitude, longitude });
  }));
}

export function polygonOrientation(
  signedArea: number,
  tolerance: number,
): PolygonOrientation {
  if (!Number.isFinite(signedArea) || Math.abs(signedArea) <= tolerance) {
    throw new PolygonMeasurementError(
      'degenerate-area',
      'Polygon area is zero or numerically degenerate in this computation space.',
    );
  }
  return signedArea > 0 ? 'counterclockwise' : 'clockwise';
}

export interface ProjectedPolygonPoint {
  readonly point_id: string;
  readonly x: number;
  readonly y: number;
}

export interface PlanarPolygonEdge {
  readonly edge_id: string;
  readonly index: number;
  readonly from_point_id: string;
  readonly to_point_id: string;
  readonly from_x: number;
  readonly from_y: number;
  readonly to_x: number;
  readonly to_y: number;
  readonly distance: number;
}

export interface PlanarPolygonMeasurement {
  readonly perimeter: number;
  readonly signedArea: number;
  readonly area: number;
  readonly orientation: PolygonOrientation;
  readonly edges: readonly Readonly<PlanarPolygonEdge>[];
}

function compensatedSum(values: readonly number[]): number {
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

export function measurePlanarPolygon(
  points: readonly ProjectedPolygonPoint[],
  areaTolerance: number,
  distanceTolerance: number,
): Readonly<PlanarPolygonMeasurement> {
  const edges: PlanarPolygonEdge[] = [];
  const lengths: number[] = [];
  const crossTerms: number[] = [];

  for (let index = 0; index < points.length; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    const rawDistance = Math.hypot(end.x - start.x, end.y - start.y);
    const distance = Math.abs(rawDistance) <= distanceTolerance ? 0 : rawDistance;
    lengths.push(distance);
    crossTerms.push(start.x * end.y - end.x * start.y);
    edges.push(Object.freeze({
      edge_id: `polygon-edge:${start.point_id}->${end.point_id}`,
      index,
      from_point_id: start.point_id,
      to_point_id: end.point_id,
      from_x: start.x,
      from_y: start.y,
      to_x: end.x,
      to_y: end.y,
      distance,
    }));
  }

  const signedArea = compensatedSum(crossTerms) / 2;
  const orientation = polygonOrientation(signedArea, areaTolerance);
  return Object.freeze({
    perimeter: compensatedSum(lengths),
    signedArea,
    area: Math.abs(signedArea),
    orientation,
    edges: Object.freeze(edges),
  });
}
