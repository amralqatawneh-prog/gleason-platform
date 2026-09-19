import test from 'node:test';
import assert from 'node:assert/strict';
import {offlineResult,onlineResult} from '../.phase1-test-build/search/placeSelection.js';
import {validateOfflineSearchIndex} from '../.phase1-test-build/offline/searchIndex.js';

// Synthetic fixtures only; no claims about a real place or source.
const entry={id:'test-place',category:'country',name:'Test place',aliases:[],latitude:12,longitude:34,
  sourceId:'test-source',sourceRecordId:'test-record',coordinateClassification:'DERIVED_CENTROID',
  source:{sourceId:'test-source',name:'Test source',version:'test-v1',license:'TEST-ONLY',sourceUrl:'https://example.invalid/test'}};
const pack={schemaVersion:1,provenanceRevision:2,id:'test-pack',version:'test-v1',generatedAt:'2026-09-18',sourceIds:['test-source'],entries:[entry]};

test('online/offline selection preserves identical provenance and geographic identity',()=>{
  const online=onlineResult({id:entry.id,category:entry.category,name:entry.name,latitude:12,longitude:34,
    source_record_id:entry.sourceRecordId,coordinate_classification:entry.coordinateClassification,
    source:{source_id:entry.sourceId,name:entry.source.name,version:entry.source.version,license:entry.source.license,source_url:entry.source.sourceUrl},score:100});
  assert.deepEqual({...offlineResult(entry),offline:false},online);
  assert.equal(online.provenanceStatus,'complete');
  assert.ok(validateOfflineSearchIndex(pack));
});
test('old packs remain readable with explicitly unknown metadata, never category-based guesses',()=>{
  const {source,coordinateClassification,...legacy}=entry;
  assert.ok(validateOfflineSearchIndex({...pack,provenanceRevision:undefined,entries:[legacy]}));
  const selected=offlineResult(legacy);
  assert.equal(selected.sourceRecordId,entry.sourceRecordId);
  assert.equal(selected.sourceVersion,null);
  assert.equal(selected.coordinateClassification,null);
  assert.equal(selected.sourceLicense,null);
  assert.equal(selected.provenanceStatus,'legacy-or-incomplete');
});
test('reject malformed or mismatched provenance without replacing existing installed packs',()=>{
  for(const invalid of [{...entry,source:{...entry.source,sourceId:'wrong'}},{...entry,coordinateClassification:42},{...entry,source:{...entry.source,version:12}}]){
    assert.equal(validateOfflineSearchIndex({...pack,entries:[invalid]}),false);
  }
});
