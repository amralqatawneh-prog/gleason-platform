export const FUTURE_SERVICE_CONTRACT_VERSION = 1 as const;

export type FutureServiceKind = 'time' | 'layer-sync' | 'route';
export type FutureServiceStatus = 'unavailable';

export interface FutureServiceContract {
  readonly kind: FutureServiceKind;
  readonly contractVersion: typeof FUTURE_SERVICE_CONTRACT_VERSION;
  readonly status: FutureServiceStatus;
  readonly plannedPhase: string;
  readonly currentBoundary: string;
  readonly availableOperations: readonly never[];
}

export class FutureServiceUnavailableError extends Error {
  constructor(readonly contract: FutureServiceContract) {
    super(`${contract.kind} service is unavailable in Phase 5: ${contract.currentBoundary}`);
    this.name='FutureServiceUnavailableError';
  }
}

export const FUTURE_SERVICE_CONTRACTS: readonly Readonly<FutureServiceContract>[] = Object.freeze([
  Object.freeze({
    kind:'time',
    contractVersion:FUTURE_SERVICE_CONTRACT_VERSION,
    status:'unavailable',
    plannedPhase:'9–10',
    currentBoundary:'P5.7 reserves the comparison contract only; no astronomy/time engine or timeline is implemented.',
    availableOperations:Object.freeze([]),
  }),
  Object.freeze({
    kind:'layer-sync',
    contractVersion:FUTURE_SERVICE_CONTRACT_VERSION,
    status:'unavailable',
    plannedPhase:'16',
    currentBoundary:'Existing view-local layers remain available, but a shared cross-model layer-state service is not implemented.',
    availableOperations:Object.freeze([]),
  }),
  Object.freeze({
    kind:'route',
    contractVersion:FUTURE_SERVICE_CONTRACT_VERSION,
    status:'unavailable',
    plannedPhase:'6',
    currentBoundary:'P5.7 reserves a versioned route-service boundary only; route drawing, path semantics, distance, ruler and area engines are not implemented here.',
    availableOperations:Object.freeze([]),
  }),
]);

export function futureServiceContract(kind:FutureServiceKind): Readonly<FutureServiceContract> {
  const contract=FUTURE_SERVICE_CONTRACTS.find(item=>item.kind===kind);
  if(!contract) throw new Error(`Unknown future service: ${kind}`);
  return contract;
}

export function requireFutureServiceAvailable(kind:FutureServiceKind): never {
  throw new FutureServiceUnavailableError(futureServiceContract(kind));
}
