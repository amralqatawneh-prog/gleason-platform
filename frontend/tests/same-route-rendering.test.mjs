import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFreePoint } from '../.phase1-test-build/comparison/geographicSelection.js';
import { aeForward } from '../.phase1-test-build/models/ae.js';
import { gleasonForward } from '../.phase1-test-build/models/gleason.js';
import {
  INITIAL_ORDERED_ROUTE_STATE,
  orderedRouteReducer,
} from '../.phase1-test-build/measurement/routeState.js';
import {
  buildSameRouteRenderingPlan,
  SAME_ROUTE_RENDERING_VERSION,
} from '../.phase1-test-build/measurement/sameRouteRendering.js';

function add(state, latitude, longitude, model = 'wgs84') {
  return orderedRouteReducer(state, {
    type: 'add-selection',
    selection: selectFreePoint(model, { latitude, longitude }),
  });
}

function route(...points) {
  let state = INITIAL_ORDERED_ROUTE_STATE;
  for (const [lat, lon] of points) state = add(state, lat, lon);
  return state;
}

test('P6.7A one canonical route drives three visualization identities without relabeling computation', () => {
  const state = route([25.2854, 51.531], [31.9539, 35.9106], [40.7128, -74.006]);
  const plan = buildSameRouteRenderingPlan(state, 'wgs84-geodesic', 8);

  assert.equal(plan.schemaVersion, SAME_ROUTE_RENDERING_VERSION);
  assert.equal(plan.routeId, 'transient-route');
  assert.equal(plan.routeRevision, state.revision);
  assert.deepEqual(plan.canonicalPointIds, state.points.map(point => point.pointId));
  assert.equal(plan.segments.length, 2);
  assert.equal(plan.computation.methodId, 'wgs84-geodesic');
  assert.equal(plan.computation.unit, 'metre');
  assert.equal(plan.geometryKind, 'wgs84-ellipsoidal-geodesic');

  for (const model of ['gleason', 'ae', 'wgs84']) {
    const identity = plan.visualizations[model];
    assert.equal(identity.computation.methodId, 'wgs84-geodesic');
    assert.equal(identity.computation.unit, 'metre');
    assert.equal(identity.renderedOnModel, model);
    assert.equal(identity.interpretationRule, 'preserve-computation-identity');
  }
});

test('P6.7A WGS84 rendering geometry follows the ellipsoidal geodesic and preserves exact endpoints', () => {
  const plan = buildSameRouteRenderingPlan(route([0, 0], [0, 90]), 'wgs84-geodesic', 4);
  const segment = plan.segments[0];

  assert.equal(segment.samples.length, 5);
  assert.deepEqual(segment.samples[0], { latitude: 0, longitude: 0 });
  assert.deepEqual(segment.samples.at(-1), { latitude: 0, longitude: 90 });
  assert.ok(Math.abs(segment.samples[2].latitude) < 1e-9);
  assert.ok(Math.abs(segment.samples[2].longitude - 45) < 1e-8);
});

test('P6.7A AE computation is sampled from one straight AE chord before visualization', () => {
  const start = { latitude: 25, longitude: 51 };
  const end = { latitude: -20, longitude: -120 };
  const plan = buildSameRouteRenderingPlan(route([start.latitude, start.longitude], [end.latitude, end.longitude]), 'ae-projected-plane', 2);
  const midpoint = plan.segments[0].samples[1];
  const a = aeForward(start);
  const b = aeForward(end);
  const m = aeForward(midpoint);

  assert.equal(plan.geometryKind, 'ae-straight-projected-chord');
  assert.ok(Math.abs(m.x - (a.x + b.x) / 2) < 1e-5);
  assert.ok(Math.abs(m.y - (a.y + b.y) / 2) < 1e-5);
  for (const model of ['gleason', 'ae', 'wgs84']) {
    assert.equal(plan.visualizations[model].computation.methodId, 'ae-projected-plane');
  }
});

test('P6.7A Gleason computation is sampled from one straight normalized-plane chord before visualization', () => {
  const start = { latitude: 50, longitude: 20 };
  const end = { latitude: -30, longitude: 150 };
  const plan = buildSameRouteRenderingPlan(route([start.latitude, start.longitude], [end.latitude, end.longitude]), 'gleason-native-normalized', 2);
  const midpoint = plan.segments[0].samples[1];
  const a = gleasonForward(start);
  const b = gleasonForward(end);
  const m = gleasonForward(midpoint);

  assert.equal(plan.geometryKind, 'gleason-straight-projected-chord');
  assert.ok(Math.abs(m.x - (a.x + b.x) / 2) < 1e-12);
  assert.ok(Math.abs(m.y - (a.y + b.y) / 2) < 1e-12);
  assert.equal(plan.computation.unit, 'normalized-radius-unit');
});

test('P6.7A antimeridian and polar routes stay finite for all three computation identities', () => {
  const state = route([80, 179], [82, -179], [-70, 170]);
  for (const method of ['wgs84-geodesic', 'ae-projected-plane', 'gleason-native-normalized']) {
    const plan = buildSameRouteRenderingPlan(state, method, 12);
    assert.equal(plan.segments.length, 2);
    for (const segment of plan.segments) {
      for (const sample of segment.samples) {
        assert.ok(Number.isFinite(sample.latitude));
        assert.ok(Number.isFinite(sample.longitude));
        assert.ok(Math.abs(sample.latitude) <= 90 + 1e-9);
        assert.ok(Math.abs(sample.longitude) <= 180 + 1e-9);
      }
    }
  }
});

test('P6.7A route edits produce a fresh plan revision while preserving the canonical route identity', () => {
  let state = route([10, 20], [20, 30], [30, 40]);
  const first = buildSameRouteRenderingPlan(state, 'wgs84-geodesic', 4);
  state = orderedRouteReducer(state, { type: 'move', pointId: 'route-point-3', direction: 'up' });
  const second = buildSameRouteRenderingPlan(state, 'wgs84-geodesic', 4);

  assert.equal(first.routeId, second.routeId);
  assert.notEqual(first.routeRevision, second.routeRevision);
  assert.deepEqual(first.canonicalPointIds, ['route-point-1', 'route-point-2', 'route-point-3']);
  assert.deepEqual(second.canonicalPointIds, ['route-point-1', 'route-point-3', 'route-point-2']);
  assert.equal(second.segments[0].segmentId, 'route-segment:route-point-1->route-point-3');
});

test('P6.7A fewer than two points fail closed to no render segments but keep inspectable identities', () => {
  let state = INITIAL_ORDERED_ROUTE_STATE;
  state = add(state, 25, 51);
  const plan = buildSameRouteRenderingPlan(state, 'gleason-native-normalized');

  assert.equal(plan.canonicalPoints.length, 1);
  assert.equal(plan.segments.length, 0);
  assert.equal(plan.computation.methodId, 'gleason-native-normalized');
  assert.equal(plan.visualizations.wgs84.renderedOnModel, 'wgs84');
});

test('P6.7A repeated coordinates remain finite and do not invent provider route semantics', () => {
  const state = route([25, 51], [25, 51]);
  for (const method of ['wgs84-geodesic', 'ae-projected-plane', 'gleason-native-normalized']) {
    const plan = buildSameRouteRenderingPlan(state, method, 3);
    assert.equal(plan.segments[0].samples.length, 4);
    assert.equal('provider' in plan, false);
    assert.equal('duration' in plan, false);
    for (const sample of plan.segments[0].samples) {
      assert.ok(Number.isFinite(sample.latitude));
      assert.ok(Number.isFinite(sample.longitude));
    }
  }
});
