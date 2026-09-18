import { getLocalValue, updateLocalValue } from './indexedDb';
import {
  activeIndexes,
  installRegionPack,
  searchOffline,
  validateOfflineSearchIndex,
  type InstalledSearchPacks,
  type OfflinePlace,
  type OfflineSearchIndex,
  type PlaceCategory,
} from './searchIndex';

const STORAGE_KEY = 'phase3-search-packs-v1';
export const SEARCH_PACKS_CHANGED = 'gleason-search-packs-changed';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export async function loadSearchPackState(): Promise<InstalledSearchPacks> {
  const stored = await getLocalValue<InstalledSearchPacks>(STORAGE_KEY);
  return sanitizeState(stored);
}

function sanitizeState(stored: InstalledSearchPacks | undefined): InstalledSearchPacks {
  return { core: validateOfflineSearchIndex(stored?.core) ? stored.core : undefined,
    regions: Object.fromEntries(Object.entries(stored?.regions ?? {}).filter(([, pack]) => validateOfflineSearchIndex(pack))) };
}

async function changeSearchPacks(update: (current: InstalledSearchPacks) => InstalledSearchPacks): Promise<void> {
  await updateLocalValue<InstalledSearchPacks>(STORAGE_KEY, current => update(sanitizeState(current)));
  window.dispatchEvent(new Event(SEARCH_PACKS_CHANGED));
}

async function fetchPack(path: string): Promise<OfflineSearchIndex> {
  const response = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`offline pack fetch failed: ${response.status}`);
  const payload: unknown = await response.json();
  if (!validateOfflineSearchIndex(payload)) throw new Error('invalid offline search pack');
  return payload;
}

export async function refreshCoreSearchPack(): Promise<OfflineSearchIndex> {
  const core = await fetchPack('/offline-search/core');
  await changeSearchPacks(state => ({ ...state, core }));
  return core;
}

export async function installCountrySearchPack(countryCode: string): Promise<OfflineSearchIndex> {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) throw new Error('country code must be two letters');
  const pack = await fetchPack(`/offline-search/country/${encodeURIComponent(code)}`);
  await changeSearchPacks(state => installRegionPack(state, pack));
  return pack;
}

export async function searchCachedPlaces(
  query: string,
  category?: PlaceCategory,
): Promise<OfflinePlace[]> {
  const state = await loadSearchPackState();
  return searchOffline(activeIndexes(state), query, {
    categories: category ? [category] : undefined,
    limit: 20,
  });
}
