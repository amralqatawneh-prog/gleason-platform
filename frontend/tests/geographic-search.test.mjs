import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOfflineGeographicIndex,
  normalizeGeographicSearchText,
  searchOfflineGeography,
} from '../.phase1-test-build/offline/geographicSearch.js';

const entities = [
  {
    id: 'fixture:qa-doha',
    entityType: 'city',
    name: 'Doha',
    nameAr: 'الدَّوحة',
    aliases: ['Ad Dawhah'],
    latitude: 25.2854,
    longitude: 51.531,
    countryCode: 'QA',
    provenance: { sourceId: 'test-fixture', sourceVersion: '1', sourceLicense: 'test-only' },
  },
  {
    id: 'fixture:qa-airport',
    entityType: 'airport',
    name: 'Hamad International Airport',
    nameAr: 'مطار حمد الدولي',
    aliases: ['DOH'],
    latitude: 25.2731,
    longitude: 51.6081,
    countryCode: 'QA',
    provenance: { sourceId: 'test-fixture', sourceVersion: '1', sourceLicense: 'test-only' },
  },
];

test('normalizes Arabic diacritics for offline search', () => {
  assert.equal(normalizeGeographicSearchText('الدَّوحة'), 'الدوحة');
});

test('searches English, Arabic and aliases deterministically', () => {
  const index = buildOfflineGeographicIndex(entities);
  assert.equal(searchOfflineGeography(index, 'Doha')[0].id, 'fixture:qa-doha');
  assert.equal(searchOfflineGeography(index, 'الدوحة')[0].id, 'fixture:qa-doha');
  assert.equal(searchOfflineGeography(index, 'DOH')[0].id, 'fixture:qa-airport');
});

test('filters by canonical entity type', () => {
  const index = buildOfflineGeographicIndex(entities);
  assert.deepEqual(searchOfflineGeography(index, 'do', ['airport']).map((x) => x.id), ['fixture:qa-airport']);
});
