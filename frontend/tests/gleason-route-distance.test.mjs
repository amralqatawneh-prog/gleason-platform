import test from 'node:test';
import assert from 'node:assert/strict';
import {
  localGleasonRouteDistance,
  validateGleasonRouteDistancePoints,
  GLEASON_ROUTE_DISTANCE_MAX_POINTS,
  GleasonRouteDistanceError,
} from '../.phase1-test-build/measurement/gleasonRouteDistance.js';

const point = (point_id, latitude, longitude) => ({ point_id, latitude, longitude });

test('P6.5 local Gleason distance measures adjacent straight normalized chords', () => {
  const result = localGleasonRouteDistance([
    point('route-point-1', 90, 0),
    point('route-point-2', 0, 0),
    point('route-point-3', 0, 90),
  ]);

  assert.equal(result.semantic_type, 'COMPUTED_RESULT');
  assert.equal(result.operation, 'gleason_route_distance');
  assert.equal(result.output.method_id, 'gleason-native-normalized');
  assert.equal(result.output.quantity, 'distance');
  assert.equal(result.output.unit, 'normalized-radius-unit');
  assert.equal(result.output.scale_basis, 'gleason-normalized-model-radius');
  assert.equal(result.output.path_semantics, 'open-polyline');
  assert.equal(result.output.segment_geometry, 'straight-projected-chord');
  assert.equal(result.output.segment_count, 2);
  assert.equal(result.output.segments[0].segment_id, 'route-segment:route-point-1->route-point-2');
  assert.equal(result.output.segments[1].segment_id, 'route-segment:route-point-2->route-point-3');
  assert.ok(Math.abs(result.output.segments[0].distance_normalized_radius_unit - 0.5) < 1e-15);
  assert.ok(Math.abs(result.output.segments[1].distance_normalized_radius_unit - Math.SQRT1_2) < 1e-15);
  assert.ok(Math.abs(result.output.total_distance_normalized_radius_unit - (0.5 + Math.SQRT1_2)) < 1e-15);
  assert.equal(result.output.map_ruler_method_id, 'gleason-map-ruler-derived');
  assert.equal(result.output.map_ruler_evidence_level, 'DERIVED');
  assert.ok(Math.abs(
    result.output.total_distance_map_ruler_nautical_mile_derived
    - (0.5 + Math.SQRT1_2) * 10800
  ) < 1e-9);
  assert.equal(result.provenance.implementation, 'typescript-math (browser)');
});

test('P6.5 Gleason antimeridian chord is deterministic in native normalized space', () => {
  const result = localGleasonRouteDistance([
    point('route-point-1', 0, 179),
    point('route-point-2', 0, -179),
  ]);
  assert.ok(Math.abs(result.output.total_distance_normalized_radius_unit - 0.01745240643728344) < 1e-15);
});

test('P6.5 repeated points are zero, reverse preserves total, and pole is model center', () => {
  const forwardPoints = [
    point('route-point-1', 25.285447, 51.53104),
    point('route-point-2', 25.285447, 51.53104),
    point('route-point-3', 31.9539, 35.9106),
    point('route-point-4', 90, 0),
  ];
  const forward = localGleasonRouteDistance(forwardPoints);
  const reverse = localGleasonRouteDistance([...forwardPoints].reverse());

  assert.equal(forward.output.segments[0].distance_normalized_radius_unit, 0);
  assert.ok(forward.output.segments[1].distance_normalized_radius_unit > 0);
  const last = forward.output.segments.at(-1);
  assert.ok(Math.abs(last.to_x_normalized_radius) <= Number.EPSILON);
  assert.ok(Math.abs(last.to_y_normalized_radius) <= Number.EPSILON);
  assert.ok(
    Math.abs(
      forward.output.total_distance_normalized_radius_unit
      - reverse.output.total_distance_normalized_radius_unit,
    ) < 1e-15,
  );
});

test('P6.5 input validation fails closed and keeps canonical geographic input only', () => {
  assert.equal(GLEASON_ROUTE_DISTANCE_MAX_POINTS, 50);
  const valid = validateGleasonRouteDistancePoints([
    point('route-point-1', 10, 20),
    point('route-point-2', 11, 21),
  ]);
  assert.deepEqual(valid[0], { point_id: 'route-point-1', latitude: 10, longitude: 20 });
  assert.equal('x' in valid[0], false);
  assert.equal('ellipsoidal_height_m' in valid[0], false);

  assert.throws(
    () => validateGleasonRouteDistancePoints([point('route-point-1', 0, 0)]),
    error => error instanceof GleasonRouteDistanceError && error.code === 'too-few-points',
  );
  assert.throws(
    () => validateGleasonRouteDistancePoints([
      point('route-point-1', 0, 0),
      point('route-point-1', 0, 1),
    ]),
    error => error instanceof GleasonRouteDistanceError && error.code === 'duplicate-point-id',
  );
  assert.throws(
    () => validateGleasonRouteDistancePoints([
      point('route-point-1', 0, 181),
      point('route-point-2', 0, 1),
    ]),
    error => error instanceof GleasonRouteDistanceError && error.code === 'invalid-coordinate',
  );
});
