import { AE_DEFINITION, AE_MODEL_VERSION, aeForward } from '../models/ae.js';
import {
  measurePlanarPolygon,
  validatePolygonMeasurementPoints,
  type PolygonMeasurementPoint,
  type PolygonOrientation,
} from './polygonSemantics.js';

export interface AEPolygonSegment {
  readonly edge_id: string;
  readonly index: number;
  readonly from_point_id: string;
  readonly to_point_id: string;
  readonly from_x_m: number;
  readonly from_y_m: number;
  readonly to_x_m: number;
  readonly to_y_m: number;
  readonly distance_m: number;
}

export interface AEPolygonResult {
  readonly semantic_type: 'REFERENCE_RESULT';
  readonly operation: 'ae_polygon_measurement';
  readonly input: { readonly polygon_id: string; readonly points: readonly Readonly<PolygonMeasurementPoint>[] };
  readonly output: {
    readonly method_id: 'ae-projected-plane';
    readonly quantities: readonly ['perimeter', 'area'];
    readonly perimeter_unit: 'metre';
    readonly area_unit: 'square-metre';
    readonly scale_basis: 'ae-projected-plane-si-metre';
    readonly path_semantics: 'closed-polygon';
    readonly closure_semantics: 'implicit-last-to-first';
    readonly self_intersection_policy: 'algebraic-signed-area';
    readonly interior_rule: 'absolute-algebraic-planar-area';
    readonly orientation: PolygonOrientation;
    readonly segment_geometry: 'straight-projected-chord';
    readonly segment_count: number;
    readonly perimeter_m: number;
    readonly signed_area_m2: number;
    readonly area_m2: number;
    readonly segments: readonly AEPolygonSegment[];
  };
  readonly provenance: {
    readonly semantic_type: 'REFERENCE_RESULT';
    readonly provider_id: 'ae-north-pole';
    readonly provider_version: string;
    readonly reference_frame: string;
    readonly operation: 'ae_polygon_measurement';
    readonly implementation: 'proj4 (browser) + typescript-math';
    readonly implementation_version: 'P6.6-v1';
    readonly algorithm: string;
    readonly units: Readonly<Record<string, string>>;
    readonly notes: readonly string[];
  };
}

export function localAEPolygonMeasurement(
  pointsInput: readonly PolygonMeasurementPoint[],
  polygonId = 'transient-polygon',
): AEPolygonResult {
  const points = validatePolygonMeasurementPoints(pointsInput);
  const projected = points.map(point => {
    const xy = aeForward({ latitude: point.latitude, longitude: point.longitude });
    return Object.freeze({ point_id: point.point_id, x: xy.x, y: xy.y });
  });
  const measured = measurePlanarPolygon(projected, 1e-6, 1e-9);
  const segments = measured.edges.map(edge => Object.freeze({
    edge_id: edge.edge_id,
    index: edge.index,
    from_point_id: edge.from_point_id,
    to_point_id: edge.to_point_id,
    from_x_m: edge.from_x,
    from_y_m: edge.from_y,
    to_x_m: edge.to_x,
    to_y_m: edge.to_y,
    distance_m: edge.distance,
  }));

  return Object.freeze({
    semantic_type: 'REFERENCE_RESULT',
    operation: 'ae_polygon_measurement',
    input: Object.freeze({ polygon_id: polygonId, points }),
    output: Object.freeze({
      method_id: 'ae-projected-plane',
      quantities: Object.freeze(['perimeter', 'area'] as const),
      perimeter_unit: 'metre',
      area_unit: 'square-metre',
      scale_basis: 'ae-projected-plane-si-metre',
      path_semantics: 'closed-polygon',
      closure_semantics: 'implicit-last-to-first',
      self_intersection_policy: 'algebraic-signed-area',
      interior_rule: 'absolute-algebraic-planar-area',
      orientation: measured.orientation,
      segment_geometry: 'straight-projected-chord',
      segment_count: segments.length,
      perimeter_m: measured.perimeter,
      signed_area_m2: measured.signedArea,
      area_m2: measured.area,
      segments: Object.freeze(segments),
    }),
    provenance: Object.freeze({
      semantic_type: 'REFERENCE_RESULT',
      provider_id: 'ae-north-pole',
      provider_version: AE_MODEL_VERSION,
      reference_frame: 'WGS84 geographic input -> north-polar AE projected plane',
      operation: 'ae_polygon_measurement',
      implementation: 'proj4 (browser) + typescript-math',
      implementation_version: 'P6.6-v1',
      algorithm: `${AE_DEFINITION}; Euclidean closed-edge perimeter; signed shoelace area`,
      units: Object.freeze({ projected_coordinates: 'metres', perimeter: 'metres', area: 'square metres' }),
      notes: Object.freeze([
        'The ring closes implicitly from the last explicit vertex to the first.',
        'Projected-plane metres and square metres are not relabeled as WGS84 ellipsoidal quantities.',
        'Self-intersecting rings use algebraic signed shoelace accumulation.',
        'Projection distortion is part of the AE method.',
      ]),
    }),
  });
}
