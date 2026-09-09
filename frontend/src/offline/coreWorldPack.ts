export const coreWorldPack = {
  packId: 'core-world-v1', version: '1.0.0', bundled: true, offlineCapable: true,
  dataset: 'world-atlas countries-110m', source: 'Natural Earth via world-atlas 2.0.2',
  naturalEarthVersion: '4.1.0', scale: '110m', purpose: 'Phase 2 baseline country/land geometry only',
  limitations: ['This baseline is not a detailed local map.', 'Cities, rivers, airports and region packs are scheduled for Phase 3.'],
} as const;
