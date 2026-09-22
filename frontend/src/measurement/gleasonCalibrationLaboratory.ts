import { historicalLongitudeDegreeMiles } from '../models/gleason.js';
import {
  gleasonFig43CircleDerivedDistance,
  gleasonSameLatitudeHistoricalLongitudeMetrics,
  gleasonWalterConfigurableDistance,
} from './gleasonHistoricalMeasurement.js';
import { localWgs84RouteDistance } from './wgs84RouteDistance.js';

export const GLEASON_CALIBRATION_LAB_VERSION = 'P6.C3-1' as const;
export const GLEASON_CALIBRATION_FIXTURE_SET_VERSION = 'P6.C3-fixtures-v1' as const;
export const WALTER_DEFAULT_EQUATOR_KM = 10008 as const;

export type CalibrationSourceClass =
  | 'GLEASON_PRIMARY_HISTORICAL'
  | 'OWNER_SECONDARY_OBSERVED'
  | 'EXTERNAL_COMPARATIVE_MODEL'
  | 'REFERENCE_SOURCE';

export type CalibrationEvidenceLevel =
  | 'DOCUMENTED'
  | 'DERIVED_FROM_DOCUMENTED'
  | 'SECONDARY_OBSERVED'
  | 'EXTERNAL_COMPARATIVE'
  | 'REFERENCE';

export type CalibrationFixtureStatus = 'ready' | 'diagnostic-only' | 'gated';

export type CalibrationResearchProfileId =
  | 'gleason-book-local-longitude'
  | 'gleason-fig43-circle-derived-diagnostic'
  | 'planar-law-of-cosines-diagnostic'
  | 'walter-flat-plane-eq-10008'
  | 'gleason-raster-restored-diagnostic'
  | 'gleason-raster-calibrated';

export interface CalibrationEndpoint {
  readonly latitude: number;
  readonly longitude: number;
}

export interface GleasonCalibrationFixtureResult {
  readonly fixture_id: string;
  readonly fixture_version: typeof GLEASON_CALIBRATION_FIXTURE_SET_VERSION;
  readonly fixture_kind:
    | 'historical_longitude_arc'
    | 'geographic_chord'
    | 'abstract_triangle'
    | 'reference_comparison'
    | 'raster_fit_diagnostic'
    | 'raster_fit';
  readonly research_profile_id: CalibrationResearchProfileId;
  readonly source_class: CalibrationSourceClass;
  readonly evidence_level: CalibrationEvidenceLevel;
  readonly endpoints: readonly CalibrationEndpoint[] | null;
  readonly source_distance: number | null;
  readonly source_unit: string;
  readonly profile_prediction: number | null;
  readonly prediction_unit: string | null;
  readonly residual_signed: number | null;
  readonly residual_absolute: number | null;
  readonly residual_percent: number | null;
  readonly residual_kind: 'prediction-minus-source' | 'radial-fit-rms' | null;
  readonly latitude_context: string;
  readonly direction_context: string;
  readonly status: CalibrationFixtureStatus;
  readonly gate_reason: string | null;
  readonly provenance: readonly string[];
  readonly notes: readonly string[];
}

export interface GleasonLocalScaleDiagnostic {
  readonly latitude_deg: number;
  readonly historical_fig43_miles_per_longitude_degree: number;
  readonly walter_radius_km: number;
  readonly walter_tangential_km_per_longitude_degree: number;
  readonly walter_radial_km_per_latitude_degree: number;
  readonly calculation_spaces: readonly string[];
  readonly limitations: readonly string[];
}

function residual(source: number, prediction: number) {
  const signed = prediction - source;
  return Object.freeze({
    residual_signed: signed,
    residual_absolute: Math.abs(signed),
    residual_percent: source === 0 ? null : (signed / source) * 100,
  });
}

function endpoint(latitude: number, longitude: number): CalibrationEndpoint {
  return Object.freeze({ latitude, longitude });
}

