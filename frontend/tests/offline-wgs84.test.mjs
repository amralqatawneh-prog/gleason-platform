import test from 'node:test';
import assert from 'node:assert/strict';
import {localGeodesicInverse,localGeodeticToEcef,localEcefToGeodetic} from '../.phase1-test-build/reference/offlineWgs84.js';

test('offline WGS84 handles identical points and the antimeridian without fake bearings',()=>{
  const a={latitude:0,longitude:180},b={latitude:0,longitude:-180};
  const result=localGeodesicInverse(a,b);
  assert.deepEqual(result.output,{distance_m:0,initial_bearing_deg:null,final_bearing_deg:null,reverse_bearing_deg:null});
  assert.equal(result.semantic_type,'REFERENCE_RESULT');
  assert.equal(result.provenance.implementation,'geographiclib-geodesic (browser)');
  assert.equal(result.input.start.longitude,180);
});
test('offline geodesic remains ellipsoidal for near-antipodal coordinates',()=>{
  const result=localGeodesicInverse({latitude:0,longitude:0},{latitude:.0001,longitude:179.9999});
  assert.ok(Math.abs(result.output.distance_m-20003920.40027497)<1e-5);
});
test('offline WGS84 validates domains and nonfinite inputs before computing',()=>{
  for(const point of [{latitude:91,longitude:0},{latitude:0,longitude:181},{latitude:NaN,longitude:0},{latitude:0,longitude:0,ellipsoidal_height_m:Infinity}]){
    assert.throws(()=>localGeodesicInverse(point,{latitude:0,longitude:0}),RangeError);
    assert.throws(()=>localGeodeticToEcef(point),RangeError);
  }
  assert.throws(()=>localEcefToGeodetic({x_m:NaN,y_m:0,z_m:0}),RangeError);
  assert.throws(()=>localEcefToGeodetic({x_m:0,y_m:0,z_m:0}),RangeError);
});
test('offline ECEF equator/pole anchors use metres and ellipsoidal height',()=>{
  assert.deepEqual(localGeodeticToEcef({latitude:0,longitude:0}).output,{x_m:6378137,y_m:0,z_m:0});
  const point=localGeodeticToEcef({latitude:90,longitude:0,ellipsoidal_height_m:100}).output;
  assert.ok(Math.abs(point.z_m-6356852.314245179)<1e-6);
  assert.ok(Math.abs(localEcefToGeodetic(point).output.ellipsoidal_height_m-100)<1e-6);
});
