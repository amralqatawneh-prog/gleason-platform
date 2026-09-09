import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePackManifest } from '../.phase1-test-build/offline/packManifest.js';

test('accepts a valid offline pack manifest', () => {
  assert.equal(validatePackManifest({
    schemaVersion: 1,
    id: 'core-world-v1',
    kind: 'core-world',
    version: '1.0.0',
    title: 'Core World',
    generatedAt: '2026-09-09T00:00:00Z',
    sourceIds: ['natural-earth'],
    files: [{ path: 'world.pmtiles', sha256: 'a'.repeat(64), bytes: 10 }],
  }), true);
});

test('rejects malformed checksum and unknown pack kind', () => {
  assert.equal(validatePackManifest({
    schemaVersion: 1,
    id: 'bad',
    kind: 'unknown',
    version: '1',
    title: 'Bad',
    generatedAt: 'x',
    sourceIds: [],
    files: [{ path: 'x', sha256: 'nope', bytes: 1 }],
  }), false);
});