function geographicChordFixture(
  fixtureId: string,
  start: CalibrationEndpoint,
  end: CalibrationEndpoint,
  sourceDistance: number,
  provenance: readonly string[],
  latitudeContext: string,
  directionContext: string,
): GleasonCalibrationFixtureResult {
  const prediction = gleasonFig43CircleDerivedDistance(start, end);
  const delta = residual(sourceDistance, prediction);
  return Object.freeze({
    fixture_id: fixtureId,
    fixture_version: GLEASON_CALIBRATION_FIXTURE_SET_VERSION,
    fixture_kind: 'geographic_chord',
    research_profile_id: 'gleason-fig43-circle-derived-diagnostic',
    source_class: 'OWNER_SECONDARY_OBSERVED',
    evidence_level: 'SECONDARY_OBSERVED',
    endpoints: Object.freeze([start, end]),
    source_distance: sourceDistance,
    source_unit: 'historical-fig43-mile',
    profile_prediction: prediction,
    prediction_unit: 'historical-fig43-mile',
    ...delta,
    residual_kind: 'prediction-minus-source',
    latitude_context: latitudeContext,
    direction_context: directionContext,
    status: 'ready',
    gate_reason: null,
    provenance: Object.freeze([...provenance]),
    notes: Object.freeze([
      'Secondary observed fixture only; agreement does not promote the video interpretation to primary historical authority.',
      'Prediction uses the circle-derived diagnostic, not a preferred universal Gleason route scale.',
    ]),
  });
}

function bookFixture(): GleasonCalibrationFixtureResult {
  const start = endpoint(0, 0);
  const end = endpoint(0, 1);
  const metrics = gleasonSameLatitudeHistoricalLongitudeMetrics(start, end);
  if (!metrics) throw new Error('P6.C3 book fixture unexpectedly lacks same-latitude metrics.');
  const sourceDistance = 60;
  const prediction = metrics.parallel_arc_historical_fig43_mile;
  const delta = residual(sourceDistance, prediction);
  return Object.freeze({
    fixture_id: 'book-fig43-equator-one-degree',
    fixture_version: GLEASON_CALIBRATION_FIXTURE_SET_VERSION,
    fixture_kind: 'historical_longitude_arc',
    research_profile_id: 'gleason-book-local-longitude',
    source_class: 'GLEASON_PRIMARY_HISTORICAL',
    evidence_level: 'DOCUMENTED',
    endpoints: Object.freeze([start, end]),
    source_distance: sourceDistance,
    source_unit: 'historical-fig43-mile',
    profile_prediction: prediction,
    prediction_unit: 'historical-fig43-mile',
    ...delta,
    residual_kind: 'prediction-minus-source',
    latitude_context: 'Equator / 0°',
    direction_context: 'one-degree longitude arc on one latitude',
    status: 'ready',
    gate_reason: null,
    provenance: Object.freeze([
      'gleason-1893-upload-v1:PDF p.429 / printed p.402 / Fig.43',
      'gleason-measurement-unit-audit-2026-09-22',
    ]),
    notes: Object.freeze([
      'Figure 43 is used only as a local longitude-scale fixture.',
      'The historical Figure-43 mile remains unresolved for automatic SI conversion.',
    ]),
  });
}

function triangleFixture(): GleasonCalibrationFixtureResult {
  const sideA = 17.3;
  const sideB = 10.6;
  const angleRad = 52 * Math.PI / 180;
  const prediction = Math.sqrt(sideA ** 2 + sideB ** 2 - 2 * sideA * sideB * Math.cos(angleRad));
  const sourceDistance = 13.6326812223;
  const delta = residual(sourceDistance, prediction);
  return Object.freeze({
    fixture_id: 'video-SuHnvvYEfok-ruler-triangle',
    fixture_version: GLEASON_CALIBRATION_FIXTURE_SET_VERSION,
    fixture_kind: 'abstract_triangle',
    research_profile_id: 'planar-law-of-cosines-diagnostic',
    source_class: 'OWNER_SECONDARY_OBSERVED',
    evidence_level: 'SECONDARY_OBSERVED',
    endpoints: null,
    source_distance: sourceDistance,
    source_unit: 'centimetre',
    profile_prediction: prediction,
    prediction_unit: 'centimetre',
    ...delta,
    residual_kind: 'prediction-minus-source',
    latitude_context: 'not-applicable',
    direction_context: 'abstract ruler/protractor triangle: sides 17.3 cm, 10.6 cm, included angle 52°',
    status: 'ready',
    gate_reason: null,
    provenance: Object.freeze(['gleason-video-measurement-audit-2026-09-21:SuHnvvYEfok']),
    notes: Object.freeze([
      'Geometry-only secondary fixture; it does not establish a geographic map scale by itself.',
    ]),
  });
}

