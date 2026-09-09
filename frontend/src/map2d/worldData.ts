import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json';

export function worldCountriesGeoJson(): GeoJSON.FeatureCollection {
  const topology = world as unknown as { objects: { countries: unknown } };
  return feature(world as never, topology.objects.countries as never) as unknown as GeoJSON.FeatureCollection;
}
