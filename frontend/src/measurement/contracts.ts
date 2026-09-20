import type { GeographicSelection, SelectionModel } from '../comparison/geographicSelection.js';

export const MEASUREMENT_CONTRACT_VERSION = 1 as const;

export type MeasurementQuantity = 'distance' | 'perimeter' | 'area';
export type MeasurementMethodId =
  | 'wgs84-geodesic'
  | 'ae-projected-plane'
  | 'gleason-native-normalized';
export type MeasurementUnit =
  | 'metre'
  | 'square-metre'
  | 'normalized-radius-unit'
  | 'normalized-radius-unit-squared';
export type MeasurementScaleBasis =
  | 'wgs84-ellipsoid'
  | 'ae-projected-plane-si-metre'
  | 'gleason-normalized-model-radius';
export type MeasurementSemanticType = 'REFERENCE_RESULT' | 'COMPUTED_RESULT';
export type MeasurementMethodStatus = 'contract-only' | 'partially-implemented';
export type MeasurementImplementationStatus = 'contract-only' | 'implemented';

export interface MeasurementEndpoint {
  readonly schemaVersion: typeof MEASUREMENT_CONTRACT_VERSION;
  readonly endpointId: string;
  readonly referenceFrame: 'WGS84';
  readonly angularUnits: 'degrees';
  readonly point: GeographicSelection['point'];
  readonly selectionKind: GeographicSelection['kind'];
  readonly sourceModel: SelectionModel;
  readonly place: GeographicSelection['place'];
}

export interface MeasurementMethodContract {
  readonly contractVersion: typeof MEASUREMENT_CONTRACT_VERSION;
  readonly methodId: MeasurementMethodId;
  readonly calculationModel: SelectionModel;
  readonly calculationSpace: string;
  readonly semanticType: MeasurementSemanticType;
  readonly status: MeasurementMethodStatus;
  readonly supportedQuantities: readonly MeasurementQuantity[];
  readonly implementedQuantities: readonly MeasurementQuantity[];
  readonly linearUnit: MeasurementUnit;
  readonly areaUnit: MeasurementUnit;
  readonly scaleBasis: MeasurementScaleBasis;
  readonly provenance: string;
  readonly limitations: readonly string[];
}

export interface MeasurementComputationIdentity {
  readonly contractVersion: typeof MEASUREMENT_CONTRACT_VERSION;
  readonly methodId: MeasurementMethodId;
  readonly calculationModel: SelectionModel;
  readonly calculationSpace: string;
  readonly semanticType: MeasurementSemanticType;
  readonly quantity: MeasurementQuantity;
  readonly unit: MeasurementUnit;
  readonly scaleBasis: MeasurementScaleBasis;
  readonly implementationStatus: MeasurementImplementationStatus;
}

export interface MeasurementVisualizationIdentity {
  readonly computation: MeasurementComputationIdentity;
  readonly renderedOnModel: SelectionModel;
  readonly interpretationRule: 'preserve-computation-identity';
}

export class MeasurementContractError extends RangeError {
  constructor(
    readonly code:
      | 'invalid-endpoint-id'
      | 'invalid-coordinate'
      | 'ambiguous-country-endpoint'
      | 'unsupported-quantity',
    message: string,
  ) {
    super(message);
    this.name = 'MeasurementContractError';
  }
}

function freezePoint(point: GeographicSelection['point']): GeographicSelection['point'] {
  if (!Number.isFinite(point.latitude) || Math.abs(point.latitude) > 90
    || !Number.isFinite(point.longitude) || Math.abs(point.longitude) > 180
    || (point.ellipsoidalHeightM !== undefined && !Number.isFinite(point.ellipsoidalHeightM))) {
    throw new MeasurementContractError(
      'invalid-coordinate',
      'Measurement endpoints require explicit WGS84 geographic degrees and optional finite ellipsoidal height.',
    );
  }
  return Object.freeze({
    latitude: point.latitude,
    longitude: point.longitude,
    ...(point.ellipsoidalHeightM === undefined ? {} : { ellipsoidalHeightM: point.ellipsoidalHeightM }),
  });
}

/**
 * Converts an already-explicit canonical selection into a measurement endpoint.
 * A country record alone is deliberately rejected: boundary/centroid semantics
 * must be selected explicitly in a later operation rather than guessed here.
 */
export function measurementEndpointFromSelection(
  endpointId: string,
  selection: GeographicSelection,
): Readonly<MeasurementEndpoint> {
  if (!endpointId.trim()) {
    throw new MeasurementContractError('invalid-endpoint-id', 'Measurement endpoint id must be non-empty.');
  }
  if (selection.kind === 'place' && selection.place.category === 'country') {
    throw new MeasurementContractError(
      'ambiguous-country-endpoint',
      'A country place record is not a unique distance endpoint; choose an explicit point or a future boundary operation.',
    );
  }
  return Object.freeze({
    schemaVersion: MEASUREMENT_CONTRACT_VERSION,
    endpointId,
    referenceFrame: 'WGS84',
    angularUnits: 'degrees',
    point: freezePoint(selection.point),
    selectionKind: selection.kind,
    sourceModel: selection.model,
    place: selection.place === null ? null : Object.freeze({ ...selection.place }),
  });
}

