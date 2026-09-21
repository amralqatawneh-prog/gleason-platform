import GeographicLib from 'geographiclib-geodesic';
import {
  PolygonMeasurementError,
  polygonOrientation,
  validatePolygonMeasurementPoints,
  type PolygonMeasurementPoint,
  type PolygonOrientation,
} from './polygonSemantics.js';

export interface Wgs84PolygonSegment {
  readonly edge_id: string;
  readonly index: number;
  readonly from_point_id: string;
  readonly to_point_id: string;
  readonly distance_m: number;
}

export interface Wgs84PolygonResult {
  readonly semantic_type: 'REFERENCE_RESULT';
  readonly operation: 'wgs84_polygon_measurement';
  readonly input: {
    readonly polygon_id: string;
    readonly points: readonly Readonly<PolygonMeasurementPoint>[];
  };
  readonly output: {
    readonly method_id: 'wgs84-geodesic';
    readonly quantities: readonly ['perimeter', 'area'];
    readonly perimeter_unit: 'metre';
    readonly area_unit: 'square-metre';
    readonly scale_basis: 'wgs84-ellipsoid';
    readonly path_semantics: 'closed-polygon';
    readonly closure_semantics: 'implicit-last-to-first';
    readonly self_intersection_policy: 'algebraic-signed-area';
    readonly interior_rule: 'signed-half-surface-range';
    readonly orientation: PolygonOrientation;
    readonly segment_count: number;
    readonly perimeter_m: number;
    readonly signed_area_m2: number;
    readonly area_m2: number;
    readonly segments: readonly Wgs84PolygonSegment[];
  };
  readonly provenance: {
    readonly semantic_type: 'REFERENCE_RESULT';
    readonly provider_id: 'wgs84-reference';
    readonly provider_version: 'WGS84-0.4.0';
    readonly reference_frame: 'WGS 84';
    readonly operation: 'wgs84_polygon_measurement';
    readonly implementation: 'geographiclib-geodesic (browser)';
    readonly implementation_version: '2.2.0';
    readonly algorithm: string;
    readonly units: Readonly<Record<string, string>>;
    readonly notes: readonly string[];
  };
}

export function localWgs84PolygonMeasurement(
  pointsInput: readonly PolygonMeasurementPoint[],
  polygonId = 'transient-polygon',
): Wgs84PolygonResult {
  const points = validatePolygonMeasurementPoints(pointsInput);
  const polygon = GeographicLib.Geodesic.WGS84.Polygon(false);
  for (const point of points) polygon.AddPoint(point.latitude, point.longitude);
  const computed = polygon.Compute(false, true);
  const signedArea = Number(computed.area);
  const perimeter = Number(computed.perimeter);
  const orientation = polygonOrientation(signedArea, 1e-6);

  const segments: Wgs84PolygonSegment[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    const inverse = GeographicLib.Geodesic.WGS84.Inverse(
      start.latitude,
      start.longitude,
      end.latitude,
      end.longitude,
    );
    const rawDistance = Number(inverse.s12);
    if (!Number.isFinite(rawDistance)) {
      throw new PolygonMeasurementError('degenerate-area', 'WGS84 polygon edge distance is not finite.');
    }
    segments.push(Object.freeze({
      edge_id: `polygon-edge:${start.point_id}->${end.point_id}`,
      index,
      from_point_id: start.point_id,
      to_point_id: end.point_id,
      distance_m: Math.abs(rawDistance) <= 1e-9 ? 0 : rawDistance,
    }));
  }

  return Object.freeze({
    semantic_type: 'REFERENCE_RESULT',
    operation: 'wgs84_polygon_measurement',
    input: Object.freeze({ polygon_id: polygonId, points }),
    output: Object.freeze({
      method_id: 'wgs84-geodesic',
      quantities: Object.freeze(['perimeter', 'area'] as const),
      perimeter_unit: 'metre',
      area_unit: 'square-metre',
      scale_basis: 'wgs84-ellipsoid',
      path_semantics: 'closed-polygon',
      closure_semantics: 'implicit-last-to-first',
      self_intersection_policy: 'algebraic-signed-area',
      interior_rule: 'signed-half-surface-range',
      orientation,
      segment_count: segments.length,
      perimeter_m: perimeter,
      signed_area_m2: signedArea,
      area_m2: Math.abs(signedArea),
      segments: Object.freeze(segments),
    }),
    provenance: Object.freeze({
      semantic_type: 'REFERENCE_RESULT',
      provider_id: 'wgs84-reference',
      provider_version: 'WGS84-0.4.0',
      reference_frame: 'WGS 84',
      operation: 'wgs84_polygon_measurement',
      implementation: 'geographiclib-geodesic (browser)',
      implementation_version: '2.2.0',
      algorithm: 'GeographicLib WGS84 PolygonArea; Compute(false, true) signed geodesic area and closed perimeter',
      units: Object.freeze({ perimeter: 'metres', area: 'square metres' }),
      notes: Object.freeze([
        'The ring closes implicitly from the last explicit vertex to the first.',
        'Counterclockwise traversal produces positive signed area; clockwise traversal produces negative signed area.',
        'Self-intersecting rings use algebraic signed-area accumulation; no union/fill area is invented.',
        'Signed mode is used instead of silently returning the rest-of-earth complement for opposite orientation.',
        'No road/flight, AE projected-plane, or Gleason-native semantics are implied.',
      ]),
    }),
  });
}
