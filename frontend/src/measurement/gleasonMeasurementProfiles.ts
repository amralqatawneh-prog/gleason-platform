export type GleasonMeasurementSourceClass =
  | 'GLEASON_PRIMARY_HISTORICAL'
  | 'OWNER_SECONDARY_OBSERVED'
  | 'EXTERNAL_COMPARATIVE_MODEL'
  | 'REFERENCE_SOURCE';

export type GleasonMeasurementEvidenceLevel =
  | 'DOCUMENTED'
  | 'DERIVED_FROM_DOCUMENTED'
  | 'SECONDARY_OBSERVED'
  | 'EXTERNAL_COMPARATIVE'
  | 'ASSUMPTION_PROFILE';

export type GleasonSiConversionStatus =
  | 'not-applicable'
  | 'unresolved-unit-identity'
  | 'direct-si'
  | 'calibration-gated'
  | 'assumption-only'
  | 'diagnostic-only';

export type GleasonCalculationSpace =
  | 'GLEASON_NORMALIZED_PLANE'
  | 'GLEASON_HISTORICAL_LONGITUDE_SCALE'
  | 'WALTER_SI_FLAT_PLANE'
  | 'GLEASON_RASTER_PIXEL';

export interface GleasonMeasurementProfile {
  readonly profile_id: string;
  readonly profile_version: string;
  readonly role:
    | 'historical-contract'
    | 'external-comparison'
    | 'empirical-calibration'
    | 'diagnostic'
    | 'legacy-comparison';
  readonly calculation_space: GleasonCalculationSpace;
  readonly source_class: GleasonMeasurementSourceClass;
  readonly evidence_level: GleasonMeasurementEvidenceLevel;
  readonly native_unit: string;
  readonly si_conversion_status: GleasonSiConversionStatus;
  readonly si_unit: 'metre' | null;
  readonly scale_rule: string;
  readonly direction_dependency: 'none' | 'local-longitude-only' | 'fixture-dependent';
  readonly latitude_dependency: 'none' | 'explicit' | 'fixture-dependent';
  readonly provenance: readonly string[];
  readonly limitations: readonly string[];
  readonly fixture_set_version: string;
  readonly runtime_status: 'contract-only' | 'diagnostic-runtime' | 'legacy-runtime';
}

export interface GleasonHistoricalUnitScenario {
  readonly scenario_id: string;
  readonly evidence_level: GleasonMeasurementEvidenceLevel;
  readonly status: 'unresolved' | 'context-assumption';
  readonly source_relation: string;
  readonly source_value: number | null;
  readonly source_unit: string;
  readonly note: string;
}

/**
 * P6.C1 deliberately keeps mutually inconsistent historical conversion statements
 * separate. No scenario is the automatic Figure 43 -> SI default.
 */
export const GLEASON_HISTORICAL_UNIT_SCENARIOS: readonly Readonly<GleasonHistoricalUnitScenario>[] =
  Object.freeze([
    Object.freeze({
      scenario_id: 'fig43-mile-unresolved',
      evidence_level: 'DOCUMENTED',
      status: 'unresolved',
      source_relation: 'Figure 43 longitude in miles',
      source_value: null,
      source_unit: 'historical-fig43-mile',
      note: 'Figure 43 does not explicitly identify its mile as nautical/sea/Solar or English/statute in the figure passage.',
    }),
    Object.freeze({
      scenario_id: 'chapter17-nautical-6075ft-context-assumption',
      evidence_level: 'ASSUMPTION_PROFILE',
      status: 'context-assumption',
      source_relation: 'Chapter XVII textual nautical/sea/Solar mile definition',
      source_value: 6075,
      source_unit: 'foot-per-nautical-sea-solar-mile',
      note: 'May support an explicitly labeled later SI assumption if Figure 43 miles are intentionally interpreted as Chapter XVII nautical/sea/Solar miles.',
    }),
    Object.freeze({
      scenario_id: 'fig37-208english-180nautical-context-assumption',
      evidence_level: 'ASSUMPTION_PROFILE',
      status: 'context-assumption',
      source_relation: 'Figure 37 ratio: 208 English miles = 180 nautical/sea/geographical miles',
      source_value: 208 / 180,
      source_unit: 'english-mile-per-nautical-geographical-mile',
      note: 'Kept separate because it is not numerically identical to the Chapter XVII 6075-foot definition.',
    }),
    Object.freeze({
      scenario_id: 'chapter19-navigator-6070ft-context',
      evidence_level: 'DOCUMENTED',
      status: 'context-assumption',
      source_relation: 'Reproduced navigator letter: 6070 feet to the nautical mile',
      source_value: 6070,
      source_unit: 'foot-per-nautical-mile',
      note: 'Historical Chapter XIX correspondence; retained as a separate source statement rather than silently reconciled with 6075 feet.',
    }),
  ]);

