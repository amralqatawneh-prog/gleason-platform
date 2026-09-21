import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PolygonMeasurementError,
  validatePolygonMeasurementPoints,
} from '../.phase1-test-build/measurement/polygonSemantics.js';
import { localWgs84PolygonMeasurement } from '../.phase1-test-build/measurement/wgs84Polygon.js';
import { localAEPolygonMeasurement } from '../.phase1-test-build/measurement/aePolygon.js';
import { localGleasonPolygonMeasurement } from '../.phase1-test-build/measurement/gleasonPolygon.js';

const point = (point_id, latitude, longitude) => ({ point_id, latitude, longitude });

test('P6.6 Gleason closed triangle exposes normalized perimeter, signed area and primary area', () => {
  const result = localGleasonPolygonMeasurement([
    point('A', 90, 0),
    point('B', 0, 0),
    point('C', 0, 90),
  ]);
  assert.equal(result.output.path_semantics, 'closed-polygon');
  assert.equal(result.output.closure_semantics, 'implicit-last-to-first');
  assert.equal(result.output.segment_count, 3);
  assert.equal(result.output.orientation, 'counterclockwise');
  assert.ok(Math.abs(result.output.perimeter_normalized_radius_unit - (1 + Math.SQRT1_2)) < 1e-15);
  assert.ok(Math.abs(result.output.signed_area_normalized_radius_unit_squared - 0.125) < 1e-15);
  assert.equal(result.output.area_normalized_radius_unit_squared, 0.125);
  assert.equal(result.output.segments.at(-1).to_point_id, 'A');
});

test('P6.6 AE closed triangle uses projected-plane metres and square metres', () => {
  const result = localAEPolygonMeasurement([
    point('A', 90, 0),
    point('B', 0, 0),
    point('C', 0, 90),
  ]);
  assert.equal(result.output.method_id, 'ae-projected-plane');
  assert.equal(result.output.segment_count, 3);
  assert.equal(result.output.orientation, 'counterclockwise');
  assert.ok(result.output.perimeter_m > 34_000_000);
  assert.ok(result.output.area_m2 > 50_000_000_000_000);
  assert.equal(result.output.area_m2, Math.abs(result.output.signed_area_m2));
});

test('P6.6 WGS84 polygon uses signed geodesic area and closed geodesic perimeter', () => {
  const result = localWgs84PolygonMeasurement([
    point('A', 90, 0),
    point('B', 0, 0),
    point('C', 0, 90),
  ]);
  assert.equal(result.output.method_id, 'wgs84-geodesic');
  assert.equal(result.output.orientation, 'counterclockwise');
  assert.equal(result.output.segment_count, 3);
  assert.ok(Math.abs(result.output.perimeter_m - 30022685.630020067) < 1e-5);
  assert.ok(Math.abs(result.output.area_m2 - 63758202715511.055) < 0.1);
});

test('P6.6 reversing a ring preserves perimeter/primary area and flips signed area', () => {
  const forwardPoints = [
    point('A', 25.285447, 51.53104),
    point('B', 31.9539, 35.9106),
    point('C', 40.7128, -74.006),
  ];
  for (const measure of [localWgs84PolygonMeasurement, localAEPolygonMeasurement, localGleasonPolygonMeasurement]) {
    const forward = measure(forwardPoints);
    const reverse = measure([...forwardPoints].reverse());
    const f = forward.output;
    const r = reverse.output;
    const perimeterKey = 'perimeter_m' in f ? 'perimeter_m' : 'perimeter_normalized_radius_unit';
    const areaKey = 'area_m2' in f ? 'area_m2' : 'area_normalized_radius_unit_squared';
    const signedKey = 'signed_area_m2' in f ? 'signed_area_m2' : 'signed_area_normalized_radius_unit_squared';
    assert.ok(Math.abs(f[perimeterKey] - r[perimeterKey]) < 1e-5);
    assert.ok(Math.abs(f[areaKey] - r[areaKey]) < 1e-4);
    assert.ok(Math.abs(f[signedKey] + r[signedKey]) < 1e-4);
    assert.notEqual(f.orientation, r.orientation);
  }
});

test('P6.6 canonical polygon validation rejects explicit closure, repeated vertices and bad coordinates', () => {
  const valid = validatePolygonMeasurementPoints([
    point('A', 0, 0),
    point('B', 0, 1),
    point('C', 1, 0),
  ]);
  assert.equal(valid.length, 3);

  assert.throws(
    () => validatePolygonMeasurementPoints([point('A', 0, 0), point('B', 0, 1)]),
    error => error instanceof PolygonMeasurementError && error.code === 'too-few-points',
  );
  assert.throws(
    () => validatePolygonMeasurementPoints([
      point('A', 0, 0),
      point('B', 0, 1),
      point('C', 1, 0),
      point('D', 0, 0),
    ]),
    error => error instanceof PolygonMeasurementError && error.code === 'repeated-coordinate',
  );
  assert.throws(
    () => validatePolygonMeasurementPoints([
      point('A', 0, 0),
      point('A', 0, 1),
      point('C', 1, 0),
    ]),
    error => error instanceof PolygonMeasurementError && error.code === 'duplicate-point-id',
  );
  assert.throws(
    () => validatePolygonMeasurementPoints([
      point('A', 91, 0),
      point('B', 0, 1),
      point('C', 1, 0),
    ]),
    error => error instanceof PolygonMeasurementError && error.code === 'invalid-coordinate',
  );
});

test('P6.6 degenerate algebraic planar area fails closed', () => {
  assert.throws(
    () => localGleasonPolygonMeasurement([
      point('A', 0, -45),
      point('B', 0, 0),
      point('C', 0, 45),
      point('D', 0, 0),
    ]),
    error => error instanceof PolygonMeasurementError
      && (error.code === 'repeated-coordinate' || error.code === 'degenerate-area'),
  );
});
