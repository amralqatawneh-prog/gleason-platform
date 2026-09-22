import {
  GLEASON_HISTORICAL_UNIT_SCENARIOS,
  WALTER_DEFAULT_KM_PER_NRU,
} from './gleasonMeasurementProfiles.js';
import {
  localGleasonRouteDistance,
  type GleasonRouteDistancePoint,
  type GleasonRouteDistanceResult,
} from './gleasonRouteDistance.js';

export const GLEASON_SI_MEASUREMENT_VERSION = 'P6.C2-1' as const;
export const INTERNATIONAL_FOOT_METRES = 0.3048 as const;
export const INTERNATIONAL_NAUTICAL_MILE_METRES = 1852 as const;
export const ENGLISH_STATUTE_MILE_METRES = 5280 * INTERNATIONAL_FOOT_METRES;

export type GleasonSiEvidenceLevel =
  | 'EXTERNAL_COMPARATIVE'
  | 'ASSUMPTION_PROFILE';

export type GleasonSiCalculationSpace =
  | 'WALTER_SI_FLAT_PLANE'
  | 'GLEASON_DERIVED_NORMALIZED_PLANE'
  | 'GLEASON_LEGACY_COMPARISON';

export type GleasonSiProfileId =
  | 'walter-flat-plane-eq-10008'
  | 'fig43-circle-ch17-6075ft-assumption'
  | 'fig43-circle-fig37-ratio-assumption'
  | 'fig43-circle-ch19-6070ft-assumption'
  | 'legacy-radial60-intl-nm-assumption';

export interface GleasonSiSegment {
  readonly segment_id: string;
  readonly index: number;
  readonly distance_m: number;
  readonly distance_km: number;
  readonly distance_nmi: number;
}

export interface GleasonSiProfileOutput {
  readonly profile_id: GleasonSiProfileId;
  readonly profile_version: typeof GLEASON_SI_MEASUREMENT_VERSION;
  readonly source_profile_id: string;
  readonly source_class:
    | 'EXTERNAL_COMPARATIVE_MODEL'
    | 'GLEASON_PRIMARY_HISTORICAL'
    | 'OWNER_SECONDARY_OBSERVED';
  readonly evidence_level: GleasonSiEvidenceLevel;
  readonly calculation_space: GleasonSiCalculationSpace;
  readonly conversion_status: 'direct-si' | 'assumption-profile';
  readonly assumption_id: string | null;
  readonly native_distance_value: number;
  readonly native_distance_unit: string;
  readonly distance_m: number;
  readonly distance_km: number;
  readonly distance_nmi: number;
  readonly conversion_basis: string;
  readonly provenance: readonly string[];
  readonly limitations: readonly string[];
  readonly segments: readonly GleasonSiSegment[];
}

export interface GleasonSiRouteDistanceResult {
  readonly semantic_type: 'COMPUTED_RESULT';
  readonly operation: 'gleason_si_route_distance';
  readonly input: GleasonRouteDistanceResult['input'];
  readonly output: {
    readonly quantity: 'distance';
    readonly path_semantics: 'open-polyline';
    readonly base_method_id: 'gleason-native-normalized';
    readonly base_distance_normalized_radius_unit: number;
    readonly profiles: readonly GleasonSiProfileOutput[];
    readonly unavailable_profile_ids: readonly [
      'gleason-book-historical',
      'gleason-video-ruler-calibrated',
      'gleason-raster-calibrated',
      'gleason-fig43-circle-derived-diagnostic'
    ];
  };
  readonly provenance: {
    readonly semantic_type: 'COMPUTED_RESULT';
    readonly provider_id: 'gleason-si-profiles';
    readonly provider_version: typeof GLEASON_SI_MEASUREMENT_VERSION;
    readonly reference_frame: string;
    readonly operation: 'gleason_si_route_distance';
    readonly implementation: string;
    readonly implementation_version: typeof GLEASON_SI_MEASUREMENT_VERSION;
    readonly algorithm: string;
    readonly units: Readonly<Record<string, string>>;
    readonly notes: readonly string[];
  };
}

