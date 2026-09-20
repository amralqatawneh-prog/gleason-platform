import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFreePoint, selectPlace } from '../.phase1-test-build/comparison/geographicSelection.js';
import { offlineResult } from '../.phase1-test-build/search/placeSelection.js';
import {
  INITIAL_ORDERED_ROUTE_STATE,
  orderedRouteReducer,
  ORDERED_ROUTE_STATE_VERSION,
} from '../.phase1-test-build/measurement/routeState.js';

const source = {
  sourceId: 'test',
  name: 'Test source',
  version: 'test-v1',
  license: 'TEST-ONLY',
  sourceUrl: 'https://example.invalid',
};
const place = (id, name, latitude, longitude, category = 'city') => offlineResult({
  id,
  category,
  name,
  nameAr: `اختبار ${name}`,
  countryCode: 'QA',
  latitude,
  longitude,
  sourceId: 'test',
  sourceRecordId: id,
  coordinateClassification: 'TEST_ONLY_SYNTHETIC_POINT',
  source,
});

function add(state, selection) {
  return orderedRouteReducer(state, { type: 'add-selection', selection });
}

test('P6.2 builds ordered A→B→C state with explicit stable point and segment identities', () => {
  let state = INITIAL_ORDERED_ROUTE_STATE;
  state = add(state, selectPlace(place('doha', 'Doha', 25.285447, 51.53104)));
  state = add(state, selectPlace(place('amman', 'Amman', 31.9539, 35.9106)));
  state = add(state, selectFreePoint('gleason', { latitude: 10, longitude: 20, x: 999, y: 888 }));

  assert.equal(state.schemaVersion, ORDERED_ROUTE_STATE_VERSION);
  assert.equal(state.routeId, 'transient-route');
  assert.deepEqual(state.points.map(point => point.pointId), ['route-point-1', 'route-point-2', 'route-point-3']);
  assert.deepEqual(state.segments.map(segment => [segment.fromPointId, segment.toPointId]), [
    ['route-point-1', 'route-point-2'],
    ['route-point-2', 'route-point-3'],
  ]);
  assert.equal(state.points[0].endpoint.place.id, 'doha');
  assert.equal(state.points[2].endpoint.selectionKind, 'free-point');
  assert.equal(state.points[2].endpoint.sourceModel, 'gleason');
  assert.deepEqual(state.points[2].endpoint.point, { latitude: 10, longitude: 20 });
  assert.equal('x' in state.points[2].endpoint.point, false);
  assert.equal('y' in state.points[2].endpoint.point, false);
  assert.equal('ellipsoidalHeightM' in state.points[2].endpoint.point, false);
  assert.equal(state.revision, 3);
});

test('P6.2 rejects a country record without mutating ordered points or history', () => {
  let state = add(INITIAL_ORDERED_ROUTE_STATE, selectPlace(place('doha', 'Doha', 25, 51)));
  const beforePoints = state.points;
  const beforeHistory = state.history;
  const beforeRevision = state.revision;
  state = add(state, selectPlace(place('qa', 'Qatar', 25.3, 51.2, 'country')));

  assert.equal(state.lastError, 'ambiguous-country-endpoint');
  assert.equal(state.points, beforePoints);
  assert.equal(state.history, beforeHistory);
  assert.equal(state.revision, beforeRevision);
  assert.equal(state.nextPointOrdinal, 2);
});

test('P6.2 remove and reorder rebuild only segment identity; no numeric quantity leaks in', () => {
  let state = INITIAL_ORDERED_ROUTE_STATE;
  state = add(state, selectFreePoint('wgs84', { latitude: 1, longitude: 1 }));
  state = add(state, selectFreePoint('ae', { latitude: 2, longitude: 2 }));
  state = add(state, selectFreePoint('gleason', { latitude: 3, longitude: 3 }));

  state = orderedRouteReducer(state, { type: 'move', pointId: 'route-point-3', direction: 'up' });
  assert.deepEqual(state.points.map(point => point.pointId), ['route-point-1', 'route-point-3', 'route-point-2']);
  assert.deepEqual(state.segments.map(segment => segment.segmentId), [
    'route-segment:route-point-1->route-point-3',
    'route-segment:route-point-3->route-point-2',
  ]);

  state = orderedRouteReducer(state, { type: 'remove', pointId: 'route-point-3' });
  assert.deepEqual(state.points.map(point => point.pointId), ['route-point-1', 'route-point-2']);
  assert.equal(state.segments.length, 1);
  assert.equal('distance' in state.segments[0], false);
  assert.equal('value' in state.segments[0], false);
  assert.equal('unit' in state.segments[0], false);
});

test('P6.2 undo restores prior ordered snapshots while point IDs remain monotonic and never reused', () => {
  let state = INITIAL_ORDERED_ROUTE_STATE;
  state = add(state, selectFreePoint('wgs84', { latitude: 1, longitude: 1 }));
  state = add(state, selectFreePoint('wgs84', { latitude: 2, longitude: 2 }));
  assert.equal(state.nextPointOrdinal, 3);

  state = orderedRouteReducer(state, { type: 'clear' });
  assert.equal(state.points.length, 0);
  state = orderedRouteReducer(state, { type: 'undo' });
  assert.deepEqual(state.points.map(point => point.pointId), ['route-point-1', 'route-point-2']);
  assert.equal(state.nextPointOrdinal, 3);

  state = add(state, selectFreePoint('wgs84', { latitude: 3, longitude: 3 }));
  assert.deepEqual(state.points.map(point => point.pointId), ['route-point-1', 'route-point-2', 'route-point-3']);
  assert.equal(state.nextPointOrdinal, 4);
});

test('P6.2 no-op moves and unknown removals do not create revisions or undo entries', () => {
  let state = add(INITIAL_ORDERED_ROUTE_STATE, selectFreePoint('wgs84', { latitude: 1, longitude: 1 }));
  const sameMove = orderedRouteReducer(state, { type: 'move', pointId: 'route-point-1', direction: 'up' });
  assert.equal(sameMove, state);
  const sameRemove = orderedRouteReducer(state, { type: 'remove', pointId: 'missing' });
  assert.equal(sameRemove, state);
});

test('P6.2 dismisses route errors without pretending a route mutation occurred', () => {
  let state = add(INITIAL_ORDERED_ROUTE_STATE, selectPlace(place('qa', 'Qatar', 25.3, 51.2, 'country')));
  assert.equal(state.lastError, 'ambiguous-country-endpoint');
  const revision = state.revision;
  state = orderedRouteReducer(state, { type: 'dismiss-error' });
  assert.equal(state.lastError, null);
  assert.equal(state.revision, revision);
  assert.equal(state.points.length, 0);
});