export const MEASUREMENT_METHOD_CONTRACTS: readonly Readonly<MeasurementMethodContract>[] = Object.freeze([
  Object.freeze({
    contractVersion: MEASUREMENT_CONTRACT_VERSION,
    methodId: 'wgs84-geodesic',
    calculationModel: 'wgs84',
    calculationSpace: 'WGS84 ellipsoidal geodesic/reference geometry',
    semanticType: 'REFERENCE_RESULT',
    status: 'partially-implemented',
    supportedQuantities: Object.freeze(['distance', 'perimeter', 'area'] as const),
    implementedQuantities: Object.freeze(['distance'] as const),
    linearUnit: 'metre',
    areaUnit: 'square-metre',
    scaleBasis: 'wgs84-ellipsoid',
    provenance: 'P6.3 binds distance to backend pyproj/PROJ and an independent offline geographiclib-geodesic implementation with parity gates.',
    limitations: Object.freeze([
      'P6.3 implements distance for an ordered open polyline only; WGS84 polygon perimeter/area remains P6.6.',
      'A WGS84 geodesic keeps this method identity when visualized on AE or Gleason.',
      'Road/flight routing is not implied by geodesic distance.',
    ]),
  }),
  Object.freeze({
    contractVersion: MEASUREMENT_CONTRACT_VERSION,
    methodId: 'ae-projected-plane',
    calculationModel: 'ae',
    calculationSpace: 'independent Azimuthal Equidistant projected plane',
    semanticType: 'REFERENCE_RESULT',
    status: 'partially-implemented',
    supportedQuantities: Object.freeze(['distance', 'perimeter', 'area'] as const),
    implementedQuantities: Object.freeze(['distance'] as const),
    linearUnit: 'metre',
    areaUnit: 'square-metre',
    scaleBasis: 'ae-projected-plane-si-metre',
    provenance: 'P6.4 binds distance to the existing independent north-polar AE projection using backend pyproj/PROJ and browser proj4 implementations.',
    limitations: Object.freeze([
      'Projected-plane metres are not automatically WGS84 geodesic distance even though both use SI metres.',
      'Azimuthal Equidistant preserves radial distance from the north-pole center, not every arbitrary pairwise surface distance.',
      'P6.4 implements adjacent straight projected segments and open-polyline distance only; polygon perimeter/area remains P6.6.',
    ]),
  }),
  Object.freeze({
    contractVersion: MEASUREMENT_CONTRACT_VERSION,
    methodId: 'gleason-native-normalized',
    calculationModel: 'gleason',
    calculationSpace: 'Gleason derived normalized-radius plane',
    semanticType: 'COMPUTED_RESULT',
    status: 'contract-only',
    supportedQuantities: Object.freeze(['distance', 'perimeter', 'area'] as const),
    implementedQuantities: Object.freeze([] as const),
    linearUnit: 'normalized-radius-unit',
    areaUnit: 'normalized-radius-unit-squared',
    scaleBasis: 'gleason-normalized-model-radius',
    provenance: 'Project DERIVED Gleason reconstruction grounded in the registered historical source record.',
    limitations: Object.freeze([
      'No metres/kilometres or square SI conversion exists without a documented scale basis or explicitly labeled assumption.',
      'The modern normalized analytic reconstruction must not be attributed to the historical book as a printed formula.',
      'P6.1 defines semantics only; no native Gleason measurement engine is exposed yet.',
    ]),
  }),
]);

export function measurementMethodContract(methodId: MeasurementMethodId): Readonly<MeasurementMethodContract> {
  const contract = MEASUREMENT_METHOD_CONTRACTS.find(item => item.methodId === methodId);
  if (!contract) throw new RangeError(`Unknown measurement method: ${methodId}`);
  return contract;
}

export function measurementComputationIdentity(
  methodId: MeasurementMethodId,
  quantity: MeasurementQuantity,
): Readonly<MeasurementComputationIdentity> {
  const contract = measurementMethodContract(methodId);
  if (!contract.supportedQuantities.includes(quantity)) {
    throw new MeasurementContractError('unsupported-quantity', `${methodId} does not support ${quantity}`);
  }
  return Object.freeze({
    contractVersion: MEASUREMENT_CONTRACT_VERSION,
    methodId,
    calculationModel: contract.calculationModel,
    calculationSpace: contract.calculationSpace,
    semanticType: contract.semanticType,
    quantity,
    unit: quantity === 'area' ? contract.areaUnit : contract.linearUnit,
    scaleBasis: contract.scaleBasis,
    implementationStatus: contract.implementedQuantities.includes(quantity) ? 'implemented' : 'contract-only',
  });
}

/** Rendering never changes who calculated the quantity or what its units mean. */
export function measurementVisualizationIdentity(
  computation: MeasurementComputationIdentity,
  renderedOnModel: SelectionModel,
): Readonly<MeasurementVisualizationIdentity> {
  return Object.freeze({
    computation,
    renderedOnModel,
    interpretationRule: 'preserve-computation-identity',
  });
}