interface ConversionSpec {
  readonly profile_id: GleasonSiProfileId;
  readonly source_profile_id: string;
  readonly source_class: GleasonSiProfileOutput['source_class'];
  readonly evidence_level: GleasonSiEvidenceLevel;
  readonly calculation_space: GleasonSiCalculationSpace;
  readonly conversion_status: GleasonSiProfileOutput['conversion_status'];
  readonly assumption_id: string | null;
  readonly native_unit: string;
  readonly nativeTotal: (base: GleasonRouteDistanceResult) => number;
  readonly nativeSegment: (segment: GleasonRouteDistanceResult['output']['segments'][number]) => number;
  readonly metresPerNativeUnit: number;
  readonly conversion_basis: string;
  readonly provenance: readonly string[];
  readonly limitations: readonly string[];
}

function scenarioValue(id: string): number {
  const item = GLEASON_HISTORICAL_UNIT_SCENARIOS.find(candidate => candidate.scenario_id === id);
  if (!item || item.source_value === null) {
    throw new RangeError(`Missing historical unit scenario: ${id}`);
  }
  return item.source_value;
}

const chapter17Value = scenarioValue('chapter17-nautical-6075ft-context-assumption');
const figure37Value = scenarioValue('fig37-208english-180nautical-context-assumption');
const chapter19Value = scenarioValue('chapter19-navigator-6070ft-context');

export const CHAPTER17_6075FT_METRES_PER_MILE = chapter17Value * INTERNATIONAL_FOOT_METRES;
export const FIG37_RATIO_METRES_PER_MILE = figure37Value * ENGLISH_STATUTE_MILE_METRES;
export const CHAPTER19_6070FT_METRES_PER_MILE = chapter19Value * INTERNATIONAL_FOOT_METRES;

