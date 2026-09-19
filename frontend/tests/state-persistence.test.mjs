import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFreePoint, selectPlace } from '../.phase1-test-build/comparison/geographicSelection.js';
import {
  PHASE5_STATE_SCHEMA_VERSION,
  decodePhase5State,
  encodePhase5State,
  restorePhase5State,
} from '../.phase1-test-build/comparison/statePersistence.js';

const emptyPacks={regions:{}};
const offlineEntry={
  id:'city:test-doha',category:'city',name:'TEST Doha',nameAr:'الدوحة التجريبية',aliases:['Doha'],
  countryCode:'QA',latitude:25.285447,longitude:51.53104,sourceId:'test-source',
  sourceRecordId:'1159151577',coordinateClassification:'SOURCE_COORDINATE',
  source:{sourceId:'test-source',name:'TEST_ONLY_SYNTHETIC_POINT',version:'test-v1',license:'TEST ONLY',sourceUrl:'https://example.invalid/test'},
};
const packs={core:{schemaVersion:1,provenanceRevision:2,id:'core',version:'1',generatedAt:'2026-09-19T00:00:00Z',sourceIds:['test-source'],entries:[offlineEntry]},regions:{}};

function place(){
  return selectPlace({
    id:offlineEntry.id,category:'city',name:'TEST Doha',nameAr:'الدوحة التجريبية',countryCode:'QA',
    latitude:offlineEntry.latitude,longitude:offlineEntry.longitude,sourceId:'test-source',
    sourceRecordId:'1159151577',sourceVersion:'test-v1',sourceUrl:'https://example.invalid/test',
    sourceLicense:'TEST ONLY',coordinateClassification:'SOURCE_COORDINATE',
    sourceLabel:'TEST_ONLY_SYNTHETIC_POINT test-v1',provenanceStatus:'complete',offline:false,
  });
}

test('P5.8 state contract is explicitly versioned and round-trips a valid free point',()=>{
  const selection=selectFreePoint('ae',{latitude:25,longitude:51,ellipsoidalHeightM:125});
  const encoded=encodePhase5State(selection);
  assert.equal(encoded.schemaVersion,PHASE5_STATE_SCHEMA_VERSION);
  const decoded=decodePhase5State(encoded);
  assert.equal(decoded.kind,'decoded');
  assert.deepEqual(decoded.state.selection,selection);
});

test('P5.8 rejects unsupported versions and malformed coordinates without coercion',()=>{
  assert.deepEqual(decodePhase5State({schemaVersion:0,selection:null}),{kind:'unsupported-version',version:0});
  assert.equal(decodePhase5State({schemaVersion:1,selection:{schemaVersion:1,referenceFrame:'WGS84',angularUnits:'degrees',kind:'free-point',origin:'map',model:'wgs84',point:{latitude:95,longitude:0},place:null}}).kind,'invalid');
  assert.equal(decodePhase5State({schemaVersion:1,selection:{schemaVersion:1,referenceFrame:'WGS84',angularUnits:'degrees',kind:'free-point',origin:'map',model:'wgs84',point:{latitude:0,longitude:0,ellipsoidalHeightM:null},place:null}}).kind,'invalid');
});

test('P5.8 restores a free point exactly and never invents ellipsoidal height',()=>{
  const selection=selectFreePoint('gleason',{latitude:-10,longitude:-180});
  const restored=restorePhase5State(encodePhase5State(selection),emptyPacks);
  assert.equal(restored.status,'restored-free-point');
  assert.deepEqual(restored.selection,selection);
  assert.equal('ellipsoidalHeightM' in restored.selection.point,false);
});

test('P5.8 restores place identity only from a matching installed offline record',()=>{
  const restored=restorePhase5State(encodePhase5State(place()),packs);
  assert.equal(restored.status,'restored-place');
  assert.equal(restored.selection.kind,'place');
  assert.equal(restored.selection.place.id,offlineEntry.id);
  assert.equal(restored.selection.place.sourceId,'test-source');
  assert.equal(restored.selection.place.sourceRecordId,'1159151577');
  assert.equal(restored.selection.place.offline,true);
  assert.equal(restored.selection.place.sourceVersion,'test-v1');
});

test('P5.8 degrades an unverifiable saved place to coordinate-only state explicitly',()=>{
  const restored=restorePhase5State(encodePhase5State(place()),emptyPacks);
  assert.equal(restored.status,'restored-point-only');
  assert.equal(restored.selection.kind,'free-point');
  assert.equal(restored.selection.place,null);
  assert.deepEqual(restored.selection.point,{latitude:offlineEntry.latitude,longitude:offlineEntry.longitude});
  assert.match(restored.reason,/not found unchanged/);
});

test('P5.8 refuses stale place identity when installed source record or coordinates changed',()=>{
  const staleRecord={...offlineEntry,sourceRecordId:'different-record'};
  const changedPoint={...offlineEntry,latitude:26};
  for(const entry of [staleRecord,changedPoint]){
    const state={core:{...packs.core,entries:[entry]},regions:{}};
    const restored=restorePhase5State(encodePhase5State(place()),state);
    assert.equal(restored.status,'restored-point-only');
    assert.equal(restored.selection.kind,'free-point');
  }
});

test('P5.8 invalid persisted state is discarded rather than partially trusted',()=>{
  const restored=restorePhase5State({schemaVersion:1,selection:{kind:'place'}},packs);
  assert.equal(restored.status,'discarded-invalid');
  assert.equal(restored.selection,null);
});
