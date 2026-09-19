import type { LaboratoryEntry, LaboratoryModelKey } from './modelLaboratory.js';

export type QuantityMeaning = 'planar-position' | 'ecef-position';
export type QuantityUnit = 'normalized-radius' | 'metre';
export type ScaleBasis = 'normalized-model-radius' | 'si-metre';
export type ComparabilityStatus = 'comparable' | 'not-comparable' | 'unavailable';
export type ComparabilityReasonCode =
  | 'missing-output'
  | 'different-meaning'
  | 'different-coordinate-space'
  | 'different-units'
  | 'undefined-cross-model-scale';

export interface QuantityDescriptor {
  readonly key: LaboratoryModelKey;
  readonly modelId: string;
  readonly modelVersion: string;
  readonly meaning: QuantityMeaning;
  readonly dimensions: 2 | 3;
  readonly coordinateSpace: string;
  readonly units: QuantityUnit;
  readonly scaleBasis: ScaleBasis;
  readonly available: boolean;
  readonly unavailableReason: string | null;
}

export interface ComparabilityDecision {
  readonly left: QuantityDescriptor;
  readonly right: QuantityDescriptor;
  readonly status: ComparabilityStatus;
  readonly reasons: readonly ComparabilityReasonCode[];
  readonly comparisonUnit: QuantityUnit | null;
  readonly conversionApplied: false;
}

export class IncomparableQuantityError extends Error {
  constructor(readonly decision: ComparabilityDecision) {
    super(`Quantities are ${decision.status}: ${decision.reasons.join(', ') || 'no direct comparison'}`);
    this.name = 'IncomparableQuantityError';
  }
}

export function describeLaboratoryEntry(entry: LaboratoryEntry): Readonly<QuantityDescriptor> {
  const meaning: QuantityMeaning = entry.key === 'wgs84' ? 'ecef-position' : 'planar-position';
  const dimensions: 2 | 3 = meaning === 'ecef-position' ? 3 : 2;
  return Object.freeze({
    key: entry.key,
    modelId: entry.metadata.modelId,
    modelVersion: entry.metadata.modelVersion,
    meaning,
    dimensions,
    coordinateSpace: `${entry.metadata.modelId}@${entry.metadata.modelVersion}:${meaning}`,
    units: entry.metadata.units,
    scaleBasis: entry.metadata.units === 'normalized-radius' ? 'normalized-model-radius' : 'si-metre',
    available: entry.status === 'available',
    unavailableReason: entry.status === 'available' ? null : entry.reason,
  });
}

export function evaluateComparability(
  left: QuantityDescriptor,
  right: QuantityDescriptor,
): Readonly<ComparabilityDecision> {
  const reasons: ComparabilityReasonCode[] = [];
  if (!left.available || !right.available) reasons.push('missing-output');
  if (left.meaning !== right.meaning || left.dimensions !== right.dimensions) reasons.push('different-meaning');
  if (left.coordinateSpace !== right.coordinateSpace) reasons.push('different-coordinate-space');
  if (left.units !== right.units) reasons.push('different-units');
  if (
    left.coordinateSpace !== right.coordinateSpace
    && (left.scaleBasis === 'normalized-model-radius' || right.scaleBasis === 'normalized-model-radius')
  ) reasons.push('undefined-cross-model-scale');

  const structuralReasons = reasons.filter(reason => reason !== 'missing-output');
  const status: ComparabilityStatus = structuralReasons.length > 0
    ? 'not-comparable'
    : reasons.includes('missing-output')
      ? 'unavailable'
      : 'comparable';

  return Object.freeze({
    left,
    right,
    status,
    reasons: Object.freeze(reasons),
    comparisonUnit: status === 'comparable' ? left.units : null,
    conversionApplied: false as const,
  });
}

export function laboratoryComparability(entries: readonly LaboratoryEntry[]): readonly Readonly<ComparabilityDecision>[] {
  const descriptors = entries.map(describeLaboratoryEntry);
  const pairs: readonly [number, number][] = [[0, 1], [0, 2], [1, 2]];
  return Object.freeze(
    pairs
      .filter(([left, right]) => descriptors[left] !== undefined && descriptors[right] !== undefined)
      .map(([left, right]) => evaluateComparability(descriptors[left], descriptors[right])),
  );
}

export function requireComparable(decision: ComparabilityDecision): ComparabilityDecision {
  if (decision.status !== 'comparable') throw new IncomparableQuantityError(decision);
  return decision;
}
