import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPlace, selectFreePoint } from '../.phase1-test-build/comparison/geographicSelection.js';
import { offlineResult, onlineResult } from '../.phase1-test-build/search/placeSelection.js';

// Explicitly synthetic contract fixtures, not production geography or source claims.
const entry = { id: 'test:1', category: 'city', name: 'Test place', nameAr: 'مكان اختباري',
  countryCode: 'QA', latitude: 12, longitude: 34, sourceId: 'test', sourceRecordId: '1',
  coordinateClassification: 'TEST_ONLY_SYNTHETIC_POINT', source: { sourceId: 'test',
    name: 'Test source', version: 'test-v1', license: 'TEST-ONLY', sourceUrl: 'https://example.invalid' } };

test('search interchange keeps identity, Arabic name, provenance and acquisition mode', () => {
  const offline = selectPlace(offlineResult(entry));
  const online = selectPlace(onlineResult({ id: entry.id, category: entry.category, name: entry.name,
    name_ar: entry.nameAr, country_code: entry.countryCode, latitude: 12, longitude: 34,
    source_record_id: '1', coordinate_classification: entry.coordinateClassification,
    source: { source_id: 'test', name: 'Test source', version: 'test-v1', license: 'TEST-ONLY', source_url: entry.source.sourceUrl } }));
  assert.deepEqual(offline.point, { latitude: 12, longitude: 34 });
  assert.equal(offline.referenceFrame, 'WGS84');
  assert.equal(offline.angularUnits, 'degrees');
  assert.equal(offline.schemaVersion, 1);
  assert.deepEqual({ ...offline.place, offline: false }, online.place);
  assert.equal(offline.place.coordinateClassification, entry.coordinateClassification);
  assert.equal(offline.place.sourceVersion, 'test-v1');
  assert.equal(offline.place.nameAr, entry.nameAr);
});

test('free picks from all models replace a place even at identical coordinates', () => {
  for (const model of ['gleason', 'ae', 'wgs84']) {
    let state = selectPlace(offlineResult(entry));
    state = selectFreePoint(model, state.point);
    assert.equal(state.kind, 'free-point');
    assert.equal(state.origin, 'map');
    assert.equal(state.place, null);
    assert.equal(state.model, model);
    assert.deepEqual(state.point, { latitude: 12, longitude: 34 });
  }
});

test('poles and both antimeridian endpoints are retained without hidden normalization', () => {
  for (const latitude of [-90, 0, 90]) for (const longitude of [-180, 0, 180]) {
    const point = { latitude, longitude };
    assert.deepEqual(selectFreePoint('ae', point).point, point);
  }
});

test('invalid geographic coordinates are rejected before changing shared state', () => {
  for (const point of [ { latitude: 91, longitude: 0 }, { latitude: -91, longitude: 0 },
    { latitude: 0, longitude: 181 }, { latitude: 0, longitude: -181 },
    { latitude: NaN, longitude: 0 }, { latitude: 0, longitude: Infinity },
    { latitude: '12', longitude: 34 } ]) {
    assert.throws(() => selectFreePoint('wgs84', point), RangeError);
    assert.throws(() => selectPlace({ ...offlineResult(entry), ...point }), RangeError);
  }
  assert.throws(() => selectFreePoint('unknown', entry), RangeError);
});

test('unknown height stays absent; valid ellipsoidal height is explicit and finite', () => {
  assert.equal('ellipsoidalHeightM' in selectFreePoint('wgs84', entry).point, false);
  for (const height of [-430, 0, 1234]) {
    assert.equal(selectFreePoint('wgs84', { ...entry, ellipsoidalHeightM: height }).point.ellipsoidalHeightM, height);
  }
  for (const height of [NaN, Infinity, null, '10']) {
    assert.throws(() => selectFreePoint('wgs84', { ...entry, ellipsoidalHeightM: height }), RangeError);
  }
});

test('selection snapshots cannot be corrupted by subsequent input mutation', () => {
  const input = offlineResult(entry);
  const state = selectPlace(input);
  input.name = 'Changed'; input.latitude = 50; input.sourceVersion = 'Changed';
  assert.equal(state.place.name, 'Test place');
  assert.equal(state.place.sourceVersion, 'test-v1');
  assert.equal(state.point.latitude, 12);
  assert.throws(() => { state.point.latitude = 50; }, TypeError);
  assert.throws(() => { state.place.name = 'Changed'; }, TypeError);
  assert.throws(() => { state.place = null; }, TypeError);
});

test('legacy provenance remains explicitly unknown and screen fields are excluded', () => {
  const { source, coordinateClassification, ...legacy } = entry;
  const state = selectPlace(offlineResult(legacy));
  assert.equal(state.place.sourceVersion, null);
  assert.equal(state.place.coordinateClassification, null);
  assert.equal(state.place.provenanceStatus, 'legacy-or-incomplete');
  const free = selectFreePoint('gleason', { latitude: 12, longitude: 34, x: 10, y: 20, name: 'stale' });
  assert.deepEqual(free.point, { latitude: 12, longitude: 34 });
  assert.equal(free.place, null);
});
