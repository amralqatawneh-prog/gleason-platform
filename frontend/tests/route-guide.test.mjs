import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRouteGuideSegments,
  buildStraightProjectedRouteSegments,
  buildGreatCircleRouteSegments,
  ROUTE_GUIDE_STEPS_PER_SEGMENT,
  GREAT_CIRCLE_STEPS_PER_SEGMENT,
} from '../.phase1-test-build/measurement/routeGuide.js';

const point=(latitude,longitude)=>({latitude,longitude});

test('P6.3 visual route guide preserves ordered segment count and endpoints',()=>{
  const guide=buildRouteGuideSegments([
    point(25,51),
    point(31,35),
    point(40,-74),
  ]);
  assert.equal(guide.length,2);
  assert.equal(guide[0].segmentId,'route-guide:0->1');
  assert.equal(guide[1].segmentId,'route-guide:1->2');
  assert.equal(guide[0].samples.length,ROUTE_GUIDE_STEPS_PER_SEGMENT+1);
  assert.deepEqual(guide[0].samples[0],point(25,51));
  assert.deepEqual(guide[0].samples.at(-1),point(31,35));
  assert.deepEqual(guide[1].samples[0],point(31,35));
  assert.deepEqual(guide[1].samples.at(-1),point(40,-74));
});

test('P6.3 visual route guide crosses the antimeridian by the short longitude direction',()=>{
  const [segment]=buildRouteGuideSegments([point(0,179),point(0,-179)],4);
  assert.equal(segment.samples.length,5);
  const normalized=segment.samples.map(sample=>sample.longitude);
  assert.deepEqual(normalized,[179,179.5,-180,-179.5,-179]);
});

test('P6.3 route guide is display-only geometry and does not add distance or model identity',()=>{
  const [segment]=buildRouteGuideSegments([point(10,20),point(11,21)],2);
  assert.equal('distance_m' in segment,false);
  assert.equal('method_id' in segment,false);
  assert.equal('model' in segment,false);
  assert.equal('unit' in segment,false);
});

test('P6.3 visual route guide returns no line for fewer than two points',()=>{
  assert.deepEqual(buildRouteGuideSegments([]),[]);
  assert.deepEqual(buildRouteGuideSegments([point(0,0)]),[]);
});


test('P6.3 flat-model route guide uses exactly two projected endpoints per segment',()=>{
  const project=p=>[p.longitude*10,p.latitude*20];
  const segments=buildStraightProjectedRouteSegments([
    point(10,20),
    point(30,40),
    point(-5,80),
  ],project);
  assert.equal(segments.length,2);
  assert.deepEqual(segments[0].coordinates,[[200,200],[400,600]]);
  assert.deepEqual(segments[1].coordinates,[[400,600],[800,-100]]);
  assert.equal(segments[0].coordinates.length,2);
  assert.equal(segments[1].coordinates.length,2);
});

test('P6.3 straight projected route guide inserts no intermediate curve samples',()=>{
  const segments=buildStraightProjectedRouteSegments([
    point(0,179),
    point(0,-179),
  ],p=>[p.longitude,p.latitude]);
  assert.equal(segments.length,1);
  assert.deepEqual(segments[0].coordinates,[[179,0],[-179,0]]);
});


test('P6.3 WGS84 globe guide follows a spherical great-circle reference',()=>{
  const [segment]=buildGreatCircleRouteSegments([
    point(40,-75),
    point(40,75),
  ],8);
  assert.equal(segment.samples.length,9);
  assert.deepEqual(segment.samples[0],point(40,-75));
  assert.deepEqual(segment.samples.at(-1),point(40,75));
  assert.ok(segment.samples[4].latitude>40,'great-circle midpoint should bow poleward for equal northern latitudes');
  assert.equal(segment.segmentId,'great-circle-guide:0->1');
});

test('P6.3 great-circle equatorial and antimeridian routes remain finite and continuous',()=>{
  const [equator]=buildGreatCircleRouteSegments([point(0,0),point(0,90)],4);
  assert.equal(equator.samples.length,5);
  for(const sample of equator.samples){
    assert.ok(Math.abs(sample.latitude)<1e-10);
    assert.ok(Number.isFinite(sample.longitude));
  }
  assert.ok(Math.abs(equator.samples[2].longitude-45)<1e-9);

  const [anti]=buildGreatCircleRouteSegments([point(0,179),point(0,-179)],4);
  assert.equal(anti.samples.length,5);
  for(const sample of anti.samples){
    assert.ok(Math.abs(sample.latitude)<1e-10);
    assert.ok(Number.isFinite(sample.longitude));
  }
});

test('P6.3 great-circle guide handles repeated and antipodal points without NaN',()=>{
  const repeated=buildGreatCircleRouteSegments([point(25,51),point(25,51)],3)[0];
  assert.equal(repeated.samples.length,4);
  for(const sample of repeated.samples){
    assert.ok(Number.isFinite(sample.latitude));
    assert.ok(Number.isFinite(sample.longitude));
  }

  const antipodal=buildGreatCircleRouteSegments([point(0,0),point(0,180)],GREAT_CIRCLE_STEPS_PER_SEGMENT)[0];
  assert.equal(antipodal.samples.length,GREAT_CIRCLE_STEPS_PER_SEGMENT+1);
  for(const sample of antipodal.samples){
    assert.ok(Number.isFinite(sample.latitude));
    assert.ok(Number.isFinite(sample.longitude));
  }
});

test('P6.3 great-circle guide stays display-only and contains no flight or distance result',()=>{
  const [segment]=buildGreatCircleRouteSegments([point(10,20),point(30,80)],4);
  assert.equal('distance_m' in segment,false);
  assert.equal('method_id' in segment,false);
  assert.equal('flight_track' in segment,false);
  assert.equal('unit' in segment,false);
});
