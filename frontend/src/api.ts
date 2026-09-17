/// <reference types="vite/client" />

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export interface GeographicSearchItem {
  id: string;
  entity_type: string;
  name: string;
  name_ar: string | null;
  aliases: string[];
  country_code: string | null;
  admin1: string | null;
  population: number | null;
  elevation_m: number | null;
  point: { latitude: number; longitude: number } | null;
  provenance: { source_id: string; source_version: string; source_license: string };
  metadata: Record<string, unknown>;
}

export interface GeographicSearchResponse {
  query: string;
  total: number;
  limit: number;
  offset: number;
  results: GeographicSearchItem[];
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

export async function searchGeography(query: string, entityType?: string): Promise<GeographicSearchResponse | null> {
  try {
    const params = new URLSearchParams({ q: query, limit: '20' });
    if (entityType) params.append('entity_type', entityType);
    const response = await fetch(`${API_BASE}/search?${params.toString()}`, { signal: AbortSignal.timeout(4000) });
    if (!response.ok) return null;
    return await response.json() as GeographicSearchResponse;
  } catch {
    return null;
  }
}
