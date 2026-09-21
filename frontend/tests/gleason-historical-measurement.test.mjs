import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLEASON_MAP_RULER_NAUTICAL_MILES_PER_NRU,
  historicalLongitudeDegreeMiles,
} from '../.phase1-test-build/models/gleason.js';
import {
  gleasonFig37NauticalToEnglishMiles,
  gleasonFrameTimeDifference,
  gleasonMapRulerDerivedNauticalMiles,
  gleasonSameLatitudeHistoricalLongitudeDistance,
  gleasonTextNauticalToEnglishMiles,
} from '../.phase1-test-build/measurement/gleasonHistoricalMeasurement.js';

test('source-derived map-ruler calibration keeps 60 nautical miles per radial latitude degree', () => {
  assert.equal(GLEASON_MAP_RULER_NAUTICAL_MILES_PER_NRU, 10800);
  assert.equal(
    gleasonMapRulerDerivedNauticalMiles(
      { latitude: 90, longitude: 0 },
      { latitude: 0, longitude: 0 },
    ),
    5400,
  );
});

test('Figure 43 historical longitude scale reproduces source table anchors', () => {
  assert.equal(historicalLongitudeDegreeMiles(90), 0);
  assert.ok(Math.abs(historicalLongitudeDegreeMiles(85) - 10 / 3) < 1e-12);
  assert.equal(historicalLongitudeDegreeMiles(0), 60);
  assert.equal(historicalLongitudeDegreeMiles(-30), 80);
  assert.equal(historicalLongitudeDegreeMiles(-90), 120);
});

test('Figure 43 rejects the video-2 shortcut of 60 miles per longitude degree at 33 south', () => {
  const result = gleasonSameLatitudeHistoricalLongitudeDistance(
    { latitude: -33, longitude: 151 },
    { latitude: -33, longitude: 115 },
  );
  assert.ok(result);
  assert.equal(result.longitude_delta_deg, 36);
  assert.equal(result.miles_per_longitude_degree, 82);
  assert.equal(result.distance_historical_book_mile, 2952);
  assert.notEqual(result.distance_historical_book_mile, 2160);
});

test('Figure 43 calculator fails closed for an arbitrary slanted segment', () => {
  assert.equal(
    gleasonSameLatitudeHistoricalLongitudeDistance(
      { latitude: -34, longitude: 151 },
      { latitude: -32, longitude: 115 },
    ),
    null,
  );
});

test('frame/time calculator preserves the Chapter XVII 15 degrees = one hour relation', () => {
  assert.equal(gleasonFrameTimeDifference(0, 15).absolute_sun_time_minutes, 60);
  assert.equal(gleasonFrameTimeDifference(0, 1).absolute_sun_time_minutes, 4);
  assert.equal(gleasonFrameTimeDifference(0, 0.25).absolute_sun_time_minutes, 1);
});

test('Figure 37 ratio and textual foot definitions remain separate historical conversions', () => {
  assert.equal(gleasonFig37NauticalToEnglishMiles(180), 208);
  assert.ok(Math.abs(gleasonTextNauticalToEnglishMiles(1) - (6075 / 5280)) < 1e-15);
  assert.notEqual(gleasonFig37NauticalToEnglishMiles(1), gleasonTextNauticalToEnglishMiles(1));
});

test('video-1 ruler examples are reproduced within one percent by the derived map-plane calibration', () => {
  const georgetownToMorocco = gleasonMapRulerDerivedNauticalMiles(
    { latitude: 7, longitude: -58 },
    { latitude: 31.5, longitude: -7 },
  );
  const videoGeorgetownMorocco = 11.72 * 330;
  assert.ok(Math.abs(georgetownToMorocco - videoGeorgetownMorocco) / videoGeorgetownMorocco < 0.01);

  const sydneyToKamchatka = gleasonMapRulerDerivedNauticalMiles(
    { latitude: -34, longitude: 150.5 },
    { latitude: 53, longitude: 157 },
  );
  const videoSydneyKamchatka = 15.8 * 330;
  assert.ok(Math.abs(sydneyToKamchatka - videoSydneyKamchatka) / videoSydneyKamchatka < 0.01);
});
