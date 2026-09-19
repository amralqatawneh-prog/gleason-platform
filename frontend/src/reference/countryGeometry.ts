import { feature } from 'topojson-client';
import countries110m from 'world-atlas/countries-110m.json';

export type LonLat = [number, number];

function pushRing(target: LonLat[][], coordinates: unknown): void {
  if (!Array.isArray(coordinates)) return;
  const ring: LonLat[] = [];
  for (const coordinate of coordinates) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) continue;
    const lon = Number(coordinate[0]);
    const lat = Number(coordinate[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    ring.push([lon, lat]);
  }
  if (ring.length >= 2) target.push(ring);
}

export function countryBoundaryRings(): LonLat[][] {
  const topology = countries110m as unknown as {
    objects: { countries: object };
  };
  const collection = feature(topology as never, topology.objects.countries as never) as unknown as {
    features: Array<{ geometry?: { type?: string; coordinates?: unknown } }>;
  };
  const rings: LonLat[][] = [];

  for (const item of collection.features) {
    const geometry = item.geometry;
    if (!geometry) continue;
    if (geometry.type === 'Polygon' && Array.isArray(geometry.coordinates)) {
      for (const ring of geometry.coordinates) pushRing(rings, ring);
    } else if (geometry.type === 'MultiPolygon' && Array.isArray(geometry.coordinates)) {
      for (const polygon of geometry.coordinates) {
        if (!Array.isArray(polygon)) continue;
        for (const ring of polygon) pushRing(rings, ring);
      }
    }
  }

  return rings;
}