const CONVERSIONS: readonly ConversionSpec[] = Object.freeze([
  Object.freeze({
    profile_id: 'walter-flat-plane-eq-10008',
    source_profile_id: 'walter-flat-plane-eq-10008',
    source_class: 'EXTERNAL_COMPARATIVE_MODEL',
    evidence_level: 'EXTERNAL_COMPARATIVE',
    calculation_space: 'WALTER_SI_FLAT_PLANE',
    conversion_status: 'direct-si',
    assumption_id: null,
    native_unit: 'normalized-radius-unit',
    nativeTotal: (base: GleasonRouteDistanceResult) => base.output.total_distance_normalized_radius_unit,
    nativeSegment: (segment: GleasonRouteDistanceResult['output']['segments'][number]) => segment.distance_normalized_radius_unit,
    metresPerNativeUnit: WALTER_DEFAULT_KM_PER_NRU * 1000,
    conversion_basis: 'Walter external comparison: E=10008 km north-pole-to-Equator, therefore 1 NRU=20016 km in the shared polar normalized geometry.',
    provenance: Object.freeze([
      'walter-distances-globe-flat-earth',
      'walter-globe-flat-transformations',
      'gleason-measurement-profile-contract:P6.C1-1',
    ]),
    limitations: Object.freeze([
      'External comparative SI model only; it is not a Gleason-book historical rule.',
      'The result preserves Walter source identity even when rendered on Gleason.',
    ]),
  }),
  Object.freeze({
    profile_id: 'fig43-circle-ch17-6075ft-assumption',
    source_profile_id: 'gleason-fig43-circle-derived-diagnostic',
    source_class: 'GLEASON_PRIMARY_HISTORICAL',
    evidence_level: 'ASSUMPTION_PROFILE',
    calculation_space: 'GLEASON_DERIVED_NORMALIZED_PLANE',
    conversion_status: 'assumption-profile',
    assumption_id: 'chapter17-nautical-6075ft-context-assumption',
    native_unit: 'historical-fig43-mile',
    nativeTotal: (base: GleasonRouteDistanceResult) => base.output.total_distance_historical_fig43_mile_derived,
    nativeSegment: (segment: GleasonRouteDistanceResult['output']['segments'][number]) => segment.distance_historical_fig43_mile_derived,
    metresPerNativeUnit: CHAPTER17_6075FT_METRES_PER_MILE,
    conversion_basis: 'Explicit assumption: interpret each diagnostic Figure 43 mile as the Chapter XVII nautical/sea/Solar mile stated as 6075 feet; 1 international foot=0.3048 m.',
    provenance: Object.freeze([
      'gleason-1893-upload-v1:Fig.43',
      'gleason-1893-upload-v1:Chapter XVII 6075-foot context',
      'gleason-measurement-unit-audit-2026-09-22',
    ]),
    limitations: Object.freeze([
      'The Figure 43 passage does not itself prove that its mile is the Chapter XVII 6075-foot mile.',
      'This is an explicit assumption profile, not the automatic Gleason historical SI result.',
    ]),
  }),
  Object.freeze({
    profile_id: 'fig43-circle-fig37-ratio-assumption',
    source_profile_id: 'gleason-fig43-circle-derived-diagnostic',
    source_class: 'GLEASON_PRIMARY_HISTORICAL',
    evidence_level: 'ASSUMPTION_PROFILE',
    calculation_space: 'GLEASON_DERIVED_NORMALIZED_PLANE',
    conversion_status: 'assumption-profile',
    assumption_id: 'fig37-208english-180nautical-context-assumption',
    native_unit: 'historical-fig43-mile',
    nativeTotal: (base: GleasonRouteDistanceResult) => base.output.total_distance_historical_fig43_mile_derived,
    nativeSegment: (segment: GleasonRouteDistanceResult['output']['segments'][number]) => segment.distance_historical_fig43_mile_derived,
    metresPerNativeUnit: FIG37_RATIO_METRES_PER_MILE,
    conversion_basis: 'Explicit assumption: interpret each diagnostic Figure 43 mile as the nautical/geographical side of Fig.37 ratio 180 nautical/geographical = 208 English miles; English mile=5280 international feet.',
    provenance: Object.freeze([
      'gleason-1893-upload-v1:Figs.37-38',
      'gleason-1893-upload-v1:Fig.43',
      'gleason-measurement-unit-audit-2026-09-22',
    ]),
    limitations: Object.freeze([
      'The Figure 37 ratio is preserved separately because it is not numerically identical to the 6075-foot statement.',
      'This is an explicit assumption profile, not the automatic Gleason historical SI result.',
    ]),
  }),
  Object.freeze({
    profile_id: 'fig43-circle-ch19-6070ft-assumption',
    source_profile_id: 'gleason-fig43-circle-derived-diagnostic',
    source_class: 'GLEASON_PRIMARY_HISTORICAL',
    evidence_level: 'ASSUMPTION_PROFILE',
    calculation_space: 'GLEASON_DERIVED_NORMALIZED_PLANE',
    conversion_status: 'assumption-profile',
    assumption_id: 'chapter19-navigator-6070ft-context',
    native_unit: 'historical-fig43-mile',
    nativeTotal: (base: GleasonRouteDistanceResult) => base.output.total_distance_historical_fig43_mile_derived,
    nativeSegment: (segment: GleasonRouteDistanceResult['output']['segments'][number]) => segment.distance_historical_fig43_mile_derived,
    metresPerNativeUnit: CHAPTER19_6070FT_METRES_PER_MILE,
    conversion_basis: 'Explicit assumption: interpret each diagnostic Figure 43 mile using the reproduced Chapter XIX navigator statement of 6070 feet per nautical mile; 1 international foot=0.3048 m.',
    provenance: Object.freeze([
      'gleason-1893-upload-v1:Chapter XIX navigator correspondence',
      'gleason-1893-upload-v1:Fig.43',
      'gleason-measurement-unit-audit-2026-09-22',
    ]),
    limitations: Object.freeze([
      'This historical statement conflicts slightly with the Chapter XVII 6075-foot statement and is not silently reconciled.',
      'This is an explicit assumption profile, not the automatic Gleason historical SI result.',
    ]),
  }),
  Object.freeze({
    profile_id: 'legacy-radial60-intl-nm-assumption',
    source_profile_id: 'gleason-radial-60nm-legacy',
    source_class: 'OWNER_SECONDARY_OBSERVED',
    evidence_level: 'ASSUMPTION_PROFILE',
    calculation_space: 'GLEASON_LEGACY_COMPARISON',
    conversion_status: 'assumption-profile',
    assumption_id: 'legacy-radial60-intl-nm-assumption',
    native_unit: 'nautical-mile-legacy',
    nativeTotal: (base: GleasonRouteDistanceResult) => base.output.total_distance_legacy_radial60_nautical_mile,
    nativeSegment: (segment: GleasonRouteDistanceResult['output']['segments'][number]) => segment.distance_legacy_radial60_nautical_mile,
    metresPerNativeUnit: INTERNATIONAL_NAUTICAL_MILE_METRES,
    conversion_basis: 'Explicit comparison assumption: interpret the legacy secondary-video 60-NM/radial-degree profile with the international nautical mile of 1852 m.',
    provenance: Object.freeze([
      'gleason-video-measurement-audit-2026-09-21',
      'international-nautical-mile-display-conversion',
    ]),
    limitations: Object.freeze([
      'Secondary/legacy comparison only; it is not promoted to the preferred Gleason historical result.',
      'P6.C3 must evaluate this profile against the approved fixture set before any calibration claim.',
    ]),
  }),
]);

