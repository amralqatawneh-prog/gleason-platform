import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFreePoint } from '../.phase1-test-build/comparison/geographicSelection.js';
import { inspectSelection } from '../.phase1-test-build/comparison/modelLaboratory.js';
import { describeLaboratoryEntry, evaluateComparability, laboratoryComparability } from '../.phase1-test-build/comparison/comparability.js';
import { computeHomogeneousDifference, laboratoryDifferences } from '../.phase1-test-build/comparison/homogeneousDifference.js';
import {
  FUTURE_SERVICE_CONTRACT_VERSION,
  FUTURE_SERVICE_CONTRACTS,
  futureServiceContract,
  requireFutureServiceAvailable,
  FutureServiceUnavailableError,
} from '../.phase1-test-build/comparison/futureServices.js';

test('homogeneous difference computes signed right-minus-left components only after comparability passes',()=>{
  const left=inspectSelection(selectFreePoint('ae',{latitude:25,longitude:50})).find(entry=>entry.key==='ae');
  const right=inspectSelection(selectFreePoint('ae',{latitude:26,longitude:51})).find(entry=>entry.key==='ae');
  const decision=evaluateComparability(describeLaboratoryEntry(left),describeLaboratoryEntry(right));
  assert.equal(decision.status,'comparable');
  const difference=computeHomogeneousDifference(decision,left,right);
  assert.equal(difference.status,'available');
  assert.equal(difference.unit,'metre');
  assert.deepEqual(difference.values.map(value=>value.label),['X','Y']);
  for(const component of difference.values) assert.equal(component.delta,component.right-component.left);
  assert.equal(difference.conversionApplied,false);
});

test('same-model Gleason differences stay normalized-radius and never become metres',()=>{
  const left=inspectSelection(selectFreePoint('gleason',{latitude:0,longitude:0})).find(entry=>entry.key==='gleason');
  const right=inspectSelection(selectFreePoint('gleason',{latitude:10,longitude:20})).find(entry=>entry.key==='gleason');
  const decision=evaluateComparability(describeLaboratoryEntry(left),describeLaboratoryEntry(right));
  const difference=computeHomogeneousDifference(decision,left,right);
  assert.equal(difference.status,'available');
  assert.equal(difference.unit,'normalized-radius');
  assert.equal(difference.conversionApplied,false);
});

test('cross-model laboratory differences are blocked and expose no numeric deltas',()=>{
  const entries=inspectSelection(selectFreePoint('wgs84',{latitude:25,longitude:51}));
  const differences=laboratoryDifferences(entries,laboratoryComparability(entries));
  assert.equal(differences.length,3);
  assert.ok(differences.every(item=>item.status==='blocked'));
  assert.ok(differences.every(item=>item.values.length===0));
  assert.ok(differences.every(item=>item.unit===null));
  assert.ok(differences.every(item=>item.conversionApplied===false));
});

test('a non-comparable decision can never leak a numeric difference',()=>{
  const entries=inspectSelection(selectFreePoint('wgs84',{latitude:25,longitude:51,ellipsoidalHeightM:100}));
  const ae=entries.find(entry=>entry.key==='ae');
  const wgs=entries.find(entry=>entry.key==='wgs84');
  const decision=evaluateComparability(describeLaboratoryEntry(ae),describeLaboratoryEntry(wgs));
  const difference=computeHomogeneousDifference(decision,ae,wgs);
  assert.equal(decision.status,'not-comparable');
  assert.equal(difference.status,'blocked');
  assert.deepEqual(difference.values,[]);
});

test('future P5.7 service contracts are versioned and explicitly unavailable',()=>{
  assert.equal(FUTURE_SERVICE_CONTRACT_VERSION,1);
  assert.deepEqual(FUTURE_SERVICE_CONTRACTS.map(item=>item.kind),['time','layer-sync','route']);
  for(const contract of FUTURE_SERVICE_CONTRACTS){
    assert.equal(contract.contractVersion,1);
    assert.equal(contract.status,'unavailable');
    assert.deepEqual(contract.availableOperations,[]);
  }
  assert.equal(futureServiceContract('route').plannedPhase,'6');
  assert.equal(futureServiceContract('time').plannedPhase,'9–10');
  assert.equal(futureServiceContract('layer-sync').plannedPhase,'16');
});

test('future service guards fail closed instead of pretending implementation',()=>{
  for(const kind of ['time','layer-sync','route']){
    assert.throws(()=>requireFutureServiceAvailable(kind),FutureServiceUnavailableError);
  }
});


test('matching P5.5 descriptors still cannot bypass a P5.7 domain mismatch',()=>{
  const base=inspectSelection(selectFreePoint('ae',{latitude:25,longitude:50})).find(entry=>entry.key==='ae');
  const altered=Object.freeze({
    ...inspectSelection(selectFreePoint('ae',{latitude:26,longitude:51})).find(entry=>entry.key==='ae'),
    metadata:Object.freeze({...base.metadata,domain:'synthetic-other-domain'}),
  });
  const decision=evaluateComparability(describeLaboratoryEntry(base),describeLaboratoryEntry(altered));
  assert.equal(decision.status,'comparable');
  const difference=computeHomogeneousDifference(decision,base,altered);
  assert.equal(difference.status,'blocked');
  assert.deepEqual(difference.values,[]);
  assert.deepEqual(difference.reasons,['different-domain']);
});


test('P6.3/P6.4/P6.5 keep the future route-provider contract unavailable while exposing measurement separately',()=>{
  const route=futureServiceContract('route');
  assert.equal(route.status,'unavailable');
  assert.deepEqual(route.availableOperations,[]);
  assert.match(route.currentBoundary,/P6\.3 implements WGS84 geodesic distance/);
  assert.match(route.currentBoundary,/P6\.4 implements AE projected-plane distance/);
  assert.match(route.currentBoundary,/P6\.5 implements Gleason normalized native distance/);
  assert.match(route.currentBoundary,/provider-backed road\/flight paths/);
  assert.match(route.currentBoundary,/perimeter and area/);
});
