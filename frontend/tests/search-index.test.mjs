import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activeIndexes,
  installRegionPack,
  removeRegionPack,
  searchOffline,
  validateOfflineSearchIndex,
} from '../.phase1-test-build/offline/searchIndex.js';

const core = {
  schemaVersion: 1,
  id: 'core-test',
  version: '1',
  generatedAt: '2026-09-17T00:00:00Z',
  sourceIds: ['fixture'],
  entries: [
    { id:'city-doha', category:'city', name:'Doha', nameAr:'الدوحة', aliases:[], countryCode:'QA', latitude:25.2854, longitude:51.531, sourceId:'fixture', sourceRecordId:'1' },
    { id:'airport-doha', category:'airport', name:'Hamad Test Airport', aliases:['DOH'], countryCode:'QA', latitude:25.273, longitude:51.608, sourceId:'fixture', sourceRecordId:'2' },
  ],
};

const region = {
  schemaVersion: 1,
  id: 'region-test',
  version: '1',
  generatedAt: '2026-09-17T00:00:00Z',
  sourceIds: ['fixture'],
  entries: [
    { id:'mountain-test', category:'mountain', name:'Test Mountain', aliases:[], countryCode:'QA', latitude:25.0, longitude:51.0, sourceId:'fixture', sourceRecordId:'3' },
  ],
};

test('validates versioned offline search index', () => {
  assert.equal(validateOfflineSearchIndex(core), true);
  assert.equal(validateOfflineSearchIndex({ ...core, entries:[{...core.entries[0], latitude:100}] }), false);
});

test('searches names, Arabic names and aliases deterministically', () => {
  assert.equal(searchOffline([core], 'Doha')[0].id, 'city-doha');
  assert.equal(searchOffline([core], 'الدوحة')[0].id, 'city-doha');
  assert.equal(searchOffline([core], 'DOH')[0].id, 'airport-doha');
});

test('filters categories and countries', () => {
  assert.equal(searchOffline([core], 'do', { categories:['airport'], countryCode:'qa' })[0].id, 'airport-doha');
  assert.equal(searchOffline([core], 'do', { countryCode:'JO' }).length, 0);
});

test('installs and removes region packs without mutating core', () => {
  const initial = { core, regions:{} };
  const installed = installRegionPack(initial, region);
  assert.equal(activeIndexes(installed).length, 2);
  const removed = removeRegionPack(installed, region.id);
  assert.equal(activeIndexes(removed).length, 1);
  assert.equal(removed.core.id, core.id);
});
