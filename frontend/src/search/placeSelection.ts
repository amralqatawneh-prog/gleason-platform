import type { PlaceCategory, PlaceSearchResult } from '../api';
import type { OfflinePlace } from '../offline/searchIndex';

export interface PlaceSelection {
  id: string;
  category: PlaceCategory;
  name: string;
  nameAr?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  sourceId: string;
  sourceRecordId: string;
  sourceVersion: string | null;
  sourceUrl: string | null;
  sourceLicense: string | null;
  coordinateClassification: string | null;
  sourceLabel: string;
  provenanceStatus: 'complete' | 'legacy-or-incomplete';
  offline: boolean;
}

export function onlineResult(result: PlaceSearchResult): PlaceSelection {
  return {
    id: result.id, category: result.category, name: result.name,
    nameAr: result.name_ar ?? undefined, countryCode: result.country_code ?? undefined,
    latitude: result.latitude, longitude: result.longitude,
    sourceId: result.source.source_id, sourceRecordId: result.source_record_id,
    sourceVersion: result.source.version ?? null, sourceUrl: result.source.source_url,
    sourceLicense: result.source.license, coordinateClassification: result.coordinate_classification ?? null,
    sourceLabel: `${result.source.name}${result.source.version ? ` ${result.source.version}` : ''}`,
    provenanceStatus: result.source.version && result.coordinate_classification ? 'complete' : 'legacy-or-incomplete',
    offline: false,
  };
}

export function offlineResult(result: OfflinePlace): PlaceSelection {
  return {
    id: result.id, category: result.category, name: result.name, nameAr: result.nameAr, countryCode: result.countryCode,
    latitude: result.latitude, longitude: result.longitude,
    sourceId: result.sourceId, sourceRecordId: result.sourceRecordId,
    sourceVersion: result.source?.version ?? null, sourceUrl: result.source?.sourceUrl ?? null,
    sourceLicense: result.source?.license ?? null, coordinateClassification: result.coordinateClassification ?? null,
    sourceLabel: result.source ? `${result.source.name}${result.source.version ? ` ${result.source.version}` : ''}` : result.sourceId,
    provenanceStatus: result.source?.version && result.coordinateClassification ? 'complete' : 'legacy-or-incomplete',
    offline: true,
  };
}
