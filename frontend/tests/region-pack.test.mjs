import test from 'node:test';
import assert from 'node:assert/strict';
import { computeRegionPackChecksum, validateRegionPack } from '../.phase1-test-build/offline/regionPack.js';

const entities = [{
  id: 'test:city:doha',
  entityType: 'city',
  name: 'Doha',
  nameAr: 'الدوحة',
  aliases: ['Ad Dawhah'],
  latitude: 25.285,
  longitude: 51.531,
  countryCode: 'QA',
  provenance: { sourceId: 'TEST_FIXTURE_ONLY', sourceVersion: '1', sourceLicense: 'TEST_ONLY' },
}];

test('region pack checksum is deterministic and validates', async () => {
  const sha256 = await computeRegionPackChecksum(entities);
  assert.match(sha256, /^[a-f0-9]{64}$/);
  await validateRegionPack({
    manifest: { id: 'qa-test', version: '1', region: 'QA', generatedAt: '2026-01-01T00:00:00Z', entityCount: 1, sha256, sourceIds: ['TEST_FIXTURE_ONLY'] },
    entities,
  });
});

test('region pack rejects checksum mismatch', async () => {
  await assert.rejects(() => validateRegionPack({
    manifest: { id: 'qa-test', version: '1', region: 'QA', generatedAt: '2026-01-01T00:00:00Z', entityCount: 1, sha256: '0'.repeat(64), sourceIds: ['TEST_FIXTURE_ONLY'] },
    entities,
  }), /checksum mismatch/);
});
