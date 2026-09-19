import type { GeographicPosition } from '../geographicSelection.js';
import type { SourceReference } from '../../models/projectionTypes.js';

export interface AdapterMetadata {
  readonly modelId: string;
  readonly modelVersion: string;
  readonly units: 'normalized-radius' | 'metre';
  readonly semanticType: 'COMPUTED_RESULT' | 'REFERENCE_RESULT';
  readonly evidenceLevel: 'DERIVED' | 'REFERENCE';
  readonly heightPolicy: 'not-represented' | 'required-ellipsoidal-metres';
  readonly domain: string;
  readonly limitations: readonly string[];
  readonly evidence: readonly SourceReference[];
}
export interface CoordinateTag {
  readonly modelId: string;
  readonly modelVersion: string;
  readonly units: 'normalized-radius' | 'metre';
}
export interface PlaneCoordinate extends CoordinateTag {
  readonly kind: 'plane'; readonly x: number; readonly y: number;
}
export interface EcefCoordinate extends CoordinateTag {
  readonly kind: 'ecef'; readonly x: number; readonly y: number; readonly z: number;
}
export interface AdapterResult<T> {
  readonly value: T;
  readonly metadata: AdapterMetadata;
  readonly notes: readonly string[];
}
export interface ModelAdapter<C extends CoordinateTag> {
  readonly metadata: AdapterMetadata;
  forward(point: GeographicPosition): AdapterResult<C>;
  inverse(coordinate: C): AdapterResult<Readonly<GeographicPosition>>;
}
export class AdapterInputError extends RangeError {
  constructor(readonly code: 'invalid-coordinate' | 'wrong-contract' | 'outside-domain' | 'height-required', message: string) {
    super(message); this.name = 'AdapterInputError';
  }
}
export function validatePosition(p: GeographicPosition): void {
  if (!p || !Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)
    || Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180
    || (p.ellipsoidalHeightM !== undefined && !Number.isFinite(p.ellipsoidalHeightM))) {
    throw new AdapterInputError('invalid-coordinate', 'Expected geographic degrees in [-90,90]/[-180,180] and optional finite ellipsoidal metres');
  }
}
export function validateCoordinate(p: CoordinateTag, metadata: AdapterMetadata, kind: 'plane' | 'ecef'): void {
  const c = p as PlaneCoordinate | EcefCoordinate;
  if (!c || c.modelId !== metadata.modelId || c.modelVersion !== metadata.modelVersion
    || c.units !== metadata.units || c.kind !== kind) {
    throw new AdapterInputError('wrong-contract', 'Coordinate model, version, units and kind must match the adapter');
  }
  if (![c.x, c.y, ...(c.kind === 'ecef' ? [c.z] : [])].every(Number.isFinite)) {
    throw new AdapterInputError('invalid-coordinate', 'Model coordinates must be finite');
  }
}
export function result<T extends object>(value: T, metadata: AdapterMetadata, notes: string[] = []): AdapterResult<Readonly<T>> {
  return Object.freeze({ value: Object.freeze(value), metadata, notes: Object.freeze(notes) });
}
export function planarNotes(point: GeographicPosition): string[] {
  return point.ellipsoidalHeightM === undefined ? [] : ['Input ellipsoidal height is not represented by this 2D projection.'];
}
