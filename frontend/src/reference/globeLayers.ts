import { getLocalValue, setLocalValue } from '../offline/indexedDb';
import { activeIndexes, type OfflinePlace, type PlaceCategory } from '../offline/searchIndex';
import { loadSearchPackState } from '../offline/searchPackStore';

export type GlobeLayerId = 'countries' | 'oceans' | 'seas' | 'rivers' | 'cities' | 'airports' | 'labels';
export type GlobeLayerVisibility = Record<GlobeLayerId, boolean>;

const SETTINGS_KEY = 'phase4-wgs84-globe-layers-v1';

export const DEFAULT_GLOBE_LAYERS: GlobeLayerVisibility = {
  countries: true,
  oceans: true,
  seas: true,
  rivers: true,
  cities: true,
  airports: false,
  labels: true,
};

const CATEGORY_TO_LAYER: Partial<Record<PlaceCategory, GlobeLayerId>> = {
  country: 'countries',
  ocean: 'oceans',
  sea: 'seas',
  river: 'rivers',
  city: 'cities',
  airport: 'airports',
};

export async function loadGlobeLayerVisibility(): Promise<GlobeLayerVisibility> {
  const stored = await getLocalValue<Partial<GlobeLayerVisibility>>(SETTINGS_KEY);
  return { ...DEFAULT_GLOBE_LAYERS, ...(stored ?? {}) };
}

export async function saveGlobeLayerVisibility(value: GlobeLayerVisibility): Promise<void> {
  await setLocalValue(SETTINGS_KEY, value);
}

export function filterPlacesForGlobe(entries: readonly OfflinePlace[], layers: GlobeLayerVisibility): OfflinePlace[] {
  return entries.filter((entry) => {
    const layer = CATEGORY_TO_LAYER[entry.category];
    return Boolean(layer && layers[layer]);
  });
}

export async function loadGlobePlaces(layers: GlobeLayerVisibility): Promise<OfflinePlace[]> {
  const state = await loadSearchPackState();
  const deduped = new Map<string, OfflinePlace>();
  for (const index of activeIndexes(state)) {
    for (const entry of filterPlacesForGlobe(index.entries, layers)) deduped.set(entry.id, entry);
  }
  return [...deduped.values()];
}