function toSiSegment(segmentId: string, index: number, native: number, metresPerUnit: number): GleasonSiSegment {
  const distanceM = native * metresPerUnit;
  return Object.freeze({
    segment_id: segmentId,
    index,
    distance_m: distanceM,
    distance_km: distanceM / 1000,
    distance_nmi: distanceM / INTERNATIONAL_NAUTICAL_MILE_METRES,
  });
}

export function gleasonSiFromNativeResult(base: GleasonRouteDistanceResult): GleasonSiRouteDistanceResult {
  const profiles = CONVERSIONS.map(spec => {
    const nativeTotal = spec.nativeTotal(base);
    const distanceM = nativeTotal * spec.metresPerNativeUnit;
    return Object.freeze({
      profile_id: spec.profile_id,
      profile_version: GLEASON_SI_MEASUREMENT_VERSION,
      source_profile_id: spec.source_profile_id,
      source_class: spec.source_class,
      evidence_level: spec.evidence_level,
      calculation_space: spec.calculation_space,
      conversion_status: spec.conversion_status,
      assumption_id: spec.assumption_id,
      native_distance_value: nativeTotal,
      native_distance_unit: spec.native_unit,
      distance_m: distanceM,
      distance_km: distanceM / 1000,
      distance_nmi: distanceM / INTERNATIONAL_NAUTICAL_MILE_METRES,
      conversion_basis: spec.conversion_basis,
      provenance: spec.provenance,
      limitations: spec.limitations,
      segments: Object.freeze(base.output.segments.map(segment =>
        toSiSegment(segment.segment_id, segment.index, spec.nativeSegment(segment), spec.metresPerNativeUnit))),
    });
  });

  return Object.freeze({
    semantic_type: 'COMPUTED_RESULT',
    operation: 'gleason_si_route_distance',
    input: base.input,
    output: Object.freeze({
      quantity: 'distance',
      path_semantics: 'open-polyline',
      base_method_id: 'gleason-native-normalized',
      base_distance_normalized_radius_unit: base.output.total_distance_normalized_radius_unit,
      profiles: Object.freeze(profiles),
      unavailable_profile_ids: Object.freeze([
        'gleason-book-historical',
        'gleason-video-ruler-calibrated',
        'gleason-raster-calibrated',
        'gleason-fig43-circle-derived-diagnostic',
      ] as const),
    }),
    provenance: Object.freeze({
      semantic_type: 'COMPUTED_RESULT',
      provider_id: 'gleason-si-profiles',
      provider_version: GLEASON_SI_MEASUREMENT_VERSION,
      reference_frame: 'canonical WGS84 geographic input -> profile-specific Gleason/Walter SI interpretations',
      operation: 'gleason_si_route_distance',
      implementation: 'typescript-math (browser)',
      implementation_version: GLEASON_SI_MEASUREMENT_VERSION,
      algorithm: 'Execute only P6.C1-approved direct-SI or explicitly labeled assumption conversions over the preserved native Gleason route result; no hidden normalization or WGS84 substitution.',
      units: Object.freeze({
        distance_m: 'metre',
        distance_km: 'kilometre',
        distance_nmi: 'international-nautical-mile-display',
      }),
      notes: Object.freeze([
        'The unresolved gleason-book-historical profile remains fail-closed for direct SI.',
        'The circle-derived diagnostic remains diagnostic; SI values derived from it are exposed only under explicit assumption profiles.',
        'Video and raster calibrated profiles remain unavailable until P6.C3 calibration evidence is versioned.',
        'Walter output remains an external comparative model and is never relabeled as Gleason historical.',
      ]),
    }),
  });
}

export function localGleasonSiRouteDistance(
  points: readonly GleasonRouteDistancePoint[],
  routeId = 'transient-route',
): GleasonSiRouteDistanceResult {
  return gleasonSiFromNativeResult(localGleasonRouteDistance(points, routeId));
}