function walterPoleEquatorFixture(): GleasonCalibrationFixtureResult {
  const start = endpoint(90, 0);
  const end = endpoint(0, 0);
  const sourceDistance = WALTER_DEFAULT_EQUATOR_KM;
  const prediction = gleasonWalterConfigurableDistance(start, end, WALTER_DEFAULT_EQUATOR_KM);
  const delta = residual(sourceDistance, prediction);
  return Object.freeze({
    fixture_id: 'walter-pole-equator-default',
    fixture_version: GLEASON_CALIBRATION_FIXTURE_SET_VERSION,
    fixture_kind: 'geographic_chord',
    research_profile_id: 'walter-flat-plane-eq-10008',
    source_class: 'EXTERNAL_COMPARATIVE_MODEL',
    evidence_level: 'EXTERNAL_COMPARATIVE',
    endpoints: Object.freeze([start, end]),
    source_distance: sourceDistance,
    source_unit: 'kilometre',
    profile_prediction: prediction,
    prediction_unit: 'kilometre',
    ...delta,
    residual_kind: 'prediction-minus-source',
    latitude_context: 'North Pole to Equator',
    direction_context: 'radial',
    status: 'ready',
    gate_reason: null,
    provenance: Object.freeze([
      'walter-distances-globe-flat-earth',
      'walter-globe-flat-transformations',
    ]),
    notes: Object.freeze(['External comparative model only; never relabel as Gleason historical.']),
  });
}

function referenceFixture(): GleasonCalibrationFixtureResult {
  const start = endpoint(0, 0);
  const end = endpoint(0, 1);
  const sourceDistance = localWgs84RouteDistance([
    { point_id: 'A', ...start },
    { point_id: 'B', ...end },
  ], 'p6c3-reference-equator-one-degree').output.total_distance_m;
  const prediction = gleasonWalterConfigurableDistance(start, end, WALTER_DEFAULT_EQUATOR_KM) * 1000;
  const delta = residual(sourceDistance, prediction);
  return Object.freeze({
    fixture_id: 'reference-equator-one-degree-wgs84-vs-walter',
    fixture_version: GLEASON_CALIBRATION_FIXTURE_SET_VERSION,
    fixture_kind: 'reference_comparison',
    research_profile_id: 'walter-flat-plane-eq-10008',
    source_class: 'REFERENCE_SOURCE',
    evidence_level: 'REFERENCE',
    endpoints: Object.freeze([start, end]),
    source_distance: sourceDistance,
    source_unit: 'metre',
    profile_prediction: prediction,
    prediction_unit: 'metre',
    ...delta,
    residual_kind: 'prediction-minus-source',
    latitude_context: 'Equator / 0°',
    direction_context: 'one-degree longitude separation',
    status: 'ready',
    gate_reason: null,
    provenance: Object.freeze([
      'WGS84-0.4.0 reference',
      'geographiclib-geodesic browser implementation',
      'walter-flat-plane-eq-10008',
    ]),
    notes: Object.freeze([
      'Reference residual is descriptive only; it does not convert or relabel either model.',
    ]),
  });
}

function restoredRasterDiagnostic(): GleasonCalibrationFixtureResult {
  const fittedRadius = 1851.8383776797139;
  const rms = 5.768749489287826;
  return Object.freeze({
    fixture_id: 'raster-restored-outer-ring-fit',
    fixture_version: GLEASON_CALIBRATION_FIXTURE_SET_VERSION,
    fixture_kind: 'raster_fit_diagnostic',
    research_profile_id: 'gleason-raster-restored-diagnostic',
    source_class: 'OWNER_SECONDARY_OBSERVED',
    evidence_level: 'DERIVED_FROM_DOCUMENTED',
    endpoints: null,
    source_distance: fittedRadius,
    source_unit: 'raster-pixel-radius',
    profile_prediction: null,
    prediction_unit: null,
    residual_signed: null,
    residual_absolute: rms,
    residual_percent: 100 * rms / fittedRadius,
    residual_kind: 'radial-fit-rms',
    latitude_context: 'not-applicable',
    direction_context: 'outer-ring radial fit',
    status: 'diagnostic-only',
    gate_reason: null,
    provenance: Object.freeze(['gleason-restored-map-owner-upload-2026-09-21']),
    notes: Object.freeze([
      'RMS is a geometric fit diagnostic relative to the fitted ring radius, not prediction-minus-source.',
      'The fit is provisional and is not a geographic city-control truth set.',
    ]),
  });
}

