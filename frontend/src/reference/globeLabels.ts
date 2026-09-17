import type { OfflinePlace, PlaceCategory } from '../offline/searchIndex';
import type { GlobeLayerVisibility } from './globeLayers';
import type { ScreenProjection } from './referenceMath';

export type GlobeLabel = {
  id: string;
  latitude: number;
  longitude: number;
  text: string;
  kind: 'continent' | PlaceCategory;
  priority: number;
  provenance: 'DISPLAY_CONVENTION' | 'PHASE3_PLACE';
};

export type ProjectedGlobeLabel = {
  label: GlobeLabel;
  screen: ScreenProjection;
  fontSizePx: number;
};

const CONTINENTS = [
  { id: 'continent-africa', latitude: 7, longitude: 21, ar: 'أفريقيا', en: 'Africa' },
  { id: 'continent-europe', latitude: 52, longitude: 16, ar: 'أوروبا', en: 'Europe' },
  { id: 'continent-asia', latitude: 42, longitude: 87, ar: 'آسيا', en: 'Asia' },
  { id: 'continent-north-america', latitude: 47, longitude: -105, ar: 'أمريكا الشمالية', en: 'North America' },
  { id: 'continent-south-america', latitude: -15, longitude: -60, ar: 'أمريكا الجنوبية', en: 'South America' },
  { id: 'continent-australia', latitude: -25, longitude: 134, ar: 'أستراليا', en: 'Australia' },
  { id: 'continent-antarctica', latitude: -78, longitude: 25, ar: 'القارة القطبية الجنوبية', en: 'Antarctica' },
] as const;

function priorityFor(category: PlaceCategory): number {
  switch (category) {
    case 'country': return 80;
    case 'ocean': return 75;
    case 'sea': return 70;
    case 'city': return 55;
    case 'airport': return 35;
    case 'river': return 25;
    case 'mountain': return 20;
  }
}

function layerAllows(category: PlaceCategory, layers: GlobeLayerVisibility): boolean {
  switch (category) {
    case 'country': return layers.countries;
    case 'ocean': return layers.oceans;
    case 'sea': return layers.seas;
    case 'river': return layers.rivers;
    case 'city': return layers.cities;
    case 'airport': return layers.airports;
    case 'mountain': return false;
  }
}

function baseFontSize(kind: GlobeLabel['kind']): number {
  switch (kind) {
    case 'continent': return 10;
    case 'country': return 7;
    case 'ocean': return 8;
    case 'sea': return 7;
    case 'city': return 6;
    case 'airport': return 5;
    default: return 6;
  }
}

export function globeLabelFontSize(kind: GlobeLabel['kind'], viewportWidth: number): number {
  // Responsive sizing: browser/map zoom reduces the available CSS viewport, so
  // labels get smaller rather than growing over neighbouring countries.
  const viewportScale = Math.max(0.62, Math.min(1, viewportWidth / 900));
  return Number((baseFontSize(kind) * viewportScale).toFixed(2));
}

export function declutterProjectedLabels(
  candidates: Array<{ label: GlobeLabel; screen: ScreenProjection }>,
  viewportWidth: number,
  viewportHeight: number,
  maxLabels = 64,
): ProjectedGlobeLabel[] {
  const accepted: Array<ProjectedGlobeLabel & { box: [number, number, number, number] }> = [];

  for (const candidate of candidates) {
    if (!candidate.screen.visible || candidate.screen.depth <= 0.18) continue;
    const fontSizePx = globeLabelFontSize(candidate.label.kind, viewportWidth);
    const estimatedWidth = Math.max(16, candidate.label.text.length * fontSizePx * 0.56 + 6);
    const estimatedHeight = fontSizePx * 1.35 + 4;
    const left = candidate.screen.x - estimatedWidth / 2;
    const right = candidate.screen.x + estimatedWidth / 2;
    const top = candidate.screen.y - estimatedHeight / 2;
    const bottom = candidate.screen.y + estimatedHeight / 2;
    if (right < 0 || left > viewportWidth || bottom < 0 || top > viewportHeight) continue;

    const gap = 2;
    const overlaps = accepted.some(({ box }) =>
      left < box[2] + gap && right > box[0] - gap && top < box[3] + gap && bottom > box[1] - gap,
    );
    if (overlaps) continue;

    accepted.push({ ...candidate, fontSizePx, box: [left, top, right, bottom] });
    if (accepted.length >= maxLabels) break;
  }

  return accepted.map(({ box: _box, ...item }) => item);
}

export function buildGlobeLabels(
  places: readonly OfflinePlace[],
  layers: GlobeLayerVisibility,
  locale: 'ar' | 'en',
): GlobeLabel[] {
  if (!layers.labels) return [];
  const labels: GlobeLabel[] = [];

  if (layers.countries) {
    for (const continent of CONTINENTS) {
      labels.push({
        id: continent.id,
        latitude: continent.latitude,
        longitude: continent.longitude,
        text: locale === 'ar' ? continent.ar : continent.en,
        kind: 'continent',
        priority: 100,
        provenance: 'DISPLAY_CONVENTION',
      });
    }
  }

  for (const place of places) {
    if (!layerAllows(place.category, layers)) continue;
    if (place.category === 'river') continue;
    labels.push({
      id: `place-${place.id}`,
      latitude: place.latitude,
      longitude: place.longitude,
      text: locale === 'ar' && place.nameAr ? place.nameAr : place.name,
      kind: place.category,
      priority: priorityFor(place.category),
      provenance: 'PHASE3_PLACE',
    });
  }

  return labels.sort((a, b) => b.priority - a.priority || a.text.localeCompare(b.text));
}
