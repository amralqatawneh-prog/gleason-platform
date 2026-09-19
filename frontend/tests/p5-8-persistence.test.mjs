import test from 'node:test';
import assert from 'node:assert/strict';
import { offlineResult } from '../.phase1-test-build/search/placeSelection.js';
import { selectFreePoint, selectPlace } from '../.phase1-test-build/comparison/geographicSelection.js';
import {
  PHASE5_PERSISTENCE_CONTRACT,
  PHASE5_PERSISTENCE_SCHEMA_VERSION,
  decodePhase5State,
  encodePhase5State,
  restoreDecodedPhase5State,
} from '../.phase1-test-build/comparison/persistedSelection.js';
import { INITIAL_SELECTION_STATE, selectionReducer } from '../.phase1-test-build/comparison/selectionState.js';

function localPlace(overrides={}) {
  return offlineResult({
    id:'city:test-doha',
    name:'TEST Doha',
    nameAr:'الدوحة التجريبية',
    category:'city',
    aliases:['Doha'],
    latitude:25.285447,
    longitude:51.53104,
    sourceId:'natural-earth-cities-110m',
    sourceRecordId:'city:1159151577',
    coordinateClassification:'SOURCE_COORDINATE',
    source:{
      sourceId:'natural-earth-cities-110m',
      name:'Natural Earth populated places',
      version:'5.1.2',
      license:'Public domain',
      sourceUrl:'https://www.naturalearthdata.com/',
    },
    ...overrides,
  });
}

test('P5.8 free-point round trip preserves unknown height instead of fabricating zero',()=>{
  const selection=selectFreePoint('wgs84',{latitude:10,longitude:20});
  const encoded=encodePhase5State(selection,'2026-09-19T20:00:00.000Z');
  assert.equal(encoded.contract,PHASE5_PERSISTENCE_CONTRACT);
  assert.equal(encoded.schemaVersion,PHASE5_PERSISTENCE_SCHEMA_VERSION);
  assert.deepEqual(encoded.selection,{kind:'free-point',model:'wgs84',point:{latitude:10,longitude:20}});
  const decoded=decodePhase5State(encoded);
  const restored=restoreDecodedPhase5State(decoded,()=>null);
  assert.equal(restored.status,'restored');
  assert.deepEqual(restored.selection.point,{latitude:10,longitude:20});
  assert.equal('ellipsoidalHeightM' in restored.selection.point,false);
});

test('P5.8 explicit ellipsoidal height survives free-point persistence exactly',()=>{
  const selection=selectFreePoint('wgs84',{latitude:-90,longitude:180,ellipsoidalHeightM:123.5});
  const restored=restoreDecodedPhase5State(decodePhase5State(encodePhase5State(selection,'2026-09-19T20:00:00Z')),()=>null);
  assert.equal(restored.status,'restored');
  assert.deepEqual(restored.selection.point,{latitude:-90,longitude:180,ellipsoidalHeightM:123.5});
});

test('P5.8 place persistence stores only a locator and rebuilds identity from a local installed record',()=>{
  const place=localPlace();
  const selection=selectPlace({...place,offline:false,sourceLabel:'STALE ONLINE LABEL'});
  const encoded=encodePhase5State(selection,'2026-09-19T20:00:00Z');
  assert.deepEqual(encoded.selection,{
    kind:'place',
    locator:{
      id:'city:test-doha',
      sourceId:'natural-earth-cities-110m',
      sourceRecordId:'city:1159151577',
      sourceVersion:'5.1.2',
    },
  });
  assert.equal(JSON.stringify(encoded).includes('STALE ONLINE LABEL'),false);
  assert.equal(JSON.stringify(encoded).includes('الدوحة التجريبية'),false);

  const local=localPlace();
  const restored=restoreDecodedPhase5State(decodePhase5State(encoded),()=>local);
  assert.equal(restored.status,'restored');
  assert.equal(restored.selection.kind,'place');
  assert.equal(restored.selection.place.offline,true);
  assert.equal(restored.selection.place.sourceLabel,'Natural Earth populated places 5.1.2');
  assert.equal(restored.selection.point.latitude,25.285447);
});

test('P5.8 refuses a place restore when the installed local identity does not match',()=>{
  const encoded=encodePhase5State(selectPlace(localPlace()),'2026-09-19T20:00:00Z');
  const wrong=localPlace({sourceRecordId:'different-record'});
  const restored=restoreDecodedPhase5State(decodePhase5State(encoded),()=>wrong);
  assert.equal(restored.status,'missing-local-place');
  assert.equal(restored.selection,null);
});

test('P5.8 handles unsupported and malformed state without throwing or inventing selection',()=>{
  const unsupported={
    contract:PHASE5_PERSISTENCE_CONTRACT,
    schemaVersion:2,
    savedAt:'2026-09-19T20:00:00Z',
    selection:null,
  };
  assert.deepEqual(decodePhase5State(unsupported),{status:'unsupported-version',schemaVersion:2});
  assert.equal(restoreDecodedPhase5State(decodePhase5State(unsupported),()=>localPlace()).selection,null);

  const malformed={
    contract:PHASE5_PERSISTENCE_CONTRACT,
    schemaVersion:1,
    savedAt:'2026-09-19T20:00:00Z',
    selection:{kind:'free-point',model:'wgs84',point:{latitude:91,longitude:0}},
  };
  assert.equal(decodePhase5State(malformed).status,'invalid');
  assert.equal(restoreDecodedPhase5State(decodePhase5State(malformed),()=>localPlace()).selection,null);
});

test('P5.8 rejects extra future-service state instead of restoring unavailable operations',()=>{
  const value={
    contract:PHASE5_PERSISTENCE_CONTRACT,
    schemaVersion:1,
    savedAt:'2026-09-19T20:00:00Z',
    selection:null,
    route:{active:true},
  };
  assert.equal(decodePhase5State(value).status,'invalid');
});

test('P5.8 restore does not increment the user-action revision',()=>{
  const restoredSelection=selectFreePoint('ae',{latitude:25,longitude:51});
  const restored=selectionReducer(INITIAL_SELECTION_STATE,{type:'restore',selection:restoredSelection});
  assert.equal(restored.revision,0);
  assert.equal(restored.selection.model,'ae');
  const user=selectionReducer(restored,{type:'point',model:'gleason',point:{latitude:30,longitude:35}});
  assert.equal(user.revision,1);
});
