import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHAPTER17_6075FT_METRES_PER_MILE,
  CHAPTER19_6070FT_METRES_PER_MILE,
  FIG37_RATIO_METRES_PER_MILE,
  INTERNATIONAL_NAUTICAL_MILE_METRES,
  localGleasonSiRouteDistance,
} from '../.phase1-test-build/measurement/gleasonSiMeasurement.js';

const point = (point_id, latitude, longitude) => ({ point_id, latitude, longitude });

test('P6.C2 Walter profile produces direct SI from normalized Gleason geometry', () => {
  const result=localGleasonSiRouteDistance([
    point('A',90,0),
    point('B',0,0),
  ]);
  const walter=result.output.profiles.find(profile=>profile.profile_id==='walter-flat-plane-eq-10008');
  assert.ok(walter);
  assert.equal(walter.conversion_status,'direct-si');
  assert.equal(walter.evidence_level,'EXTERNAL_COMPARATIVE');
  assert.equal(walter.calculation_space,'WALTER_SI_FLAT_PLANE');
  assert.equal(walter.assumption_id,null);
  assert.equal(walter.native_distance_value,0.5);
  assert.equal(walter.distance_km,10008);
  assert.equal(walter.distance_m,10_008_000);
  assert.equal(walter.distance_nmi,10_008_000/INTERNATIONAL_NAUTICAL_MILE_METRES);
});

test('P6.C2 exposes historical Figure43 SI only as explicit assumption profiles', () => {
  const result=localGleasonSiRouteDistance([
    point('A',0,0),
    point('B',0,90),
  ]);
  const chapter17=result.output.profiles.find(profile=>profile.profile_id==='fig43-circle-ch17-6075ft-assumption');
  const fig37=result.output.profiles.find(profile=>profile.profile_id==='fig43-circle-fig37-ratio-assumption');
  const chapter19=result.output.profiles.find(profile=>profile.profile_id==='fig43-circle-ch19-6070ft-assumption');
  assert.ok(chapter17 && fig37 && chapter19);
  for (const profile of [chapter17,fig37,chapter19]) {
    assert.equal(profile.conversion_status,'assumption-profile');
    assert.equal(profile.evidence_level,'ASSUMPTION_PROFILE');
    assert.equal(profile.calculation_space,'GLEASON_DERIVED_NORMALIZED_PLANE');
    assert.ok(profile.assumption_id);
    assert.equal(profile.source_profile_id,'gleason-fig43-circle-derived-diagnostic');
  }
  assert.ok(Math.abs(CHAPTER17_6075FT_METRES_PER_MILE-1851.66)<1e-9);
  assert.ok(Math.abs(FIG37_RATIO_METRES_PER_MILE-1859.6864)<1e-9);
  assert.ok(Math.abs(CHAPTER19_6070FT_METRES_PER_MILE-1850.136)<1e-9);
  assert.notEqual(chapter17.distance_m,fig37.distance_m);
  assert.notEqual(chapter17.distance_m,chapter19.distance_m);
});

test('P6.C2 legacy 60-NM SI result remains an explicit assumption', () => {
  const result=localGleasonSiRouteDistance([
    point('A',90,0),
    point('B',0,0),
  ]);
  const legacy=result.output.profiles.find(profile=>profile.profile_id==='legacy-radial60-intl-nm-assumption');
  assert.ok(legacy);
  assert.equal(legacy.conversion_status,'assumption-profile');
  assert.equal(legacy.source_profile_id,'gleason-radial-60nm-legacy');
  assert.equal(legacy.calculation_space,'GLEASON_LEGACY_COMPARISON');
  assert.equal(legacy.assumption_id,'legacy-radial60-intl-nm-assumption');
  assert.equal(legacy.native_distance_value,5400);
  assert.equal(legacy.distance_m,5400*1852);
});

test('P6.C2 keeps unresolved and calibration-gated source profiles unavailable', () => {
  const result=localGleasonSiRouteDistance([
    point('A',25,50),
    point('B',30,40),
  ]);
  assert.deepEqual(result.output.unavailable_profile_ids,[
    'gleason-book-historical',
    'gleason-video-ruler-calibrated',
    'gleason-raster-calibrated',
    'gleason-fig43-circle-derived-diagnostic',
  ]);
  assert.equal(result.output.profiles.some(profile=>profile.profile_id==='gleason-book-historical'),false);
});

test('P6.C2 per-segment SI totals add to route totals and reverse is invariant', () => {
  const points=[
    point('A',25.285447,51.53104),
    point('B',31.9539,35.9106),
    point('C',40,10),
  ];
  const forward=localGleasonSiRouteDistance(points);
  const reverse=localGleasonSiRouteDistance([...points].reverse());
  for (const profile of forward.output.profiles) {
    const sum=profile.segments.reduce((total,segment)=>total+segment.distance_m,0);
    assert.ok(Math.abs(sum-profile.distance_m)<1e-6);
    const other=reverse.output.profiles.find(candidate=>candidate.profile_id===profile.profile_id);
    assert.ok(other);
    assert.ok(Math.abs(other.distance_m-profile.distance_m)<1e-6);
  }
});

test('P6.C2 provenance forbids hidden WGS84 normalization or historical relabeling', () => {
  const result=localGleasonSiRouteDistance([
    point('A',0,179),
    point('B',0,-179),
  ]);
  assert.equal(result.provenance.provider_id,'gleason-si-profiles');
  assert.equal(result.provenance.provider_version,'P6.C2-1');
  assert.ok(result.provenance.notes.some(note=>note.includes('unresolved gleason-book-historical')));
  assert.ok(result.provenance.notes.some(note=>note.includes('Walter output remains an external comparative model')));
});
