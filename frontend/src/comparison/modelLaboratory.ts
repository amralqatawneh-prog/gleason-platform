import type { GeographicSelection } from './geographicSelection.js';
import { gleasonAdapter } from './adapters/gleasonAdapter.js';
import { aeAdapter } from './adapters/aeAdapter.js';
import { wgs84Adapter } from './adapters/wgs84Adapter.js';
import { AdapterInputError, type AdapterMetadata, type AdapterResult, type PlaneCoordinate, type EcefCoordinate } from './adapters/contract.js';

export type LaboratoryModelKey = 'gleason' | 'ae' | 'wgs84';
export interface LaboratoryValue { readonly label: 'X' | 'Y' | 'Z'; readonly value: number; }
export interface LaboratoryOutput { readonly kind: 'plane' | 'ecef'; readonly values: readonly LaboratoryValue[]; }
export interface LaboratoryEntry {
  readonly key: LaboratoryModelKey;
  readonly displayName: string;
  readonly status: 'available' | 'unavailable';
  readonly metadata: AdapterMetadata;
  readonly output: LaboratoryOutput | null;
  readonly notes: readonly string[];
  readonly errorCode: AdapterInputError['code'] | null;
  readonly reason: string | null;
}
type Coordinate = PlaneCoordinate | EcefCoordinate;

function inspect(key: LaboratoryModelKey, displayName: string, metadata: AdapterMetadata, execute: () => AdapterResult<Coordinate>): LaboratoryEntry {
  try {
    const result = execute();
    const coordinate = result.value;
    const values: LaboratoryValue[] = coordinate.kind === 'ecef'
      ? [{ label: 'X', value: coordinate.x }, { label: 'Y', value: coordinate.y }, { label: 'Z', value: coordinate.z }]
      : [{ label: 'X', value: coordinate.x }, { label: 'Y', value: coordinate.y }];
    return Object.freeze({
      key, displayName, status: 'available', metadata,
      output: Object.freeze({ kind: coordinate.kind, values: Object.freeze(values.map(value => Object.freeze(value))) }),
      notes: result.notes, errorCode: null, reason: null,
    });
  } catch (error) {
    if (!(error instanceof AdapterInputError)) throw error;
    return Object.freeze({
      key, displayName, status: 'unavailable', metadata, output: null,
      notes: Object.freeze([]), errorCode: error.code, reason: error.message,
    });
  }
}

/** P5.4 inspection only. No values are rescaled or compared here; comparability belongs to P5.5. */
export function inspectSelection(selection: GeographicSelection | null): readonly LaboratoryEntry[] {
  if (!selection) return Object.freeze([]);
  const point = selection.point;
  return Object.freeze([
    inspect('gleason', 'Gleason Historical', gleasonAdapter.metadata, () => gleasonAdapter.forward(point)),
    inspect('ae', 'Azimuthal Equidistant', aeAdapter.metadata, () => aeAdapter.forward(point)),
    inspect('wgs84', 'WGS84 Reference', wgs84Adapter.metadata, () => wgs84Adapter.forward(point)),
  ]);
}
