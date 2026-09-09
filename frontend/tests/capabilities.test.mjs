import test from 'node:test';
import assert from 'node:assert/strict';
import { threeDMode } from '../.phase1-test-build/platform/capabilities.js';

test('uses 2D fallback when WebGL2 is missing', () => {
  assert.equal(threeDMode({ webgl2: false, serviceWorker: true, indexedDb: true, touch: true, online: false }), 'fallback-2d');
});

test('allows 3D shell when WebGL2 exists', () => {
  assert.equal(threeDMode({ webgl2: true, serviceWorker: true, indexedDb: true, touch: false, online: true }), 'available');
});
