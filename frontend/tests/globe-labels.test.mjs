import test from 'node:test';
import assert from 'node:assert/strict';
import { declutterProjectedLabels, globeLabelFontSize } from '../.phase1-test-build/reference/globeLabels.js';

function candidate(id, text, priority, x, y, kind = 'country') {
  return {
    label: {
      id,
      latitude: 0,
      longitude: 0,
      text,
      kind,
      priority,
      provenance: 'PHASE3_PLACE',
    },
    screen: { x, y, visible: true, depth: 0.9 },
  };
}

test('country labels are intentionally smaller than continent labels', () => {
  assert.ok(globeLabelFontSize('country', 1200) < globeLabelFontSize('continent', 1200));
});

test('labels shrink when the available viewport becomes narrower', () => {
  assert.ok(globeLabelFontSize('country', 450) < globeLabelFontSize('country', 900));
});

test('decluttering keeps higher-priority labels and removes overlaps', () => {
  const result = declutterProjectedLabels([
    candidate('a', 'Qatar', 80, 100, 100),
    candidate('b', 'Bahrain', 80, 103, 100),
    candidate('c', 'Oman', 80, 180, 100),
  ], 400, 300);
  assert.deepEqual(result.map((item) => item.label.id), ['a', 'c']);
});

test('labels on the rear hemisphere are excluded', () => {
  const rear = candidate('rear', 'Rear', 80, 100, 100);
  rear.screen.depth = 0.1;
  const result = declutterProjectedLabels([rear], 400, 300);
  assert.equal(result.length, 0);
});

test('mobile labels remain readable and decluttering sorts priority without mutating input',()=>{
  for(const kind of ['continent','country','ocean','sea','city','airport']) assert.ok(globeLabelFontSize(kind,320)>=12);
  const input=[candidate('low','Test city',35,150,100),candidate('high','Test country',80,150,100)];
  assert.deepEqual(declutterProjectedLabels(input,320,240).map(x=>x.label.id),['high']);
  assert.equal(input[0].label.id,'low');
  assert.equal(declutterProjectedLabels([candidate('edge','Clipped label',80,1,100)],320,240).length,0);
});
