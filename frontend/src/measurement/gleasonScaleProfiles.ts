import {
  GLEASON_FIG43_CIRCLE_MILES_PER_NRU,
  GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU,
} from '../models/gleason.js';

export const GLEASON_SCALE_PROFILES = Object.freeze([
  Object.freeze({
    id: 'gleason-fig43-circle-derived',
    role: 'diagnostic-derived',
    unit: 'historical-fig43-mile',
    distance_per_nru: GLEASON_FIG43_CIRCLE_MILES_PER_NRU,
    evidence_level: 'DERIVED_FROM_DOCUMENTED',
    basis: 'Diagnostic only after P6.C1: Fig.43 Equator 60 miles/longitude-degree -> 21600 circumference -> derived C=2πr; not a universal historical route metric',
  }),
  Object.freeze({
    id: 'gleason-radial-60nm-legacy',
    role: 'legacy-comparison',
    unit: 'nautical-mile-legacy',
    distance_per_nru: GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU,
    evidence_level: 'SECONDARY_OBSERVED',
    basis: 'Earlier secondary-video assumption: 60 NM for each of 180 radial latitude degrees',
  }),
  Object.freeze({
    id: 'walter-eq-configurable',
    role: 'external-comparison',
    unit: 'caller-defined',
    distance_per_nru: null,
    evidence_level: 'EXTERNAL_COMPARATIVE',
    basis: 'distance_per_nru = 2 × caller-supplied north-pole-to-Equator distance',
  }),
] as const);

export function walterDistancePerNru(equatorDistance: number): number {
  if (!Number.isFinite(equatorDistance) || equatorDistance <= 0) {
    throw new RangeError('equatorDistance must be a positive finite number');
  }
  return 2 * equatorDistance;
}