function gated8kRasterFixture(): GleasonCalibrationFixtureResult {
  return Object.freeze({
    fixture_id: 'raster-owner-8k-jgw',
    fixture_version: GLEASON_CALIBRATION_FIXTURE_SET_VERSION,
    fixture_kind: 'raster_fit',
    research_profile_id: 'gleason-raster-calibrated',
    source_class: 'OWNER_SECONDARY_OBSERVED',
    evidence_level: 'SECONDARY_OBSERVED',
    endpoints: null,
    source_distance: null,
    source_unit: 'unknown-jgw-native-unit',
    profile_prediction: null,
    prediction_unit: null,
    residual_signed: null,
    residual_absolute: null,
    residual_percent: null,
    residual_kind: null,
    latitude_context: 'not-applicable',
    direction_context: 'not-applicable',
    status: 'gated',
    gate_reason: 'missing-true-companion-8k-raster',
    provenance: Object.freeze([
      'gleason-owner-8k-map-2026-09-22',
      'data/sources/artifacts/8k-Flat-Earth-map.jgw',
    ]),
    notes: Object.freeze([
      'The JGW alone is not an image and does not prove metres, miles or a named CRS.',
      'Do not pair it with the unrelated 1464x2048 JPEG.',
    ]),
  });
}

export function gleasonCalibrationFixtures(): readonly Readonly<GleasonCalibrationFixtureResult>[] {
  return Object.freeze([
    bookFixture(),
    geographicChordFixture(
      'video-dNBxb-spreadsheet-chord',
      endpoint(0, -105),
      endpoint(-60, -165),
      4994.930255778278,
      ['gleason-video-measurement-audit-2026-09-21:dNBxb-UTmeg'],
      '0° to 60°S',
      'oblique projected chord',
    ),
    geographicChordFixture(
      'video-dNBxb-australia-chord',
      endpoint(-30, 114.967),
      endpoint(-30, 153.25),
      3005.986408184987,
      ['gleason-video-measurement-audit-2026-09-21:dNBxb-UTmeg'],
      '30°S',
      'same-latitude straight chord; source also records 3062.64 arc',
    ),
    geographicChordFixture(
      'video-dNBxb-australia-north-south',
      endpoint(-2.605, 134),
      endpoint(-38.06, 134),
      1354.281241757556,
      ['gleason-video-measurement-audit-2026-09-21:dNBxb-UTmeg'],
      '2.605°S to 38.06°S',
      'same-longitude radial segment',
    ),
    triangleFixture(),
    walterPoleEquatorFixture(),
    referenceFixture(),
    restoredRasterDiagnostic(),
    gated8kRasterFixture(),
  ]);
}

export function fixturesForResearchProfile(
  profileId: CalibrationResearchProfileId | 'all',
): readonly Readonly<GleasonCalibrationFixtureResult>[] {
  const fixtures = gleasonCalibrationFixtures();
  if (profileId === 'all') return fixtures;
  return Object.freeze(fixtures.filter(fixture => fixture.research_profile_id === profileId));
}

export function gleasonLocalScaleDiagnostic(latitudeDeg: number): Readonly<GleasonLocalScaleDiagnostic> {
  if (!Number.isFinite(latitudeDeg) || latitudeDeg < -90 || latitudeDeg > 90) {
    throw new RangeError('latitude must be finite and within [-90, 90]');
  }
  const walterRadiusKm = (1 - latitudeDeg / 90) * WALTER_DEFAULT_EQUATOR_KM;
  return Object.freeze({
    latitude_deg: latitudeDeg,
    historical_fig43_miles_per_longitude_degree: historicalLongitudeDegreeMiles(latitudeDeg),
    walter_radius_km: walterRadiusKm,
    walter_tangential_km_per_longitude_degree: 2 * Math.PI * walterRadiusKm / 360,
    walter_radial_km_per_latitude_degree: WALTER_DEFAULT_EQUATOR_KM / 90,
    calculation_spaces: Object.freeze([
      'GLEASON_HISTORICAL_LONGITUDE_SCALE',
      'WALTER_SI_FLAT_PLANE',
    ]),
    limitations: Object.freeze([
      'Figure 43 local longitude scale and Walter SI plane are separate model identities.',
      'This diagnostic does not convert the unresolved historical Figure-43 mile to SI.',
      'Tangential values are local arc diagnostics, not arbitrary-route chord distances.',
    ]),
  });
}