export const WALTER_DEFAULT_EQUATOR_DISTANCE_KM = 10008 as const;
export const WALTER_DEFAULT_KM_PER_NRU = 2 * WALTER_DEFAULT_EQUATOR_DISTANCE_KM;

export const GLEASON_MEASUREMENT_PROFILES: readonly Readonly<GleasonMeasurementProfile>[] =
  Object.freeze([
    Object.freeze({
      profile_id: 'gleason-book-historical',
      profile_version: 'P6.C1-1',
      role: 'historical-contract',
      calculation_space: 'GLEASON_HISTORICAL_LONGITUDE_SCALE',
      source_class: 'GLEASON_PRIMARY_HISTORICAL',
      evidence_level: 'DOCUMENTED',
      native_unit: 'historical-source-mile',
      si_conversion_status: 'unresolved-unit-identity',
      si_unit: null,
      scale_rule: 'Figure 43 local longitude scale; arbitrary slanted route distance is not defined by Figure 43 alone',
      direction_dependency: 'local-longitude-only',
      latitude_dependency: 'explicit',
      provenance: Object.freeze([
        'gleason-1893-upload-v1:PDF pp.376-377 / printed pp.349-350',
        'gleason-1893-upload-v1:PDF p.429 / printed p.402 / Fig.43',
        'gleason-measurement-unit-audit-2026-09-22',
      ]),
      limitations: Object.freeze([
        'Figure 43 says longitude in miles but does not independently state that every Figure 43 mile is the Chapter XVII nautical/sea/Solar mile.',
        'Do not convert Figure 43 route output to SI until unit identity is demonstrated or the conversion is explicitly labeled as an assumption profile.',
        'Figure 43 is a local longitude-scale source, not a universal arbitrary-segment distance law.',
      ]),
      fixture_set_version: 'P6.C1-fixtures-v1',
      runtime_status: 'contract-only',
    }),
    Object.freeze({
      profile_id: 'walter-flat-plane-eq-10008',
      profile_version: 'P6.C1-1',
      role: 'external-comparison',
      calculation_space: 'WALTER_SI_FLAT_PLANE',
      source_class: 'EXTERNAL_COMPARATIVE_MODEL',
      evidence_level: 'EXTERNAL_COMPARATIVE',
      native_unit: 'metre',
      si_conversion_status: 'direct-si',
      si_unit: 'metre',
      scale_rule: 'r=(1-latitude/90)*10008 km; straight Euclidean chord; project normalized rho implies 1 NRU=20016 km',
      direction_dependency: 'none',
      latitude_dependency: 'explicit',
      provenance: Object.freeze([
        'walter-distances-globe-flat-earth',
        'walter-globe-flat-transformations',
      ]),
      limitations: Object.freeze([
        'External comparative model only; not a Gleason-book historical rule.',
        'Must preserve Walter source identity when rendered or compared on another model.',
      ]),
      fixture_set_version: 'P6.C1-fixtures-v1',
      runtime_status: 'contract-only',
    }),
    Object.freeze({
      profile_id: 'gleason-video-ruler-calibrated',
      profile_version: 'P6.C1-1',
      role: 'empirical-calibration',
      calculation_space: 'GLEASON_NORMALIZED_PLANE',
      source_class: 'OWNER_SECONDARY_OBSERVED',
      evidence_level: 'SECONDARY_OBSERVED',
      native_unit: 'source-declared-ruler-unit',
      si_conversion_status: 'calibration-gated',
      si_unit: null,
      scale_rule: 'fit only from approved video fixtures with explicit residuals and validity region',
      direction_dependency: 'fixture-dependent',
      latitude_dependency: 'fixture-dependent',
      provenance: Object.freeze(['gleason-video-measurement-audit-2026-09-21']),
      limitations: Object.freeze([
        'Video interpretations are secondary evidence and may conflict with the primary historical text.',
        'No fitted SI value is available until calibration parameters and residuals are versioned.',
      ]),
      fixture_set_version: 'P6.C1-fixtures-v1',
      runtime_status: 'contract-only',
    }),
    Object.freeze({
      profile_id: 'gleason-raster-calibrated',
      profile_version: 'P6.C1-1',
      role: 'empirical-calibration',
      calculation_space: 'GLEASON_RASTER_PIXEL',
      source_class: 'GLEASON_PRIMARY_HISTORICAL',
      evidence_level: 'DERIVED_FROM_DOCUMENTED',
      native_unit: 'raster-pixel',
      si_conversion_status: 'calibration-gated',
      si_unit: null,
      scale_rule: 'exact-pixel historical-raster calibration after source hash/dimensions and JGW/control geometry are verified',
      direction_dependency: 'fixture-dependent',
      latitude_dependency: 'fixture-dependent',
      provenance: Object.freeze([
        'gleason-restored-map',
        'gleason-owner-8k-map-2026-09-22',
      ]),
      limitations: Object.freeze([
        'Exact SI calibration is unavailable until the original unresampled high-resolution raster is preserved and pairing/calibration is verified.',
        'Historical printed label positions do not become modern authoritative coordinates.',
      ]),
      fixture_set_version: 'P6.C1-fixtures-v1',
      runtime_status: 'contract-only',
    }),
    Object.freeze({
      profile_id: 'gleason-fig43-circle-derived-diagnostic',
      profile_version: 'P6.C1-1',
      role: 'diagnostic',
      calculation_space: 'GLEASON_NORMALIZED_PLANE',
      source_class: 'GLEASON_PRIMARY_HISTORICAL',
      evidence_level: 'DERIVED_FROM_DOCUMENTED',
      native_unit: 'historical-fig43-mile',
      si_conversion_status: 'diagnostic-only',
      si_unit: null,
      scale_rule: '1 NRU = (360*60)/pi historical Fig.43 miles; derived by applying C=2πr to the equatorial 60-mile/degree figure',
      direction_dependency: 'none',
      latitude_dependency: 'none',
      provenance: Object.freeze([
        'gleason-1893-upload-v1:Fig.43',
        'application-derived-circle-relation',
      ]),
      limitations: Object.freeze([
        'Diagnostic/regression profile only; it is not the preferred universal Gleason route-distance interpretation.',
        'Its native mile identity is not automatically converted to SI.',
      ]),
      fixture_set_version: 'P6.C1-fixtures-v1',
      runtime_status: 'diagnostic-runtime',
    }),
    Object.freeze({
      profile_id: 'gleason-radial-60nm-legacy',
      profile_version: 'P6.C1-1',
      role: 'legacy-comparison',
      calculation_space: 'GLEASON_NORMALIZED_PLANE',
      source_class: 'OWNER_SECONDARY_OBSERVED',
      evidence_level: 'SECONDARY_OBSERVED',
      native_unit: 'nautical-mile-legacy',
      si_conversion_status: 'assumption-only',
      si_unit: null,
      scale_rule: '10800 legacy nautical miles per NRU',
      direction_dependency: 'none',
      latitude_dependency: 'none',
      provenance: Object.freeze(['gleason-video-measurement-audit-2026-09-21']),
      limitations: Object.freeze([
        'Legacy comparison only; no automatic promotion to preferred historical result.',
        'Any SI conversion belongs to a later explicitly labeled assumption/profile implementation.',
      ]),
      fixture_set_version: 'P6.C1-fixtures-v1',
      runtime_status: 'legacy-runtime',
    }),
  ]);

export function gleasonMeasurementProfile(profileId: string): Readonly<GleasonMeasurementProfile> | null {
  return GLEASON_MEASUREMENT_PROFILES.find(profile => profile.profile_id === profileId) ?? null;
}

export function profileAllowsDirectSi(profile: Readonly<GleasonMeasurementProfile>): boolean {
  return profile.si_conversion_status === 'direct-si' && profile.si_unit !== null;
}

export function walterDefaultDistancePerNruMetres(): number {
  return WALTER_DEFAULT_KM_PER_NRU * 1000;
}
