import GeographicLib from 'geographiclib-geodesic';
import type { SelectionModel } from '../comparison/geographicSelection.js';
import { aeForward, aeInverse } from '../models/ae.js';
import { GLEASON_UNITS, gleasonForward, gleasonInverse } from '../models/gleason.js';
import type { GeoPoint, ProjectedPoint } from '../models/projectionTypes.js';
import {
  measurementComputationIdentity,
  measurementVisualizationIdentity,
  type MeasurementComputationIdentity,
  type MeasurementMethodId,
  type MeasurementVisualizationIdentity,
} from './contracts.js';
import type { OrderedRouteState } from './routeState.js';

export const SAME_ROUTE_RENDERING_VERSION = 1 as const;
export const SAME_ROUTE_RENDERING_STEPS_PER_SEGMENT = 64 as const;

export type RouteRenderingGeometryKind =
  | 'wgs84-ellipsoidal-geodesic'
  | 'ae-straight-projected-chord'
  | 'gleason-straight-projected-chord';

export interface SameRouteRenderingPoint {
  readonly pointId: string;
  readonly point: Readonly<GeoPoint>;
}

export interface SameRouteRenderingSegment {
  readonly segmentId: string;
  readonly index: number;
  readonly fromPointId: string;
  readonly toPointId: string;
  readonly samples: readonly Readonly<GeoPoint>[];
}

export interface SameRouteRenderingPlan {
  readonly schemaVersion: typeof SAME_ROUTE_RENDERING_VERSION;
  readonly routeId: OrderedRouteState['routeId'];
  readonly routeRevision: number;
  readonly canonicalPointIds: readonly string[];
  readonly canonicalPoints: readonly Readonly<SameRouteRenderingPoint>[];
  readonly computation: Readonly<MeasurementComputationIdentity>;
  readonly geometryKind: RouteRenderingGeometryKind;
  readonly stepsPerSegment: number;
  readonly segments: readonly Readonly<SameRouteRenderingSegment>[];
  readonly visualizations: Readonly<Record<SelectionModel, Readonly<MeasurementVisualizationIdentity>>>;
}

function normalizeLongitude(longitude: number): number {
  let value = ((longitude + 180) % 360 + 360) % 360 - 180;
  if (value === -180 && longitude > 0) value = 180;
  return value;
}

function exactPoint(point: GeoPoint): Readonly<GeoPoint> {
  return Object.freeze({
    latitude: point.latitude,
    longitude: normalizeLongitude(point.longitude),
  });
}

function sampleWgs84Geodesic(start: GeoPoint, end: GeoPoint, steps: number): readonly Readonly<GeoPoint>[] {
  const inverse = GeographicLib.Geodesic.WGS84.Inverse(
    start.latitude,
    start.longitude,
    end.latitude,
    end.longitude,
  );
  const distance = Math.abs(inverse.s12 ?? 0);
  const azimuth = inverse.azi1 ?? 0;
  const samples: Readonly<GeoPoint>[] = [];
  for (let step = 0; step <= steps; step += 1) {
    if (step === 0) {
      samples.push(exactPoint(start));
      continue;
    }
    if (step === steps) {
      samples.push(exactPoint(end));
      continue;
    }
    if (distance <= 1e-9) {
      samples.push(exactPoint(start));
      continue;
    }
    const direct = GeographicLib.Geodesic.WGS84.Direct(
      start.latitude,
      start.longitude,
      azimuth,
      distance * (step / steps),
    );
    samples.push(Object.freeze({
      latitude: direct.lat2!,
      longitude: normalizeLongitude(direct.lon2!),
    }));
  }
  return Object.freeze(samples);
}

function sampleProjectedChord(
  start: GeoPoint,
  end: GeoPoint,
  steps: number,
  forward: (point: GeoPoint) => ProjectedPoint,
  inverse: (point: ProjectedPoint) => GeoPoint,
): readonly Readonly<GeoPoint>[] {
  const a = forward(start);
  const b = forward(end);
  const samples: Readonly<GeoPoint>[] = [];
  for (let step = 0; step <= steps; step += 1) {
    if (step === 0) {
      samples.push(exactPoint(start));
      continue;
    }
    if (step === steps) {
      samples.push(exactPoint(end));
      continue;
    }
    const t = step / steps;
    const point = inverse({
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      units: a.units,
    });
    samples.push(exactPoint(point));
  }
  return Object.freeze(samples);
}

function geometryKind(methodId: MeasurementMethodId): RouteRenderingGeometryKind {
  if (methodId === 'wgs84-geodesic') return 'wgs84-ellipsoidal-geodesic';
  if (methodId === 'ae-projected-plane') return 'ae-straight-projected-chord';
  return 'gleason-straight-projected-chord';
}

function segmentSamples(
  methodId: MeasurementMethodId,
  start: GeoPoint,
  end: GeoPoint,
  steps: number,
): readonly Readonly<GeoPoint>[] {
  if (methodId === 'wgs84-geodesic') {
    return sampleWgs84Geodesic(start, end, steps);
  }
  if (methodId === 'ae-projected-plane') {
    return sampleProjectedChord(start, end, steps, aeForward, point => aeInverse(point));
  }
  return sampleProjectedChord(
    start,
    end,
    steps,
    gleasonForward,
    point => gleasonInverse({ ...point, units: GLEASON_UNITS }),
  );
}

/**
 * P6.7A canonical route rendering contract.
 *
 * One P6.2 route identity chooses exactly one computation method. That method
 * creates one canonical geographic rendering geometry, which is then projected
 * independently by each view. The rendering target never changes the
 * computation method, quantity, unit or scale basis.
 */
export function buildSameRouteRenderingPlan(
  state: OrderedRouteState,
  methodId: MeasurementMethodId,
  stepsPerSegment = SAME_ROUTE_RENDERING_STEPS_PER_SEGMENT,
): Readonly<SameRouteRenderingPlan> {
  const steps = Math.max(1, Math.min(256, Math.floor(stepsPerSegment)));
  const computation = measurementComputationIdentity(methodId, 'distance');
  const canonicalPoints = Object.freeze(state.points.map(item => Object.freeze({
    pointId: item.pointId,
    point: exactPoint(item.endpoint.point),
  })));
  const segments = Object.freeze(canonicalPoints.slice(0, -1).map((start, index) => {
    const end = canonicalPoints[index + 1];
    return Object.freeze({
      segmentId: state.segments[index]?.segmentId ?? `route-segment:${start.pointId}->${end.pointId}`,
      index,
      fromPointId: start.pointId,
      toPointId: end.pointId,
      samples: segmentSamples(methodId, start.point, end.point, steps),
    });
  }));
  const visualizations = Object.freeze({
    gleason: measurementVisualizationIdentity(computation, 'gleason'),
    ae: measurementVisualizationIdentity(computation, 'ae'),
    wgs84: measurementVisualizationIdentity(computation, 'wgs84'),
  });

  return Object.freeze({
    schemaVersion: SAME_ROUTE_RENDERING_VERSION,
    routeId: state.routeId,
    routeRevision: state.revision,
    canonicalPointIds: Object.freeze(canonicalPoints.map(item => item.pointId)),
    canonicalPoints,
    computation,
    geometryKind: geometryKind(methodId),
    stepsPerSegment: steps,
    segments,
    visualizations,
  });
}
