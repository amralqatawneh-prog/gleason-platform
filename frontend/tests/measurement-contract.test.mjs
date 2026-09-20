import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFreePoint, selectPlace } from '../.phase1-test-build/comparison/geographicSelection.js';
import { offlineResult } from '../.phase1-test-build/search/placeSelection.js';
import {
  MEASUREMENT_CONTRACT_VERSION,
  MEASUREMENT_METHOD_CONTRACTS,
  MeasurementContractError,
  measurementComputationIdentity,
  measurementEndpointFromSelection,
  measurementMethodContract,
  measurementVisualizationIdentity,
} from '../.phase1-test-build/measurement/contracts.js';
import { futureServiceContract } from '../.phase1-test-build/comparison/futureServices.js';

const source = {
  sourceId: 'test',
  name: 'Test source',
  version: 'test-v1',
  license: 'TEST-ONLY',
  sourceUrl: 'https://example.invalid',
};
const place = (category = 'city') => offlineResult({
  id: `test:${category}`,
  category,
  name: `Test ${category}`,
  nameAr: 'مكان اختباري',
  countryCode: 'QA',
  latitude: 25,
  longitude: 51,
  sourceId: 'test',
  sourceRecordId: category,
  coordinateClassification: 'TEST_ONLY_SYNTHETIC_POINT',
  source,
});

test('P6.1 endpoint contract preserves explicit geography and place provenance only', () => {
  const selection = selectPlace(place('city'));
  const endpoint = measurementEndpointFromSelection('A', selection);
  assert.equal(endpoint.schemaVersion, MEASUREMENT_CONTRACT_VERSION);
  assert.equal(endpoint.endpointId, 'A');
  assert.equal(endpoint.referenceFrame, 'WGS84');
  assert.equal(endpoint.angularUnits, 'degrees');
  assert.deepEqual(endpoint.point, { latitude: 25, longitude: 51 });
  assert.equal(endpoint.selectionKind, 'place');
  assert.equal(endpoint.place.id, 'test:city');
  assert.equal(endpoint.place.sourceVersion, 'test-v1');
  assert.equal('x' in endpoint.point, false);
  assert.equal('y' in endpoint.point, false);
  assert.throws(() => { endpoint.point.latitude = 0; }, TypeError);
  assert.throws(() => { endpoint.place.name = 'changed'; }, TypeError);
});

test('P6.1 free endpoint stays a free geographic point and does not invent identity or height', () => {
  const endpoint = measurementEndpointFromSelection(
    'free-1',
    selectFreePoint('gleason', { latitude: -12, longitude: 179.9, x: 100, y: 200 }),
  );
  assert.equal(endpoint.selectionKind, 'free-point');
  assert.equal(endpoint.sourceModel, 'gleason');
  assert.equal(endpoint.place, null);
  assert.deepEqual(endpoint.point, { latitude: -12, longitude: 179.9 });
  assert.equal('ellipsoidalHeightM' in endpoint.point, false);
});

test('P6.1 rejects a country record as an implicit point-to-point endpoint', () => {
  assert.throws(
    () => measurementEndpointFromSelection('country-a', selectPlace(place('country'))),
    error => error instanceof MeasurementContractError && error.code === 'ambiguous-country-endpoint',
  );
});

test('P6.1 method contracts keep model, method, space, units and scale basis independent', () => {
  assert.equal(MEASUREMENT_METHOD_CONTRACTS.length, 3);
  const wgs = measurementMethodContract('wgs84-geodesic');
  const ae = measurementMethodContract('ae-projected-plane');
  const gleason = measurementMethodContract('gleason-native-normalized');

  assert.equal(wgs.status, 'partially-implemented');
  assert.deepEqual(wgs.implementedQuantities, ['distance']);
  assert.equal(ae.status, 'contract-only');
  assert.deepEqual(ae.implementedQuantities, []);
  assert.equal(gleason.status, 'contract-only');
  assert.deepEqual(gleason.implementedQuantities, []);

  assert.equal(wgs.linearUnit, 'metre');
  assert.equal(ae.linearUnit, 'metre');
  assert.notEqual(wgs.calculationSpace, ae.calculationSpace);
  assert.notEqual(wgs.scaleBasis, ae.scaleBasis);
  assert.equal(gleason.linearUnit, 'normalized-radius-unit');
  assert.equal(gleason.areaUnit, 'normalized-radius-unit-squared');
  assert.ok(gleason.limitations.some(item => item.includes('No metres/kilometres')));
});

test('P6.1 computation identity contains semantics but no fabricated numeric result', () => {
  const distance = measurementComputationIdentity('wgs84-geodesic', 'distance');
  const area = measurementComputationIdentity('gleason-native-normalized', 'area');

  assert.deepEqual(
    [distance.methodId, distance.calculationModel, distance.unit, distance.scaleBasis],
    ['wgs84-geodesic', 'wgs84', 'metre', 'wgs84-ellipsoid'],
  );
  assert.deepEqual(
    [area.methodId, area.calculationModel, area.unit, area.scaleBasis],
    ['gleason-native-normalized', 'gleason', 'normalized-radius-unit-squared', 'gleason-normalized-model-radius'],
  );
  const perimeter = measurementComputationIdentity('wgs84-geodesic', 'perimeter');
  const wgsArea = measurementComputationIdentity('wgs84-geodesic', 'area');
  assert.equal('value' in distance, false);
  assert.equal(distance.implementationStatus, 'implemented');
  assert.equal(perimeter.implementationStatus, 'contract-only');
  assert.equal(wgsArea.implementationStatus, 'contract-only');
});

test('P6.1 rendering on another model preserves the original computation identity', () => {
  const computation = measurementComputationIdentity('wgs84-geodesic', 'distance');
  const rendered = measurementVisualizationIdentity(computation, 'gleason');
  assert.equal(rendered.renderedOnModel, 'gleason');
  assert.equal(rendered.computation, computation);
  assert.equal(rendered.computation.methodId, 'wgs84-geodesic');
  assert.equal(rendered.computation.calculationModel, 'wgs84');
  assert.equal(rendered.computation.unit, 'metre');
  assert.equal(rendered.interpretationRule, 'preserve-computation-identity');
});

test('P6.3 WGS84 measurement does not accidentally enable the future route-provider service', () => {
  const route = futureServiceContract('route');
  assert.equal(route.status, 'unavailable');
  assert.deepEqual(route.availableOperations, []);
  assert.match(route.currentBoundary, /P6\.3/);
  assert.match(route.currentBoundary, /route drawing\/provider paths/);
});
