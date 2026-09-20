import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SELECTION_STATE, selectionReducer } from '../.phase1-test-build/comparison/selectionState.js';
import { selectFreePoint } from '../.phase1-test-build/comparison/geographicSelection.js';
import { offlineResult } from '../.phase1-test-build/search/placeSelection.js';

test('each user action advances one canonical selection revision without stale place metadata',()=>{
  // Synthetic fixture only.
  const place=offlineResult({id:'test',name:'Test',nameAr:'اختبار',category:'city',aliases:[],latitude:12,longitude:34,sourceId:'test',sourceRecordId:'test'});
  let state=selectionReducer(INITIAL_SELECTION_STATE,{type:'place',place});
  assert.equal(state.revision,1);assert.equal(state.selection.place.id,'test');
  for(const model of ['gleason','ae','wgs84']){
    const previous=state;
    state=selectionReducer(state,{type:'point',model,point:{latitude:-90,longitude:180}});
    assert.equal(state.revision,previous.revision+1);assert.equal(state.selection.place,null);
    assert.equal(state.selection.model,model);assert.deepEqual(state.selection.point,{latitude:-90,longitude:180});
    assert.notEqual(state,previous);
  }
  assert.equal(INITIAL_SELECTION_STATE.revision,0);
});

test('latest action wins while invalid geographic events cannot mutate committed state',()=>{
  const a=selectionReducer(INITIAL_SELECTION_STATE,{type:'point',model:'ae',point:{latitude:25,longitude:51}});
  const b=selectionReducer(a,{type:'point',model:'gleason',point:{latitude:31,longitude:35}});
  assert.equal(b.selection.point.latitude,31);assert.equal(a.selection.point.latitude,25);
  assert.throws(()=>selectionReducer(b,{type:'point',model:'wgs84',point:{latitude:91,longitude:0}}),RangeError);
  assert.equal(b.revision,2);assert.equal(b.selection.point.latitude,31);
});


test('restored selection does not increment user revision',()=>{
  const selected=selectFreePoint('wgs84',{latitude:25.285447,longitude:51.53104});
  const restored=selectionReducer(INITIAL_SELECTION_STATE,{type:'restore',selection:selected});
  assert.equal(restored.revision,0);
  assert.deepEqual(restored.selection,selected);
  const next=selectionReducer(restored,{type:'point',model:'ae',point:{latitude:26,longitude:52}});
  assert.equal(next.revision,1);
});
