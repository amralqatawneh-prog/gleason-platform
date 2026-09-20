import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRouteGuideSegments,
  buildStraightProjectedRouteSegments,
  ROUTE_GUIDE_STEPS_PER_SEGMENT,
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
