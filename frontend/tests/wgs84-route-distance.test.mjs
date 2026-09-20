import test from 'node:test';
import assert from 'node:assert/strict';
import {
  localWgs84RouteDistance,
  validateWgs84RouteDistancePoints,
  WGS84_ROUTE_DISTANCE_MAX_POINTS,
  Wgs84RouteDistanceError,
} from '../.phase1-test-build/measurement/wgs84RouteDistance.js';

const point = (point_id, latitude, longitude) => ({ point_id, latitude, longitude });

test('P6.3 local WGS84 route distance returns adjacent segments and open-polyline total', () => {
  const result = localWgs84RouteDistance([
    point('route-point-1', 0, 0),
    point('route-point-2', 0, 1),
    point('route-point-3', 0, 2),
  ]);

  assert.equal(result.semantic_type, 'REFERENCE_RESULT');
  assert.equal(result.operation, 'wgs84_route_distance');
  assert.equal(result.output.method_id, 'wgs84-geodesic');
  assert.equal(result.output.quantity, 'distance');
  assert.equal(result.output.unit, 'metre');
  assert.equal(result.output.scale_basis, 'wgs84-ellipsoid');
  assert.equal(result.output.path_semantics, 'open-polyline');
  assert.equal(result.output.segment_count, 2);
  assert.equal(result.output.segments[0].segment_id, 'route-segment:route-point-1->route-point-2');
  assert.equal(result.output.segments[1].segment_id, 'route-segment:route-point-2->route-point-3');
  assert.ok(Math.abs(result.output.segments[0].distance_m - 111319.49079327357) < 1e-6);
  assert.ok(Math.abs(result.output.total_distance_m - 222638.98158654713) < 1e-6);
  assert.equal(result.provenance.implementation, 'geographiclib-geodesic (browser)');
});

test('P6.3 local WGS84 distance handles antimeridian and repeated coordinates', () => {
  const antimeridian = localWgs84RouteDistance([
    point('route-point-1', 0, 179),
    point('route-point-2', 0, -179),
  ]);
  assert.ok(Math.abs(antimeridian.output.total_distance_m - 222638.98158654713) < 1e-6);

  const repeated = localWgs84RouteDistance([
    point('route-point-1', 25, 51),
    point('route-point-2', 25, 51),
    point('route-point-3', 26, 52),
  ]);
  assert.equal(repeated.output.segments[0].distance_m, 0);
  assert.ok(repeated.output.segments[1].distance_m > 0);
  assert.ok(Math.abs(repeated.output.total_distance_m - repeated.output.segments[1].distance_m) < 1e-9);
});

test('P6.3 reversed route preserves the total and reverses segment magnitudes', () => {
  const forwardPoints = [
    point('route-point-1', 25.285447, 51.53104),
    point('route-point-2', 31.9539, 35.9106),
    point('route-point-3', 40.7128, -74.006),
  ];
  const reversePoints = [...forwardPoints].reverse();
  const forward = localWgs84RouteDistance(forwardPoints);
  const reverse = localWgs84RouteDistance(reversePoints);

  assert.ok(Math.abs(forward.output.total_distance_m - reverse.output.total_distance_m) < 1e-6);
  const forwardSegments = forward.output.segments.map(item => item.distance_m);
  const reverseSegments = reverse.output.segments.map(item => item.distance_m);
  assert.equal(forwardSegments.length, reverseSegments.length);
  for (let index = 0; index < forwardSegments.length; index += 1) {
    assert.ok(Math.abs(forwardSegments[index] - reverseSegments[reverseSegments.length - 1 - index]) < 1e-6);
  }
});

test('P6.3 input validation fails closed and never invents height', () => {
  assert.equal(WGS84_ROUTE_DISTANCE_MAX_POINTS, 50);
  const valid = validateWgs84RouteDistancePoints([
    point('route-point-1', 10, 20),
    point('route-point-2', 11, 21),
  ]);
  assert.deepEqual(valid[0], { point_id: 'route-point-1', latitude: 10, longitude: 20 });
  assert.equal('ellipsoidal_height_m' in valid[0], false);

  assert.throws(
    () => validateWgs84RouteDistancePoints([point('route-point-1', 0, 0)]),
    error => error instanceof Wgs84RouteDistanceError && error.code === 'too-few-points',
  );
  assert.throws(
    () => validateWgs84RouteDistancePoints([
      point('route-point-1', 0, 0),
      point('route-point-1', 0, 1),
    ]),
    error => error instanceof Wgs84RouteDistanceError && error.code === 'duplicate-point-id',
  );
  assert.throws(
    () => validateWgs84RouteDistancePoints([
      point('route-point-1', 91, 0),
      point('route-point-2', 0, 1),
    ]),
    error => error instanceof Wgs84RouteDistanceError && error.code === 'invalid-coordinate',
  );
});
