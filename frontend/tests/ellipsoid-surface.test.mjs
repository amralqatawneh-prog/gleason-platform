import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEllipsoidSurface } from '../.phase1-test-build/reference/ellipsoidSurface.js';
import { WGS84_POLAR_RATIO } from '../.phase1-test-build/reference/referenceMath.js';

test('opaque shell tessellation spans all longitude/latitude cells on the WGS84 ellipsoid',()=>{
  const vertices=buildEllipsoidSurface();
  assert.equal(vertices.length,60*120*6*3);
  let minY=1,maxY=-1,minX=1,maxX=-1;
  for(let i=0;i<vertices.length;i+=3){
    const [x,y,z]=vertices.slice(i,i+3);
    assert.ok([x,y,z].every(Number.isFinite));
    assert.ok(Math.abs(x*x+(y/WGS84_POLAR_RATIO)**2+z*z-1)<2e-7);
    minY=Math.min(minY,y);maxY=Math.max(maxY,y);minX=Math.min(minX,x);maxX=Math.max(maxX,x);
  }
  assert.ok(Math.abs(maxY-WGS84_POLAR_RATIO)<1e-7);
  assert.ok(Math.abs(minY+WGS84_POLAR_RATIO)<1e-7);
  assert.equal(minX,-1);assert.equal(maxX,1);
});
