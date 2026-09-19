import { getLocalValue, setLocalValue } from './indexedDb';
import { activeIndexes } from './searchIndex';
import { loadSearchPackState } from './searchPackStore';
import { offlineResult } from '../search/placeSelection';
import {
  decodePhase5State,
  encodePhase5State,
  restoreDecodedPhase5State,
  type PersistedPlaceLocator,
  type PersistedRestoreResult,
} from '../comparison/persistedSelection';
import type { GeographicSelection } from '../comparison/geographicSelection';

export const PHASE5_STATE_STORAGE_KEY = 'phase5-shared-selection-v1';

function findInstalledPlace(locator: Readonly<PersistedPlaceLocator>) {
  return loadSearchPackState().then(state=>{
    for(const index of activeIndexes(state)){
      const match=index.entries.find(entry=>
        entry.id===locator.id
        && entry.sourceId===locator.sourceId
        && entry.sourceRecordId===locator.sourceRecordId
        && (locator.sourceVersion===null || entry.source?.version===locator.sourceVersion)
      );
      if(match) return offlineResult(match);
    }
    return null;
  });
}

export async function savePhase5Selection(selection: GeographicSelection | null): Promise<void> {
  await setLocalValue(PHASE5_STATE_STORAGE_KEY,encodePhase5State(selection));
}

export async function loadPhase5Selection(): Promise<PersistedRestoreResult> {
  const raw=await getLocalValue<unknown>(PHASE5_STATE_STORAGE_KEY);
  if(raw===undefined) return {status:'empty',selection:null};
  const decoded=decodePhase5State(raw);
  if(decoded.status!=='valid') return restoreDecodedPhase5State(decoded,()=>null);
  if(decoded.state.selection?.kind!=='place') return restoreDecodedPhase5State(decoded,()=>null);
  const place=await findInstalledPlace(decoded.state.selection.locator);
  return restoreDecodedPhase5State(decoded,()=>place);
}
