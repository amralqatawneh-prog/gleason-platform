import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampLatitude,
  draggedYaw,
  geoPointToViewAngles,
  latLonToEllipsoid,
  normalizeLongitude,
  projectGeoToScreen,
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

test('screen right is east of screen center on the external globe', () => {
  const center = screenPointToGeo(200, 200, 400, 400, 0, 0);
  const right = screenPointToGeo(220, 200, 400, 400, 0, 0);
  assert.ok(center && right);
  assert.ok(right.longitude > center.longitude);
});

test('projected labels use the same external-globe east/right convention', () => {
  const center = projectGeoToScreen({ latitude: 0, longitude: 90 }, 400, 400, 0, 0);
  const east = projectGeoToScreen({ latitude: 0, longitude: 100 }, 400, 400, 0, 0);
  const back = projectGeoToScreen({ latitude: 0, longitude: -90 }, 400, 400, 0, 0);
  assert.ok(center && east && back);
  assert.equal(center.visible, true);
  assert.ok(east.x > center.x);
  assert.equal(back.visible, false);
});

test('canonical Phase 3 coordinate can be focused at WGS84 view center', () => {
  const canonical = { latitude: 25.2854, longitude: 51.5310 };
  const view = geoPointToViewAngles(canonical);
  const point = screenPointToGeo(200, 200, 400, 400, view.yaw, view.pitch);
  assert.ok(point);
  assert.ok(Math.abs(point.latitude - canonical.latitude) < 1e-9);
  assert.ok(Math.abs(point.longitude - canonical.longitude) < 1e-9);
});

test('screen points outside globe return null', () => {
  assert.equal(screenPointToGeo(0, 0, 400, 400, 0, 0), null);
});


test('horizontal drag rotates the globe opposite to pointer movement', () => {
  const initialYaw = 0.5;
  assert.ok(draggedYaw(initialYaw, 20) < initialYaw);
  assert.ok(draggedYaw(initialYaw, -20) > initialYaw);
});
