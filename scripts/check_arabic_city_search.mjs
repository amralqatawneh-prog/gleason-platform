// Uses the real imported API catalog and the actual frontend offline search function.
import assert from 'node:assert/strict';
import { searchOffline, validateOfflineSearchIndex } from '../frontend/.phase1-test-build/offline/searchIndex.js';
const base = process.argv[2] ?? 'http://127.0.0.1:8000/api/v1';
async function get(path) {
  const response = await fetch(base + path);
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response.json();
}
const pack = await get('/offline-search/core');
assert.ok(validateOfflineSearchIndex(pack));
const cities = pack.entries.filter(p => p.category === 'city');
assert.equal(cities.length, 243);
assert.equal(cities.filter(p => /[\u0600-\u06ff]/u.test(p.nameAr ?? '')).length, 243);
for (const [name, arabic] of [['Doha','الدوحة'], ['Amman','عمان'], ['Cairo','القاهرة']]) {
  const english = await get('/search?' + new URLSearchParams({ q: name, category: 'city' }));
  const translated = await get('/search?' + new URLSearchParams({ q: arabic, category: 'city' }));
  const canonical = english.results.find(p => p.name === name);
  assert.ok(canonical, name);
  assert.ok(translated.results.some(p => p.id === canonical.id && p.name_ar === arabic));
  const local = searchOffline([pack], arabic, { categories: ['city'] });
  assert.ok(local.some(p => p.id === canonical.id && p.sourceRecordId === canonical.source_record_id
    && p.latitude === canonical.latitude && p.longitude === canonical.longitude));
}
console.log('PASS: 243 source Arabic city names; Doha/Amman/Cairo online-English/online-Arabic/offline identity parity.');
