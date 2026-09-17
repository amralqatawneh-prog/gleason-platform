/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export type PlaceCategory = 'country' | 'city' | 'sea' | 'ocean' | 'river' | 'mountain' | 'airport';

export interface PlaceSearchResult {
  id: string;
  category: PlaceCategory;
  name: string;
  name_ar?: string | null;
  country_code?: string | null;
  region_code?: string | null;
  latitude: number;
  longitude: number;
  source_record_id: string;
  source: {
    source_id: string;
    name: string;
    version?: string | null;
    license: string;
    source_url: string;
  };
  score: number;
}

export async function fetchCapabilities(): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`${API_BASE}/capabilities`, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return null;
    return await response.json() as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function searchPlaces(query: string, category?: PlaceCategory): Promise<PlaceSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const params = new URLSearchParams({ q, limit: '20' });
  if (category) params.append('category', category);
  const response = await fetch(`${API_BASE}/search?${params.toString()}`, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error(`search failed: ${response.status}`);
  const payload = await response.json() as { results: PlaceSearchResult[] };
  return payload.results;
}
