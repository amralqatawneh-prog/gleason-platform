import { getLocalValue, setLocalValue } from '../offline/indexedDb';
import { loadSearchPackState } from '../offline/searchPackStore';
import { encodePhase5State, PHASE5_STATE_STORAGE_KEY, restorePhase5State, type Phase5RestoreResult } from './statePersistence';
import type { GeographicSelection } from './geographicSelection';

export async function loadPhase5State():Promise<Readonly<Phase5RestoreResult>> {
  const [stored,packs]=await Promise.all([
    getLocalValue<unknown>(PHASE5_STATE_STORAGE_KEY),
    loadSearchPackState(),
  ]);
  return restorePhase5State(stored,packs);
}

export async function savePhase5State(selection:GeographicSelection|null):Promise<void> {
  await setLocalValue(PHASE5_STATE_STORAGE_KEY,encodePhase5State(selection));
}
