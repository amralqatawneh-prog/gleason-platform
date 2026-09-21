import {
  GLEASON_MODEL_ID,
  GLEASON_MODEL_VERSION,
  gleasonForward,
  GLEASON_MAP_RULER_NAUTICAL_MILES_PER_NRU,
} from '../models/gleason.js';
import {
  measurePlanarPolygon,
  validatePolygonMeasurementPoints,
  type PolygonMeasurementPoint,
  type PolygonOrientation,
} from './polygonSemantics.js';

export interface GleasonPolygonSegment {
  readonly edge_id: string;
  readonly index: number;
  readonly from_point_id: string;
  readonly to_point_id: string;
  readonly from_x_normalized_radius: number;
  readonly from_y_normalized_radius: number;
  readonly to_x_normalized_radius: number;
  readonly to_y_normalized_radius: number;
  readonly distance_normalized_radius_unit: number;
}

export interface GleasonPolygonResult {
  readonly semantic_type: 'COMPUTED_RESULT';
  readonly operation: 'gleason_polygon_measurement';
  readonly input: { readonly polygon_id: string; readonly points: readonly Readonly<PolygonMeasurementPoint>[] };
  readonly output: {
    readonly method_id: 'gleason-native-normalized';
    readonly quantities: readonly ['perimeter', 'area'];
    readonly perimeter_unit: 'normalized-radius-unit';
    readonly area_unit: 'normalized-radius-unit-squared';
    readonly scale_basis: 'gleason-normalized-model-radius';
    readonly path_semantics: 'closed-polygon';
    readonly closure_semantics: 'implicit-last-to-first';
    readonly self_intersection_policy: 'algebraic-signed-area';
    readonly interior_rule: 'absolute-algebraic-planar-area';
    readonly orientation: PolygonOrientation;
    readonly segment_geometry: 'straight-projected-chord';
    readonly segment_count: number;
    readonly perimeter_normalized_radius_unit: number;
    readonly signed_area_normalized_radius_unit_squared: number;
    readonly area_normalized_radius_unit_squared: number;
    readonly map_ruler_method_id: 'gleason-map-ruler-derived';
    readonly map_ruler_evidence_level: 'DERIVED';
    readonly perimeter_map_ruler_nautical_mile_derived: number;
    readonly area_map_ruler_nautical_mile_squared_derived: number;
    readonly segments: readonly GleasonPolygonSegment[];
  };
  readonly provenance: {
    readonly semantic_type: 'COMPUTED_RESULT';
    readonly provider_id: 'gleason-historical';
    readonly provider_version: string;
    readonly reference_frame: string;
    readonly operation: 'gleason_polygon_measurement';
    readonly implementation: 'typescript-math (browser)';
    readonly implementation_version: 'P6.6-v1';
    readonly algorithm: string;
    readonly units: Readonly<Record<string, string>>;
    readonly notes: readonly string[];
  };
}

export function localGleasonPolygonMeasurement(
  pointsInput: readonly PolygonMeasurementPoint[],
  polygonId = 'transient-polygon',
): GleasonPolygonResult {
  const points = validatePolygonMeasurementPoints(pointsInput);
  const projected = points.map(point => {
    const xy = gleasonForward({ latitude: point.latitude, longitude: point.longitude });
    return Object.freeze({ point_id: point.point_id, x: xy.x, y: xy.y });
  });
  const measured = measurePlanarPolygon(projected, 1e-15, 1e-15);
  const segments = measured.edges.map(edge => Object.freeze({
    edge_id: edge.edge_id,
    index: edge.index,
    from_point_id: edge.from_point_id,
    to_point_id: edge.to_point_id,
    from_x_normalized_radius: edge.from_x,
    from_y_normalized_radius: edge.from_y,
    to_x_normalized_radius: edge.to_x,
    to_y_normalized_radius: edge.to_y,
    distance_normalized_radius_unit: edge.distance,
  }));

  return Object.freeze({
    semantic_type: 'COMPUTED_RESULT',
    operation: 'gleason_polygon_measurement',
    input: Object.freeze({ polygon_id: polygonId, points }),
    output: Object.freeze({
      method_id: 'gleason-native-normalized',
      quantities: Object.freeze(['perimeter', 'area'] as const),
      perimeter_unit: 'normalized-radius-unit',
      area_unit: 'normalized-radius-unit-squared',
      scale_basis: 'gleason-normalized-model-radius',
      path_semantics: 'closed-polygon',
      closure_semantics: 'implicit-last-to-first',
      self_intersection_policy: 'algebraic-signed-area',
      interior_rule: 'absolute-algebraic-planar-area',
      orientation: measured.orientation,
      segment_geometry: 'straight-projected-chord',
      segment_count: segments.length,
      perimeter_normalized_radius_unit: measured.perimeter,
      signed_area_normalized_radius_unit_squared: measured.signedArea,
      area_normalized_radius_unit_squared: measured.area,
      map_ruler_method_id: 'gleason-map-ruler-derived',
      map_ruler_evidence_level: 'DERIVED',
      perimeter_map_ruler_nautical_mile_derived:
        measured.perimeter * GLEASON_MAP_RULER_NAUTICAL_MILES_PER_NRU,
      area_map_ruler_nautical_mile_squared_derived:
        measured.area * GLEASON_MAP_RULER_NAUTICAL_MILES_PER_NRU ** 2,
      segments: Object.freeze(segments),
    }),
    provenance: Object.freeze({
      semantic_type: 'COMPUTED_RESULT',
      provider_id: GLEASON_MODEL_ID,
      provider_version: GLEASON_MODEL_VERSION,
      reference_frame: 'WGS84 geographic input -> derived Gleason normalized-radius plane',
      operation: 'gleason_polygon_measurement',
      implementation: 'typescript-math (browser)',
      implementation_version: 'P6.6-v1',
      algorithm: 'GH-0.2.0 forward projection; Euclidean closed-edge perimeter; signed shoelace area',
      units: Object.freeze({
        projected_coordinates: 'normalized-radius',
        perimeter: 'normalized-radius-unit',
        area: 'normalized-radius-unit-squared',
      }),
      notes: Object.freeze([
        'The ring closes implicitly from the last explicit vertex to the first.',
        'The current analytic reconstruction is project-derived; it is not claimed as a formula printed verbatim in the historical book.',
        'Self-intersecting rings use algebraic signed shoelace accumulation.',
        'No SI perimeter/area conversion exists without a separately documented scale rule.',
      ]),
    }),
  });
}
