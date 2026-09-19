export type PlaceCategory = 'country' | 'city' | 'sea' | 'ocean' | 'river' | 'mountain' | 'airport';

export interface OfflinePlaceSource {
  sourceId: string;
  name: string;
  version: string | null;
  license: string;
  sourceUrl: string;
}

export interface OfflinePlace {
  id: string;
  category: PlaceCategory;
  name: string;
  nameAr?: string;
  aliases: string[];
  countryCode?: string;
  regionCode?: string;
  latitude: number;
  longitude: number;
  sourceId: string;
  sourceRecordId: string;
  // Additive v1 extension. Missing legacy values remain unknown, never inferred.
  coordinateClassification?: string | null;
  source?: OfflinePlaceSource;
}

export interface OfflineSearchIndex {
  schemaVersion: 1;
  provenanceRevision?: 2;
  id: string;
  version: string;
  generatedAt: string;
  sourceIds: string[];
  entries: OfflinePlace[];
}

export interface InstalledSearchPacks {
  core?: OfflineSearchIndex;
  regions: Record<string, OfflineSearchIndex>;
}

const CATEGORIES: PlaceCategory[] = ['country', 'city', 'sea', 'ocean', 'river', 'mountain', 'airport'];

function validCoordinate(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

export function validateOfflineSearchIndex(value: unknown): value is OfflineSearchIndex {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<OfflineSearchIndex>;
  if (candidate.schemaVersion !== 1 || !candidate.id || !candidate.version || !candidate.generatedAt) return false;
  if (candidate.provenanceRevision !== undefined && candidate.provenanceRevision !== 2) return false;
  if (!Array.isArray(candidate.sourceIds) || !Array.isArray(candidate.entries)) return false;
  return candidate.entries.every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const source = entry.source;
    if (source !== undefined && (!source || source.sourceId !== entry.sourceId ||
      ![source.name, source.license, source.sourceUrl].every(value => typeof value === 'string' && value.length > 0) ||
      (source.version !== null && typeof source.version !== 'string'))) return false;
    if (entry.coordinateClassification != null && typeof entry.coordinateClassification !== 'string') return false;
    return [entry.id, entry.name, entry.sourceId, entry.sourceRecordId].every(value => typeof value === 'string' && value.length > 0) &&
      CATEGORIES.includes(entry.category) &&
      Array.isArray(entry.aliases) && entry.aliases.every((alias) => typeof alias === 'string') &&
      validCoordinate(entry.latitude, entry.longitude);
  });
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function score(entry: OfflinePlace, query: string): number {
  const q = normalize(query);
  const names = [entry.name, entry.nameAr ?? '', ...entry.aliases].map(normalize).filter(Boolean);
  if (names.some((name) => name === q)) return 100;
  if (names.some((name) => name.startsWith(q))) return 90;
  if (names.some((name) => name.includes(q))) return 70;
  return 0;
}

export function searchOffline(
  indexes: readonly OfflineSearchIndex[],
  query: string,
  options: { categories?: readonly PlaceCategory[]; countryCode?: string; limit?: number } = {},
): OfflinePlace[] {
  const cleaned = normalize(query);
  if (!cleaned) return [];
  const categories = options.categories ? new Set(options.categories) : undefined;
  const countryCode = options.countryCode?.toUpperCase();
  const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
  const deduped = new Map<string, { entry: OfflinePlace; score: number }>();

  for (const index of indexes) {
    for (const entry of index.entries) {
      if (categories && !categories.has(entry.category)) continue;
      if (countryCode && entry.countryCode !== countryCode) continue;
      const entryScore = score(entry, cleaned);
      if (!entryScore) continue;
      const current = deduped.get(entry.id);
      if (!current || entryScore > current.score) deduped.set(entry.id, { entry, score: entryScore });
    }
  }

  return [...deduped.values()]
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name) || a.entry.id.localeCompare(b.entry.id))
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export function installRegionPack(state: InstalledSearchPacks, pack: OfflineSearchIndex): InstalledSearchPacks {
  if (!validateOfflineSearchIndex(pack)) throw new Error('invalid offline search index');
  return { ...state, regions: { ...state.regions, [pack.id]: pack } };
}

export function removeRegionPack(state: InstalledSearchPacks, packId: string): InstalledSearchPacks {
  const regions = { ...state.regions };
  delete regions[packId];
  return { ...state, regions };
}

export function activeIndexes(state: InstalledSearchPacks): OfflineSearchIndex[] {
  return [...(state.core ? [state.core] : []), ...Object.values(state.regions)];
}
