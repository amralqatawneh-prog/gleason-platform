import test from 'node:test';
import assert from 'node:assert/strict';
import { GLEASON_UNITS, gleasonForward, gleasonInverse, historicalLongitudeDegreeMiles } from '../.phase1-test-build/models/gleason.js';
import { aeForward, aeInverse } from '../.phase1-test-build/models/ae.js';
import { applyAffine, controlPointResidual, fitAffineFromThreeControlPoints } from '../.phase1-test-build/georeferencing/affine.js';

test('Gleason source-derived radial anchors are stable', () => {
  for (const [latitude, expected] of [[90,0],[0,0.5],[-90,1]]) {
    const p = gleasonForward({ latitude, longitude: 0 });
    assert.ok(Math.abs(Math.hypot(p.x,p.y)-expected) < 1e-12);
  }
});

test('Gleason round-trip preserves coordinates', () => {
  for (const point of [{ latitude:25.2854, longitude:51.5310 },{ latitude:-33.9249, longitude:18.4241 },{ latitude:51.5074, longitude:-0.1278 }]) {
    const r = gleasonInverse(gleasonForward(point));
    assert.ok(Math.abs(r.latitude-point.latitude)<1e-10); assert.ok(Math.abs(r.longitude-point.longitude)<1e-10);
  }
});

test('Figure 43 historical anchors', () => {
  assert.equal(historicalLongitudeDegreeMiles(90),0); assert.equal(historicalLongitudeDegreeMiles(0),60); assert.equal(historicalLongitudeDegreeMiles(-90),120); assert.ok(Math.abs(historicalLongitudeDegreeMiles(85)-10/3)<1e-12);
});

test('AE round-trip', () => { const p={latitude:25.2854,longitude:51.5310}; const r=aeInverse(aeForward(p)); assert.ok(Math.abs(r.latitude-p.latitude)<1e-8); assert.ok(Math.abs(r.longitude-p.longitude)<1e-8); });

test('Affine baseline fits exact control points', () => {
  const cps=[{source:[0,0],target:[10,-5]},{source:[1,0],target:[12,-5]},{source:[0,1],target:[10,-2]}];
  const t=fitAffineFromThreeControlPoints(cps); assert.deepEqual(applyAffine(t,[2,3]),[14,4]); for (const cp of cps) assert.ok(controlPointResidual(t,cp)<1e-12);
});

test('historical inverse rejects outside circle', () => { assert.throws(() => gleasonInverse({x:1.1,y:0,units:GLEASON_UNITS})); });
