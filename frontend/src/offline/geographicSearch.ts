export type GeographicEntityType =
  | 'country'
  | 'city'
  | 'sea'
  | 'ocean'
  | 'river'
  | 'mountain'
  | 'airport';

export interface GeographicProvenance {
  sourceId: string;
  sourceVersion: string;
  sourceLicense: string;
}

export interface OfflineGeographicEntity {
  id: string;
  entityType: GeographicEntityType;
  name: string;
  nameAr?: string;
  aliases: string[];
  latitude?: number;
  longitude?: number;
  countryCode?: string;
  provenance: GeographicProvenance;
}

export interface OfflineSearchRecord extends OfflineGeographicEntity {
  searchText: string;
}

const ARABIC_DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function normalizeGeographicSearchText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(COMBINING_MARKS, '')
    .replace(ARABIC_DIACRITICS, '')
    .toLocaleLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildOfflineGeographicIndex(
  entities: readonly OfflineGeographicEntity[],
): OfflineSearchRecord[] {
  return entities.map((entity) => {
    const searchable = [entity.name, entity.nameAr ?? '', ...entity.aliases]
      .map(normalizeGeographicSearchText)
      .filter(Boolean)
      .join(' ');
    return { ...entity, searchText: searchable };
  });
}

export function searchOfflineGeography(
  index: readonly OfflineSearchRecord[],
  query: string,
  entityTypes: readonly GeographicEntityType[] = [],
  limit = 20,
): OfflineSearchRecord[] {
  const normalized = normalizeGeographicSearchText(query);
  if (!normalized || limit <= 0) return [];
  const tokens = normalized.split(' ');
  const allowed = new Set(entityTypes);

  return index
    .filter((record) => allowed.size === 0 || allowed.has(record.entityType))
    .map((record) => {
      const name = normalizeGeographicSearchText(record.name);
      const nameAr = normalizeGeographicSearchText(record.nameAr ?? '');
      const matches = tokens.every((token) => record.searchText.includes(token));
      const rank = name === normalized || nameAr === normalized
        ? 0
        : name.startsWith(normalized) || nameAr.startsWith(normalized)
          ? 1
          : 2;
      return { record, matches, rank };
    })
    .filter(({ matches }) => matches)
    .sort((a, b) => a.rank - b.rank || a.record.name.localeCompare(b.record.name))
    .slice(0, limit)
    .map(({ record }) => record);
}
