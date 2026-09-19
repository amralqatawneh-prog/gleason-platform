import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampLatitude,
  clampReferenceZoom,
  draggedYaw,
  fallbackScreenPointToGeo,
  geoPointToViewAngles,
  latLonToEllipsoid,
  normalizeLongitude,
  projectGeoToScreen,
  referenceViewMode,
  scaleReferenceZoomByPinch,
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

test('mid-latitude rendering uses geodetic WGS84 ECEF, not parametric latitude', () => {
  // EPSG:4979 → EPSG:4978 / PROJ WGS84 at 45N, 0E, height 0m.
  const [x, y, z] = latLonToEllipsoid({ latitude: 45, longitude: 0 });
  assert.ok(Math.abs(x * 6378137 - 4517590.878848932) < 1e-6);
  assert.ok(Math.abs(y * 6378137 - 4487348.408865919) < 1e-6);
  assert.equal(z, 0);
});

test('off-center selection recovers visible geographic points across rotations and aspect ratios', () => {
  let checked = 0;
  for (const [width, height] of [[400,400],[1024,380],[320,540],[357.25,291.5]]) {
    for (const [yaw,pitch] of [[0,0],[-.55,.28],[2.6,1.1],[-2.2,-1.2]]) {
      for (const latitude of [-85,-60,-25,0,25,60,85]) {
        for (let longitude = -180; longitude < 180; longitude += 20) {
          const screen = projectGeoToScreen({latitude,longitude},width,height,yaw,pitch);
          if (!screen.visible || screen.depth < .01) continue;
          const actual = screenPointToGeo(screen.x,screen.y,width,height,yaw,pitch);
          assert.ok(actual);
          assert.ok(Math.abs(actual.latitude-latitude)<1e-8);
          assert.ok(Math.abs(normalizeLongitude(actual.longitude-longitude))<1e-8);
          checked++;
        }
      }
    }
  }
  assert.ok(checked > 900);
  const screen = projectGeoToScreen({latitude:0,longitude:120},400,400,0,0);
  assert.ok(Math.abs(screen.x-278)<1e-10);
  assert.ok(Math.abs(screenPointToGeo(278,200,400,400,0,0).longitude-120)<1e-10);
});

test('picking rejects the old invisible outer ring and invalid viewports', () => {
  assert.equal(screenPointToGeo(365,200,400,400,0,0),null);
  assert.equal(screenPointToGeo(200,44,400,400,0,0),null); // polar radius < equatorial radius
  assert.equal(screenPointToGeo(200,200,0,400,0,0),null);
  assert.equal(screenPointToGeo(NaN,200,400,400,0,0),null);
});

test('geographic marker moves with rotation and is hidden on the back', () => {
  const point={latitude:35,longitude:120}, view=geoPointToViewAngles(point);
  const center=projectGeoToScreen(point,400,400,view.yaw,view.pitch);
  const moved=projectGeoToScreen(point,400,400,view.yaw+.6,view.pitch);
  const back=projectGeoToScreen(point,400,400,view.yaw+Math.PI,0);
  assert.ok(Math.abs(center.x-200)<1e-9 && Math.abs(center.y-200)<1e-9);
  assert.ok(Math.abs(moved.x-center.x)>30);
  assert.equal(back.visible,false);
});

test('fallback respects SVG letterboxing and rejects clicks in margins', () => {
  assert.deepEqual(fallbackScreenPointToGeo(400,200,800,400),{latitude:0,longitude:0});
  assert.deepEqual(fallbackScreenPointToGeo(200,300,400,600),{latitude:0,longitude:0});
  assert.equal(fallbackScreenPointToGeo(200,50,400,600),null);
  assert.equal(fallbackScreenPointToGeo(10,100,800,200),null);
  assert.deepEqual(fallbackScreenPointToGeo(580,10,800,200),{latitude:81,longitude:162});
});


test('zoom-aware projection and inverse picking stay reciprocal',()=>{
  const point={latitude:32.5,longitude:44.25},view=geoPointToViewAngles(point);
  for(const zoom of [.7,1,1.8,3.5,5]){
    const screen=projectGeoToScreen(point,640,420,view.yaw+.35,view.pitch-.2,zoom);
    assert.ok(screen&&screen.visible);
    const actual=screenPointToGeo(screen.x,screen.y,640,420,view.yaw+.35,view.pitch-.2,zoom);
    assert.ok(actual);
    assert.ok(Math.abs(actual.latitude-point.latitude)<1e-8);
    assert.ok(Math.abs(normalizeLongitude(actual.longitude-point.longitude))<1e-8);
  }
});

test('reference zoom is bounded and invalid values fall back safely',()=>{
  assert.equal(clampReferenceZoom(.1),.7);
  assert.equal(clampReferenceZoom(9),5);
  assert.equal(clampReferenceZoom(2.25),2.25);
  assert.equal(clampReferenceZoom(Number.NaN),1);
  assert.equal(screenPointToGeo(200,200,400,400,0,0,0),null);
  assert.equal(projectGeoToScreen({latitude:0,longitude:0},400,400,0,0,0),null);
});


test('pinch zoom uses bounded distance ratios',()=>{
  assert.equal(scaleReferenceZoomByPinch(1,100,150),1.5);
  assert.equal(scaleReferenceZoomByPinch(4,100,200),5);
  assert.equal(scaleReferenceZoomByPinch(1,100,20),.7);
  assert.equal(scaleReferenceZoomByPinch(2,0,120),2);
});

test('zoom-aware picking remains correct near poles and antimeridian',()=>{
  for(const point of [
    {latitude:89.5,longitude:179.9},
    {latitude:89.5,longitude:-179.9},
    {latitude:-89.5,longitude:179.9},
    {latitude:-89.5,longitude:-179.9},
  ]){
    const view=geoPointToViewAngles(point);
    for(const zoom of [.7,1,2.5,5]){
      const screen=projectGeoToScreen(point,720,420,view.yaw,view.pitch,zoom);
      assert.ok(screen&&screen.visible);
      const actual=screenPointToGeo(screen.x,screen.y,720,420,view.yaw,view.pitch,zoom);
      assert.ok(actual);
      assert.ok(Math.abs(actual.latitude-point.latitude)<1e-7);
      assert.ok(Math.abs(normalizeLongitude(actual.longitude-point.longitude))<1e-7);
    }
  }
});
