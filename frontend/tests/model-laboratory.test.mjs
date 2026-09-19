import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFreePoint } from '../.phase1-test-build/comparison/geographicSelection.js';
import { inspectSelection } from '../.phase1-test-build/comparison/modelLaboratory.js';

test('model laboratory is empty until a canonical selection exists',()=>{ assert.deepEqual(inspectSelection(null),[]); });

test('same geographic input is inspected independently and missing WGS84 height stays explicit',()=>{
  const selection=selectFreePoint('ae',{latitude:25.285447,longitude:51.53104});
  const entries=inspectSelection(selection);
  const gleason=entries.find(entry=>entry.key==='gleason');
  const ae=entries.find(entry=>entry.key==='ae');
  const wgs84=entries.find(entry=>entry.key==='wgs84');
  assert.equal(entries.length,3);
  assert.equal(gleason.status,'available'); assert.equal(gleason.metadata.units,'normalized-radius');
  assert.equal(gleason.metadata.semanticType,'COMPUTED_RESULT'); assert.equal(gleason.metadata.evidenceLevel,'DERIVED');
  assert.ok(gleason.metadata.evidence.some(source=>source.sourceId==='gleason-1893-upload-v1'));
  assert.equal(ae.status,'available'); assert.equal(ae.metadata.units,'metre'); assert.equal(ae.metadata.semanticType,'REFERENCE_RESULT');
  assert.equal(wgs84.status,'unavailable'); assert.equal(wgs84.errorCode,'height-required'); assert.equal(wgs84.output,null);
  assert.match(wgs84.reason,/explicit WGS84 ellipsoidal height/i); assert.equal('ellipsoidalHeightM' in selection.point,false);
});

test('explicit ellipsoidal height enables ECEF without changing the other model contracts',()=>{
  const entries=inspectSelection(selectFreePoint('wgs84',{latitude:0,longitude:0,ellipsoidalHeightM:125}));
  const gleason=entries.find(entry=>entry.key==='gleason'), ae=entries.find(entry=>entry.key==='ae'), wgs84=entries.find(entry=>entry.key==='wgs84');
  assert.equal(wgs84.status,'available'); assert.equal(wgs84.output.kind,'ecef');
  assert.deepEqual(wgs84.output.values.map(value=>value.label),['X','Y','Z']);
  assert.ok(Math.abs(wgs84.output.values[0].value-6378262)<1e-6);
  assert.equal(gleason.metadata.units,'normalized-radius'); assert.equal(ae.metadata.units,'metre');
  assert.ok(gleason.notes.some(note=>/height is not represented/i.test(note))); assert.ok(ae.notes.some(note=>/height is not represented/i.test(note)));
});

test('laboratory output carries model/version/source metadata without cross-model normalization',()=>{
  const entries=inspectSelection(selectFreePoint('gleason',{latitude:0,longitude:90,ellipsoidalHeightM:0}));
  assert.deepEqual(entries.map(entry=>entry.metadata.modelVersion),['GH-0.2.0','AE-0.2.0','WGS84-0.4.0']);
  const g=entries[0].output.values.find(value=>value.label==='X').value;
  const a=entries[1].output.values.find(value=>value.label==='X').value;
  assert.ok(Math.abs(g-.5)<1e-14); assert.ok(a>10_000_000); assert.notEqual(g,a);
  assert.ok(entries[2].metadata.evidence.some(source=>source.sourceId==='PROJ/proj4js'));
});
