import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLEASON_CALIBRATION_FIXTURE_SET_VERSION,
  fixturesForResearchProfile,
  gleasonCalibrationFixtures,
  gleasonLocalScaleDiagnostic,
} from '../.phase1-test-build/measurement/gleasonCalibrationLaboratory.js';

test('P6.C3 fixture registry exposes the source-backed initial fixture families', () => {
  const fixtures=gleasonCalibrationFixtures();
  assert.equal(GLEASON_CALIBRATION_FIXTURE_SET_VERSION,'P6.C3-fixtures-v1');
  assert.equal(fixtures.length,9);
  assert.equal(new Set(fixtures.map(item=>item.fixture_id)).size,fixtures.length);
  for(const id of [
    'book-fig43-equator-one-degree',
    'video-dNBxb-spreadsheet-chord',
    'video-dNBxb-australia-chord',
    'video-dNBxb-australia-north-south',
    'video-SuHnvvYEfok-ruler-triangle',
    'walter-pole-equator-default',
    'reference-equator-one-degree-wgs84-vs-walter',
    'raster-restored-outer-ring-fit',
    'raster-owner-8k-jgw',
  ]) assert.ok(fixtures.some(item=>item.fixture_id===id),id);
});

test('book and audited video fixtures reproduce their compatible native quantities', () => {
  const fixtures=gleasonCalibrationFixtures();
  const ids=[
    'book-fig43-equator-one-degree',
    'video-dNBxb-spreadsheet-chord',
    'video-dNBxb-australia-chord',
    'video-dNBxb-australia-north-south',
    'video-SuHnvvYEfok-ruler-triangle',
  ];
  for(const id of ids){
    const fixture=fixtures.find(item=>item.fixture_id===id);
    assert.ok(fixture,id);
    assert.equal(fixture.status,'ready');
    assert.ok(fixture.profile_prediction!==null);
    assert.ok(fixture.residual_absolute!==null);
    assert.ok(fixture.residual_absolute < 1e-8, `${id}: ${fixture.residual_absolute}`);
  }
});

test('Walter direct-SI fixture remains external comparative and reproduces 10008 km pole-to-equator', () => {
  const fixture=gleasonCalibrationFixtures().find(item=>item.fixture_id==='walter-pole-equator-default');
  assert.ok(fixture);
  assert.equal(fixture.source_class,'EXTERNAL_COMPARATIVE_MODEL');
  assert.equal(fixture.source_unit,'kilometre');
  assert.equal(fixture.source_distance,10008);
  assert.equal(fixture.profile_prediction,10008);
  assert.equal(fixture.residual_absolute,0);
});

test('WGS84 reference fixture preserves model identity and reports a descriptive Walter residual', () => {
  const fixture=gleasonCalibrationFixtures().find(item=>item.fixture_id==='reference-equator-one-degree-wgs84-vs-walter');
  assert.ok(fixture);
  assert.equal(fixture.source_class,'REFERENCE_SOURCE');
  assert.equal(fixture.source_unit,'metre');
  assert.equal(fixture.prediction_unit,'metre');
  assert.ok(fixture.source_distance > 111000 && fixture.source_distance < 112000);
  assert.ok(fixture.profile_prediction > 174000 && fixture.profile_prediction < 175000);
  assert.ok(fixture.residual_percent > 56 && fixture.residual_percent < 58);
});

test('restored raster is diagnostic-only while owner 8K/JGW remains fail-closed', () => {
  const fixtures=gleasonCalibrationFixtures();
  const restored=fixtures.find(item=>item.fixture_id==='raster-restored-outer-ring-fit');
  assert.ok(restored);
  assert.equal(restored.status,'diagnostic-only');
  assert.equal(restored.residual_kind,'radial-fit-rms');
  assert.ok(Math.abs(restored.residual_absolute-5.768749489287826)<1e-12);

  const owner8k=fixtures.find(item=>item.fixture_id==='raster-owner-8k-jgw');
  assert.ok(owner8k);
  assert.equal(owner8k.status,'gated');
  assert.equal(owner8k.gate_reason,'missing-true-companion-8k-raster');
  assert.equal(owner8k.profile_prediction,null);
  assert.equal(owner8k.residual_absolute,null);
});

test('research profile selection filters fixtures without rewriting their identities', () => {
  const walter=fixturesForResearchProfile('walter-flat-plane-eq-10008');
  assert.equal(walter.length,2);
  assert.ok(walter.every(item=>item.research_profile_id==='walter-flat-plane-eq-10008'));
  const raster=fixturesForResearchProfile('gleason-raster-calibrated');
  assert.equal(raster.length,1);
  assert.equal(raster[0].status,'gated');
});

test('local scale diagnostic keeps Figure 43 and Walter calculation spaces separate', () => {
  const equator=gleasonLocalScaleDiagnostic(0);
  assert.equal(equator.historical_fig43_miles_per_longitude_degree,60);
  assert.equal(equator.walter_radius_km,10008);
  assert.ok(equator.calculation_spaces.includes('GLEASON_HISTORICAL_LONGITUDE_SCALE'));
  assert.ok(equator.calculation_spaces.includes('WALTER_SI_FLAT_PLANE'));

  const south30=gleasonLocalScaleDiagnostic(-30);
  assert.equal(south30.historical_fig43_miles_per_longitude_degree,80);
  assert.equal(south30.walter_radius_km,13344);
  assert.throws(()=>gleasonLocalScaleDiagnostic(91),RangeError);
});
