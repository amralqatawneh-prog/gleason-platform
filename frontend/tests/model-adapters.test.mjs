import test from 'node:test';
import assert from 'node:assert/strict';
import { gleasonAdapter as gleason } from '../.phase1-test-build/comparison/adapters/gleasonAdapter.js';
import { aeAdapter as ae, AE_MAX_RADIUS_M } from '../.phase1-test-build/comparison/adapters/aeAdapter.js';
import { wgs84Adapter as wgs84 } from '../.phase1-test-build/comparison/adapters/wgs84Adapter.js';
const close = (a,b,tolerance=1e-7) => assert.ok(Math.abs(a-b)<=tolerance, `${a} != ${b}`);
const reject = (fn,code) => assert.throws(fn,e=>e.name==='AdapterInputError' && e.code===code);

test('adapters keep model identity, units and evidence independent',()=>{
  const g=gleason.forward({latitude:0,longitude:90});
  const a=ae.forward({latitude:0,longitude:90});
  close(g.value.x,.5,1e-14);close(g.value.y,0,1e-14);
  // Existing PROJ-backed reference anchor; never scale historical output to match it.
  close(a.value.x,10001965.729528552,1e-6);
  assert.equal(g.value.units,'normalized-radius');assert.equal(a.value.units,'metre');
  assert.equal(g.metadata.evidenceLevel,'DERIVED');assert.equal(g.metadata.semanticType,'COMPUTED_RESULT');
  assert.equal(a.metadata.semanticType,'REFERENCE_RESULT');
  assert.equal(wgs84.metadata.semanticType,'REFERENCE_RESULT');
  assert.notEqual(g.metadata.modelId,a.metadata.modelId);
  assert.ok(g.metadata.evidence.some(e=>e.sourceId==='gleason-1893-upload-v1'));
  assert.ok(!a.metadata.evidence.some(e=>e.sourceId==='gleason-1893-upload-v1'));
});

test('independent forward/inverse round trips across latitude bands and antimeridian',()=>{
  for(const latitude of [-89.999,-70,-25,0,25,70,89.999])for(const longitude of [-180,-179.999,-90,0,90,179.999,180]){
    for(const adapter of [gleason,ae,wgs84]){
      const input={latitude,longitude,ellipsoidalHeightM:1234};
      const output=adapter.inverse(adapter.forward(input).value).value;
      close(output.latitude,latitude);
      close(Math.abs(output.longitude-longitude)%360,0);
      if(adapter===wgs84)close(output.ellipsoidalHeightM,1234,1e-4);
      else assert.equal('ellipsoidalHeightM' in output,false);
    }
  }
});

test('reject nonfinite/out-of-domain geographic values without wrapping longitude',()=>{
  for(const adapter of [gleason,ae,wgs84])for(const bad of [
    {latitude:91,longitude:0},{latitude:-91,longitude:0},{latitude:0,longitude:181},
    {latitude:0,longitude:-181},{latitude:NaN,longitude:0},{latitude:0,longitude:Infinity},
    {latitude:'0',longitude:0},{latitude:0,longitude:0,ellipsoidalHeightM:null},
  ])reject(()=>adapter.forward({...bad, ...(!('ellipsoidalHeightM' in bad)?{ellipsoidalHeightM:0}:{})}),'invalid-coordinate');
});

test('coordinate model/version/kind tags prevent cross-model interpretation including shared metre units',()=>{
  const point={latitude:12,longitude:34,ellipsoidalHeightM:0};
  for(const adapter of [gleason,ae,wgs84]){
    const p=adapter.forward(point).value;
    for(const patch of [{modelId:'other'},{modelVersion:'other'},{units:'pixels'},{kind:'screen'}]){
      reject(()=>adapter.inverse({...p,...patch}),'wrong-contract');
    }
    reject(()=>adapter.inverse({...p,x:NaN}),'invalid-coordinate');
    for(const other of [gleason,ae,wgs84].filter(a=>a!==adapter))reject(()=>other.inverse(p),'wrong-contract');
  }
});

test('inverse projected domains reject outside circumference and ECEF geocentre',()=>{
  const p={latitude:0,longitude:0,ellipsoidalHeightM:0};
  reject(()=>gleason.inverse({...gleason.forward(p).value,x:1.01,y:0}),'outside-domain');
  reject(()=>ae.inverse({...ae.forward(p).value,x:AE_MAX_RADIUS_M+1,y:0}),'outside-domain');
  reject(()=>wgs84.inverse({...wgs84.forward(p).value,x:0,y:0,z:0}),'outside-domain');
  reject(()=>wgs84.forward({...p,ellipsoidalHeightM:-6378137}),'outside-domain');
});

test('height policy preserves unknowns and separates 2D projection from explicit ECEF height',()=>{
  const point={latitude:0,longitude:0};
  reject(()=>wgs84.forward(point),'height-required');
  for(const h of [-430,0,1000]){
    const output=wgs84.forward({...point,ellipsoidalHeightM:h});
    close(output.value.x,6378137+h,1e-6);close(output.value.y,0);close(output.value.z,0);
    for(const adapter of [gleason,ae]){
      assert.deepEqual(adapter.forward(point).value,adapter.forward({...point,ellipsoidalHeightM:h}).value);
      assert.ok(adapter.forward({...point,ellipsoidalHeightM:h}).notes.length>0);
    }
  }
});

test('pole longitude conventions are visible, and south boundary remains representable',()=>{
  for(const adapter of [gleason,ae,wgs84]){
    const north=adapter.inverse(adapter.forward({latitude:90,longitude:45,ellipsoidalHeightM:0}).value);
    close(north.value.latitude,90);assert.equal(north.value.longitude,0);assert.ok(north.notes.length);
    for(let longitude=-180;longitude<=180;longitude++){
      const south=adapter.inverse(adapter.forward({latitude:-90,longitude,ellipsoidalHeightM:0}).value);
      close(south.value.latitude,-90);
    }
  }
});

test('adapter results do not mutate shared selection or expose mutable provenance',()=>{
  const point=Object.freeze({latitude:25,longitude:51,ellipsoidalHeightM:0});
  for(const adapter of [gleason,ae,wgs84]){
    const output=adapter.forward(point);assert.notEqual(output.value,point);
    assert.throws(()=>{output.value.x=123},TypeError);
    assert.throws(()=>{output.metadata.evidence[0].note='changed'},TypeError);
    assert.throws(()=>{output.metadata.limitations.push('changed')},TypeError);
  }
  assert.deepEqual(point,{latitude:25,longitude:51,ellipsoidalHeightM:0});
});
