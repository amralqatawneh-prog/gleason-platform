import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLEASON_FIG43_CIRCLE_MILES_PER_NRU,
  GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU,
  historicalLongitudeDegreeMiles,
} from '../.phase1-test-build/models/gleason.js';
import {
  gleasonFig37NauticalToEnglishMiles,
  gleasonFig43CircleDerivedDistance,
  gleasonFrameTimeDifference,
  gleasonLegacyRadial60Distance,
  gleasonSameLatitudeHistoricalLongitudeMetrics,
  gleasonTextNauticalToEnglishMiles,
  gleasonWalterConfigurableDistance,
} from '../.phase1-test-build/measurement/gleasonHistoricalMeasurement.js';
import { GLEASON_SCALE_PROFILES } from '../.phase1-test-build/measurement/gleasonScaleProfiles.js';

const close = (actual, expected, tol=1e-9) => assert.ok(Math.abs(actual-expected) < tol, `${actual} != ${expected}`);

test('scale registry separates diagnostic circle derivation, legacy video assumption and Walter configurable profile', () => {
  assert.equal(GLEASON_SCALE_PROFILES[0].id, 'gleason-fig43-circle-derived');
  assert.equal(GLEASON_SCALE_PROFILES[0].role, 'diagnostic-derived');
  close(GLEASON_FIG43_CIRCLE_MILES_PER_NRU, 21600 / Math.PI, 1e-12);
  assert.equal(GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU, 10800);
  assert.equal(GLEASON_SCALE_PROFILES[2].id, 'walter-eq-configurable');
});

test('historical circle-derived scale gives C/2π pole-to-Equator radius', () => {
  const poleToEquator = gleasonFig43CircleDerivedDistance(
    { latitude: 90, longitude: 0 },
    { latitude: 0, longitude: 0 },
  );
  close(poleToEquator, 10800 / Math.PI, 1e-9);
});

test('Figure 43 historical longitude scale reproduces source table anchors', () => {
  assert.equal(historicalLongitudeDegreeMiles(90), 0);
  close(historicalLongitudeDegreeMiles(85), 10 / 3, 1e-12);
  assert.equal(historicalLongitudeDegreeMiles(0), 60);
  assert.equal(historicalLongitudeDegreeMiles(-30), 80);
  assert.equal(historicalLongitudeDegreeMiles(-90), 120);
});

test('same-latitude Figure 43 tool exposes arc and chord separately', () => {
  const result = gleasonSameLatitudeHistoricalLongitudeMetrics(
    { latitude: -30, longitude: 114.967 },
    { latitude: -30, longitude: 153.25 },
  );
  assert.ok(result);
  close(result.longitude_delta_deg, 38.283, 1e-12);
  assert.equal(result.miles_per_longitude_degree, 80);
  close(result.parallel_arc_historical_fig43_mile, 3062.64, 1e-9);
  close(result.straight_chord_historical_fig43_mile, 3005.986408184987, 1e-9);
});

test('Figure 43 rejects video-2 shortcut 60 miles per longitude degree at 33 south', () => {
  const result = gleasonSameLatitudeHistoricalLongitudeMetrics(
    { latitude: -33, longitude: 151 },
    { latitude: -33, longitude: 115 },
  );
  assert.ok(result);
  assert.equal(result.miles_per_longitude_degree, 82);
  assert.equal(result.parallel_arc_historical_fig43_mile, 2952);
  assert.notEqual(result.parallel_arc_historical_fig43_mile, 2160);
});

test('historical scale reproduces new-video spreadsheet fixtures', () => {
  close(
    gleasonFig43CircleDerivedDistance(
      { latitude: 0, longitude: -105 },
      { latitude: -60, longitude: -165 },
    ),
    4994.930255778278,
    1e-9,
  );
  close(
    gleasonFig43CircleDerivedDistance(
      { latitude: -2.605, longitude: 135 },
      { latitude: -38.06, longitude: 135 },
    ),
    1354.281241757556,
    1e-9,
  );
});

test('legacy radial-60 scale remains available and distinct from the diagnostic circle derivation', () => {
  const start={ latitude: 90, longitude: 0 };
  const end={ latitude: 0, longitude: 0 };
  close(gleasonLegacyRadial60Distance(start,end), 5400, 1e-12);
  assert.notEqual(
    gleasonLegacyRadial60Distance(start,end),
    gleasonFig43CircleDerivedDistance(start,end),
  );
});

test('Walter configurable profile is the same geometry with caller supplied scale', () => {
  const start={ latitude: 25.285447, longitude: 51.53104 };
  const end={ latitude: 31.9539, longitude: 35.9106 };
  const eq=10007.543398;
  const a=gleasonWalterConfigurableDistance(start,end,eq);
  const b=gleasonWalterConfigurableDistance(start,end,eq*2);
  close(b,2*a,1e-9);
});

test('frame/time calculator preserves Chapter XVII 15 degrees = one hour relation', () => {
  assert.equal(gleasonFrameTimeDifference(0,15).absolute_sun_time_minutes,60);
  assert.equal(gleasonFrameTimeDifference(0,1).absolute_sun_time_minutes,4);
  assert.equal(gleasonFrameTimeDifference(0,0.25).absolute_sun_time_minutes,1);
});

test('Figure 37 ratio and textual foot definitions remain separate historical conversions', () => {
  assert.equal(gleasonFig37NauticalToEnglishMiles(180),208);
  close(gleasonTextNauticalToEnglishMiles(1),6075/5280,1e-15);
});
