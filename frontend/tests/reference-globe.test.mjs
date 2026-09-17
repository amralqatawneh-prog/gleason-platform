import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampLatitude,
  latLonToEllipsoid,
  normalizeLongitude,
  referenceViewMode,
  screenPointToGeo,
} from '../.phase1-test-build/reference/referenceMath.js';

const baseCapabilities = {
  webgl2: true,
  serviceWorker: true,
  indexedDb: true,
  touch: false,
  online: true,
};

test('reference view uses WebGL3D only when WebGL2 is available', () => {
  assert.equal(referenceViewMode(baseCapabilities), 'webgl3d');
  assert.equal(referenceViewMode({ ...baseCapabilities, webgl2: false }), 'fallback2d');
});

test('reference helpers keep canonical coordinate domains', () => {
  assert.equal(clampLatitude(91), 90);
  assert.equal(clampLatitude(-91), -90);
  assert.equal(normalizeLongitude(181), -179);
  assert.equal(normalizeLongitude(-181), 179);
});

test('WGS84 ellipsoid helper preserves equatorial and polar radius ratio', () => {
  const equator = latLonToEllipsoid({ latitude: 0, longitude: 0 });
  assert.ok(Math.abs(equator[0] - 1) < 1e-12);
  assert.ok(Math.abs(equator[1]) < 1e-12);
  const pole = latLonToEllipsoid({ latitude: 90, longitude: 0 });
  assert.ok(Math.abs(pole[1] - 6356752.314245179 / 6378137) < 1e-12);
});

test('screen center resolves to the front-facing geographic point', () => {
  const point = screenPointToGeo(200, 200, 400, 400, 0, 0);
  assert.ok(point);
  assert.ok(Math.abs(point.latitude) < 1e-12);
  assert.ok(Math.abs(point.longitude - 90) < 1e-12);
});

test('screen points outside globe return null', () => {
  assert.equal(screenPointToGeo(0, 0, 400, 400, 0, 0), null);
});
