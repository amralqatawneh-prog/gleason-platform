/// <reference types="vite/client" />
import { localGeodesicInverse, validateGeo } from './reference/offlineWgs84';
import {
  localWgs84RouteDistance,
  validateWgs84RouteDistancePoints,
  type Wgs84RouteDistancePoint,
  type Wgs84RouteDistanceResult,
} from './measurement/wgs84RouteDistance';

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
  coordinate_classification?: string | null;
  source: {
    source_id: string;
    name: string;
    version?: string | null;
    license: string;
    source_url: string;
  };
  score: number;
}

export interface ReferenceGeoInput {
  latitude: number;
  longitude: number;
  ellipsoidal_height_m?: number;
}

export interface GeodesicInverseResult {
  semantic_type: 'REFERENCE_RESULT';
  operation: string;
  input: {
    start: ReferenceGeoInput;
    end: ReferenceGeoInput;
  };
  output: {
    distance_m: number;
    initial_bearing_deg: number | null;
    final_bearing_deg: number | null;
    reverse_bearing_deg: number | null;
  };
  provenance: {
    semantic_type: 'REFERENCE_RESULT';
    provider_id: string;
    provider_version: string;
    reference_frame: string;
    operation: string;
    implementation: string;
    implementation_version: string;
    algorithm: string;
    units: Record<string, string>;
    notes: string[];
  };
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

export async function geodesicInverse(start: ReferenceGeoInput, end: ReferenceGeoInput): Promise<GeodesicInverseResult> {
  validateGeo(start); validateGeo(end);
  if (!navigator.onLine) return localGeodesicInverse(start, end);
  try {
  const response = await fetch(`${API_BASE}/reference/wgs84/geodesic-inverse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      start: { ...start, ellipsoidal_height_m: start.ellipsoidal_height_m ?? 0 },
      end: { ...end, ellipsoidal_height_m: end.ellipsoidal_height_m ?? 0 },
    }),
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`geodesic inverse failed: ${response.status}`);
  return await response.json() as GeodesicInverseResult;
  } catch {
    return localGeodesicInverse(start, end);
  }
}


export async function wgs84RouteDistance(
  pointsInput: readonly Wgs84RouteDistancePoint[],
  routeId = 'transient-route',
): Promise<Wgs84RouteDistanceResult> {
  const points = validateWgs84RouteDistancePoints(pointsInput);
  if (!navigator.onLine) return localWgs84RouteDistance(points, routeId);
  try {
    const response = await fetch(`${API_BASE}/reference/wgs84/route-distance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route_id: routeId, points }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error(`WGS84 route distance failed: ${response.status}`);
    return await response.json() as Wgs84RouteDistanceResult;
  } catch {
    return localWgs84RouteDistance(points, routeId);
  }
}

export type { Wgs84RouteDistancePoint, Wgs84RouteDistanceResult };
