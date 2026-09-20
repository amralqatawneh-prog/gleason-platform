import test from 'node:test';
import assert from 'node:assert/strict';
import {
  localAERouteDistance,
  validateAERouteDistancePoints,
  AE_ROUTE_DISTANCE_MAX_POINTS,
  AERouteDistanceError,
} from '../.phase1-test-build/measurement/aeRouteDistance.js';

const point = (point_id, latitude, longitude) => ({ point_id, latitude, longitude });

test('P6.4 local AE distance measures adjacent straight projected chords', () => {
  const result = localAERouteDistance([
    point('route-point-1', 90, 0),
    point('route-point-2', 0, 0),
    point('route-point-3', 0, 90),
  ]);

  assert.equal(result.semantic_type, 'REFERENCE_RESULT');
  assert.equal(result.operation, 'ae_route_distance');
  assert.equal(result.output.method_id, 'ae-projected-plane');
  assert.equal(result.output.quantity, 'distance');
  assert.equal(result.output.unit, 'metre');
  assert.equal(result.output.scale_basis, 'ae-projected-plane-si-metre');
  assert.equal(result.output.path_semantics, 'open-polyline');
  assert.equal(result.output.segment_geometry, 'straight-projected-chord');
  assert.equal(result.output.segment_count, 2);
  assert.equal(result.output.segments[0].segment_id, 'route-segment:route-point-1->route-point-2');
  assert.equal(result.output.segments[1].segment_id, 'route-segment:route-point-2->route-point-3');
  assert.ok(Math.abs(result.output.segments[0].distance_m - 10001965.729312722) < 0.01);
  assert.ok(Math.abs(result.output.segments[1].distance_m - 14144915.584784957) < 0.01);
  assert.ok(Math.abs(result.output.total_distance_m - 24146881.31409768) < 0.02);
  assert.equal(result.provenance.implementation, 'proj4 (browser)');
});

test('P6.4 AE antimeridian chord stays distinct from WGS84 short geodesic', () => {
  const result = localAERouteDistance([
    point('route-point-1', 0, 179),
    point('route-point-2', 0, -179),
  ]);
  assert.ok(Math.abs(result.output.total_distance_m - 349116.7421594914) < 0.05);
  assert.ok(Math.abs(result.output.total_distance_m - 222638.98158654713) > 100000);
});

test('P6.4 repeated points are zero and reverse route preserves total', () => {
  const forwardPoints = [
    point('route-point-1', 25.285447, 51.53104),
    point('route-point-2', 25.285447, 51.53104),
    point('route-point-3', 31.9539, 35.9106),
  ];
  const forward = localAERouteDistance(forwardPoints);
  const reverse = localAERouteDistance([...forwardPoints].reverse());

  assert.equal(forward.output.segments[0].distance_m, 0);
  assert.ok(forward.output.segments[1].distance_m > 0);
  assert.ok(Math.abs(forward.output.total_distance_m - reverse.output.total_distance_m) < 1e-6);
  const forwardSegments = forward.output.segments.map(item => item.distance_m);
  const reverseSegments = reverse.output.segments.map(item => item.distance_m);
  for (let index = 0; index < forwardSegments.length; index += 1) {
    assert.ok(Math.abs(forwardSegments[index] - reverseSegments[reverseSegments.length - 1 - index]) < 1e-6);
  }
});

test('P6.4 input validation fails closed and keeps canonical geographic input only', () => {
  assert.equal(AE_ROUTE_DISTANCE_MAX_POINTS, 50);
  const valid = validateAERouteDistancePoints([
    point('route-point-1', 10, 20),
    point('route-point-2', 11, 21),
  ]);
  assert.deepEqual(valid[0], { point_id: 'route-point-1', latitude: 10, longitude: 20 });
  assert.equal('x' in valid[0], false);
  assert.equal('ellipsoidal_height_m' in valid[0], false);

  assert.throws(
    () => validateAERouteDistancePoints([point('route-point-1', 0, 0)]),
    error => error instanceof AERouteDistanceError && error.code === 'too-few-points',
  );
  assert.throws(
    () => validateAERouteDistancePoints([
      point('route-point-1', 0, 0),
      point('route-point-1', 0, 1),
    ]),
    error => error instanceof AERouteDistanceError && error.code === 'duplicate-point-id',
  );
  assert.throws(
    () => validateAERouteDistancePoints([
      point('route-point-1', 0, 181),
      point('route-point-2', 0, 1),
    ]),
    error => error instanceof AERouteDistanceError && error.code === 'invalid-coordinate',
  );
});
