import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFreePoint } from '../.phase1-test-build/comparison/geographicSelection.js';
import { inspectSelection } from '../.phase1-test-build/comparison/modelLaboratory.js';
import {
  describeLaboratoryEntry,
  evaluateComparability,
  laboratoryComparability,
  requireComparable,
  IncomparableQuantityError,
} from '../.phase1-test-build/comparison/comparability.js';

test('same model/version/meaning/unit/space is directly comparable without conversion',()=>{
  const [gleason]=inspectSelection(selectFreePoint('gleason',{latitude:10,longitude:20}));
  const descriptor=describeLaboratoryEntry(gleason);
  const decision=evaluateComparability(descriptor,descriptor);
  assert.equal(decision.status,'comparable');
  assert.deepEqual(decision.reasons,[]);
  assert.equal(decision.comparisonUnit,'normalized-radius');
  assert.equal(decision.conversionApplied,false);
  assert.equal(requireComparable(decision),decision);
});

test('Gleason and AE planar positions are rejected across spaces and units with no scale fabrication',()=>{
  const entries=inspectSelection(selectFreePoint('ae',{latitude:25,longitude:51}));
  const g=describeLaboratoryEntry(entries.find(entry=>entry.key==='gleason'));
  const ae=describeLaboratoryEntry(entries.find(entry=>entry.key==='ae'));
  const decision=evaluateComparability(g,ae);
  assert.equal(decision.status,'not-comparable');
  assert.ok(decision.reasons.includes('different-coordinate-space'));
  assert.ok(decision.reasons.includes('different-units'));
  assert.ok(decision.reasons.includes('undefined-cross-model-scale'));
  assert.equal(decision.comparisonUnit,null);
  assert.equal(decision.conversionApplied,false);
  assert.throws(()=>requireComparable(decision),IncomparableQuantityError);
});

test('AE plane metres and WGS84 ECEF metres are not comparable just because the unit matches',()=>{
  const entries=inspectSelection(selectFreePoint('wgs84',{latitude:25,longitude:51,ellipsoidalHeightM:50}));
  const ae=describeLaboratoryEntry(entries.find(entry=>entry.key==='ae'));
  const wgs=describeLaboratoryEntry(entries.find(entry=>entry.key==='wgs84'));
  const decision=evaluateComparability(ae,wgs);
  assert.equal(ae.units,'metre');
  assert.equal(wgs.units,'metre');
  assert.equal(decision.status,'not-comparable');
  assert.ok(decision.reasons.includes('different-meaning'));
  assert.ok(decision.reasons.includes('different-coordinate-space'));
  assert.ok(!decision.reasons.includes('different-units'));
  assert.equal(decision.conversionApplied,false);
});

test('missing output is explicit when otherwise identical quantities would be comparable',()=>{
  const entries=inspectSelection(selectFreePoint('wgs84',{latitude:25,longitude:51}));
  const missing=describeLaboratoryEntry(entries.find(entry=>entry.key==='wgs84'));
  const available=Object.freeze({...missing,available:true,unavailableReason:null});
  const decision=evaluateComparability(missing,available);
  assert.equal(decision.status,'unavailable');
  assert.deepEqual(decision.reasons,['missing-output']);
  assert.equal(decision.comparisonUnit,null);
  assert.throws(()=>requireComparable(decision),IncomparableQuantityError);
});

test('laboratory emits exactly three pairwise decisions and never applies normalization',()=>{
  const entries=inspectSelection(selectFreePoint('wgs84',{latitude:0,longitude:0}));
  const decisions=laboratoryComparability(entries);
  assert.equal(decisions.length,3);
  assert.deepEqual(decisions.map(d=>[d.left.key,d.right.key]),[
    ['gleason','ae'],['gleason','wgs84'],['ae','wgs84'],
  ]);
  assert.ok(decisions.every(d=>d.status==='not-comparable'));
  assert.ok(decisions.every(d=>d.conversionApplied===false));
  assert.ok(decisions.every(d=>d.comparisonUnit===null));
});
