import type { LaboratoryEntry, LaboratoryValue } from './modelLaboratory.js';
import type { ComparabilityDecision, ComparabilityReasonCode, QuantityUnit } from './comparability.js';

export type DifferenceStatus = 'available' | 'blocked';
export type DifferenceBlockReason =
  | ComparabilityReasonCode
  | 'different-domain'
  | 'different-output-structure'
  | 'descriptor-entry-mismatch';

export interface ComponentDifference {
  readonly label: LaboratoryValue['label'];
  readonly left: number;
  readonly right: number;
  /** Signed delta: right - left. */
  readonly delta: number;
}

export interface HomogeneousDifference {
  readonly status: DifferenceStatus;
  readonly leftKey: string;
  readonly rightKey: string;
  readonly unit: QuantityUnit | null;
  readonly values: readonly ComponentDifference[];
  readonly reasons: readonly DifferenceBlockReason[];
  readonly conversionApplied: false;
}

function blocked(
  leftKey:string,
  rightKey:string,
  reasons:readonly DifferenceBlockReason[],
):Readonly<HomogeneousDifference> {
  return Object.freeze({
    status:'blocked',
    leftKey,
    rightKey,
    unit:null,
    values:Object.freeze([]),
    reasons:Object.freeze([...reasons]),
    conversionApplied:false as const,
  });
}

function outputLabels(entry: LaboratoryEntry): readonly LaboratoryValue['label'][] {
  return entry.output?.values.map(value => value.label) ?? [];
}

export function computeHomogeneousDifference(
  decision: ComparabilityDecision,
  left: LaboratoryEntry,
  right: LaboratoryEntry,
): Readonly<HomogeneousDifference> {
  if (decision.left.key !== left.key || decision.right.key !== right.key) {
    return blocked(left.key,right.key,['descriptor-entry-mismatch']);
  }
  if (decision.status !== 'comparable') {
    return blocked(left.key,right.key,decision.reasons);
  }
  if (!left.output || !right.output) {
    return blocked(left.key,right.key,['missing-output']);
  }
  if (left.metadata.domain !== right.metadata.domain) {
    return blocked(left.key,right.key,['different-domain']);
  }

  const leftLabels=outputLabels(left);
  const rightLabels=outputLabels(right);
  if (
    left.output.kind !== right.output.kind
    || leftLabels.length !== rightLabels.length
    || leftLabels.some((label,index)=>label!==rightLabels[index])
  ) {
    return blocked(left.key,right.key,['different-output-structure']);
  }

  const values=left.output.values.map((leftValue,index)=>{
    const rightValue=right.output!.values[index];
    return Object.freeze({
      label:leftValue.label,
      left:leftValue.value,
      right:rightValue.value,
      delta:rightValue.value-leftValue.value,
    });
  });

  return Object.freeze({
    status:'available',
    leftKey:left.key,
    rightKey:right.key,
    unit:decision.comparisonUnit,
    values:Object.freeze(values),
    reasons:Object.freeze([]),
    conversionApplied:false as const,
  });
}

export function laboratoryDifferences(
  entries: readonly LaboratoryEntry[],
  decisions: readonly Readonly<ComparabilityDecision>[],
): readonly Readonly<HomogeneousDifference>[] {
  const byKey=new Map(entries.map(entry=>[entry.key,entry] as const));
  return Object.freeze(decisions.map(decision=>{
    const left=byKey.get(decision.left.key);
    const right=byKey.get(decision.right.key);
    if(!left||!right) return blocked(decision.left.key,decision.right.key,['missing-output']);
    return computeHomogeneousDifference(decision,left,right);
  }));
}
