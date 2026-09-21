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

test('P6.6 method contracts keep all three measurement engines independent', () => {
  assert.equal(MEASUREMENT_METHOD_CONTRACTS.length, 3);
  const wgs = measurementMethodContract('wgs84-geodesic');
  const ae = measurementMethodContract('ae-projected-plane');
  const gleason = measurementMethodContract('gleason-native-normalized');

  assert.equal(wgs.status, 'implemented');
  assert.deepEqual(wgs.implementedQuantities, ['distance', 'perimeter', 'area']);
  assert.equal(ae.status, 'implemented');
  assert.deepEqual(ae.implementedQuantities, ['distance', 'perimeter', 'area']);
  assert.equal(gleason.status, 'implemented');
  assert.deepEqual(gleason.implementedQuantities, ['distance', 'perimeter', 'area']);

  assert.equal(wgs.linearUnit, 'metre');
  assert.equal(ae.linearUnit, 'metre');
  assert.notEqual(wgs.calculationSpace, ae.calculationSpace);
  assert.notEqual(wgs.scaleBasis, ae.scaleBasis);
  assert.equal(gleason.linearUnit, 'normalized-radius-unit');
  assert.equal(gleason.areaUnit, 'normalized-radius-unit-squared');
  assert.equal(gleason.semanticType, 'COMPUTED_RESULT');
  assert.ok(gleason.limitations.some(item => item.includes('No metres/kilometres')));
});

test('P6.6 computation identity exposes distance, perimeter and area as implemented', () => {
  const wgsDistance = measurementComputationIdentity('wgs84-geodesic', 'distance');
  const aeDistance = measurementComputationIdentity('ae-projected-plane', 'distance');
  const gleasonDistance = measurementComputationIdentity('gleason-native-normalized', 'distance');
  const gleasonPerimeter = measurementComputationIdentity('gleason-native-normalized', 'perimeter');
  const gleasonArea = measurementComputationIdentity('gleason-native-normalized', 'area');

  assert.deepEqual(
    [wgsDistance.methodId, wgsDistance.calculationModel, wgsDistance.unit, wgsDistance.scaleBasis],
    ['wgs84-geodesic', 'wgs84', 'metre', 'wgs84-ellipsoid'],
  );
  assert.equal(wgsDistance.implementationStatus, 'implemented');
  assert.equal(aeDistance.implementationStatus, 'implemented');
  assert.deepEqual(
    [gleasonDistance.methodId, gleasonDistance.calculationModel, gleasonDistance.unit, gleasonDistance.scaleBasis],
    ['gleason-native-normalized', 'gleason', 'normalized-radius-unit', 'gleason-normalized-model-radius'],
  );
  assert.equal(gleasonDistance.semanticType, 'COMPUTED_RESULT');
  assert.equal(gleasonDistance.implementationStatus, 'implemented');
  assert.equal(gleasonPerimeter.implementationStatus, 'implemented');
  assert.equal(gleasonArea.implementationStatus, 'implemented');
  assert.equal('value' in gleasonDistance, false);
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

test('P6.3–P6.6 measurement engines do not accidentally enable route-provider service', () => {
  const route = futureServiceContract('route');
  assert.equal(route.status, 'unavailable');
  assert.deepEqual(route.availableOperations, []);
  assert.match(route.currentBoundary, /P6\.3/);
  assert.match(route.currentBoundary, /P6\.4/);
  assert.match(route.currentBoundary, /P6\.5/);
  assert.match(route.currentBoundary, /P6\.6/);
  assert.match(route.currentBoundary, /provider-backed road\/flight paths/);
});
