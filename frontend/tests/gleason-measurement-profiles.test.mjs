import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLEASON_MEASUREMENT_PROFILES,
  WALTER_DEFAULT_EQUATOR_DISTANCE_KM,
  WALTER_DEFAULT_KM_PER_NRU,
  gleasonMeasurementProfile,
  profileAllowsDirectSi,
  walterDefaultDistancePerNruMetres,
} from '../.phase1-test-build/measurement/gleasonMeasurementProfiles.js';

test('P6.C1 registry contains the six approved measurement profiles with unique ids', () => {
  assert.equal(GLEASON_MEASUREMENT_PROFILES.length, 6);
  const ids=GLEASON_MEASUREMENT_PROFILES.map(profile=>profile.profile_id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of [
    'gleason-book-historical',
    'walter-flat-plane-eq-10008',
    'gleason-video-ruler-calibrated',
    'gleason-raster-calibrated',
    'gleason-fig43-circle-derived-diagnostic',
    'gleason-radial-60nm-legacy',
  ]) assert.ok(ids.includes(id), id);
});

test('Figure 43 book profile fails closed for automatic SI while unit identity remains unresolved', () => {
  const profile=gleasonMeasurementProfile('gleason-book-historical');
  assert.ok(profile);
  assert.equal(profile.si_conversion_status, 'unresolved-unit-identity');
  assert.equal(profile.si_unit, null);
  assert.equal(profileAllowsDirectSi(profile), false);
  assert.equal(profile.direction_dependency, 'local-longitude-only');
  assert.equal(profile.latitude_dependency, 'explicit');
});

test('circle-derived profile is diagnostic and is not a direct SI profile', () => {
  const profile=gleasonMeasurementProfile('gleason-fig43-circle-derived-diagnostic');
  assert.ok(profile);
  assert.equal(profile.role, 'diagnostic');
  assert.equal(profile.si_conversion_status, 'diagnostic-only');
  assert.equal(profileAllowsDirectSi(profile), false);
});

test('Walter default external profile exposes direct SI without becoming Gleason historical', () => {
  const profile=gleasonMeasurementProfile('walter-flat-plane-eq-10008');
  assert.ok(profile);
  assert.equal(profile.source_class, 'EXTERNAL_COMPARATIVE_MODEL');
  assert.equal(profile.evidence_level, 'EXTERNAL_COMPARATIVE');
  assert.equal(profile.si_conversion_status, 'direct-si');
  assert.equal(profile.si_unit, 'metre');
  assert.equal(profileAllowsDirectSi(profile), true);
  assert.equal(WALTER_DEFAULT_EQUATOR_DISTANCE_KM, 10008);
  assert.equal(WALTER_DEFAULT_KM_PER_NRU, 20016);
  assert.equal(walterDefaultDistancePerNruMetres(), 20_016_000);
});

test('video and raster calibration profiles remain gated in P6.C1', () => {
  for (const id of ['gleason-video-ruler-calibrated','gleason-raster-calibrated']) {
    const profile=gleasonMeasurementProfile(id);
    assert.ok(profile);
    assert.equal(profile.si_conversion_status, 'calibration-gated');
    assert.equal(profile.si_unit, null);
    assert.equal(profileAllowsDirectSi(profile), false);
  }
});

test('every profile carries versioned provenance, limitations and fixture-set identity', () => {
  for (const profile of GLEASON_MEASUREMENT_PROFILES) {
    assert.equal(profile.profile_version, 'P6.C1-1');
    assert.equal(profile.fixture_set_version, 'P6.C1-fixtures-v1');
    assert.ok(profile.provenance.length > 0);
    assert.ok(profile.limitations.length > 0);
  }
});
