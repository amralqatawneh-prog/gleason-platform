import {
  GLEASON_FIG43_CIRCLE_MILES_PER_NRU,
  GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU,
  historicalLongitudeDegreeMiles,
  normalizeLongitude,
  gleasonForward,
} from '../models/gleason.js';

export const GLEASON_FRAME_MINUTES_PER_LONGITUDE_DEGREE = 4 as const;
export const GLEASON_FIG37_ENGLISH_MILES = 208 as const;
export const GLEASON_FIG37_NAUTICAL_MILES = 180 as const;
export const GLEASON_TEXT_ENGLISH_MILE_FEET = 5280 as const;
export const GLEASON_TEXT_NAUTICAL_MILE_FEET = 6075 as const;

export interface GleasonHistoricalPoint {
  readonly latitude: number;
  readonly longitude: number;
}

export interface GleasonFrameTimeResult {
  readonly signed_longitude_delta_deg: number;
  readonly absolute_longitude_delta_deg: number;
  readonly signed_sun_time_minutes: number;
  readonly absolute_sun_time_minutes: number;
}

export interface GleasonSameLatitudeLongitudeResult {
  readonly latitude_deg: number;
  readonly miles_per_longitude_degree: number;
  readonly longitude_delta_deg: number;
  readonly parallel_arc_historical_fig43_mile: number;
  readonly parallel_radius_historical_fig43_mile: number;
  readonly straight_chord_historical_fig43_mile: number;
}

export function shortestSignedLongitudeDelta(fromLongitude: number, toLongitude: number): number {
  return normalizeLongitude(toLongitude - fromLongitude);
}

export function gleasonFrameTimeDifference(
  fromLongitude: number,
  toLongitude: number,
): Readonly<GleasonFrameTimeResult> {
  const delta = shortestSignedLongitudeDelta(fromLongitude, toLongitude);
  return Object.freeze({
    signed_longitude_delta_deg: delta,
    absolute_longitude_delta_deg: Math.abs(delta),
    signed_sun_time_minutes: delta * GLEASON_FRAME_MINUTES_PER_LONGITUDE_DEGREE,
    absolute_sun_time_minutes: Math.abs(delta) * GLEASON_FRAME_MINUTES_PER_LONGITUDE_DEGREE,
  });
}

export function gleasonFig37NauticalToEnglishMiles(nauticalMiles: number): number {
  if (!Number.isFinite(nauticalMiles)) throw new RangeError('nautical miles must be finite');
  return nauticalMiles * GLEASON_FIG37_ENGLISH_MILES / GLEASON_FIG37_NAUTICAL_MILES;
}

export function gleasonTextNauticalToEnglishMiles(nauticalMiles: number): number {
  if (!Number.isFinite(nauticalMiles)) throw new RangeError('nautical miles must be finite');
  return nauticalMiles * GLEASON_TEXT_NAUTICAL_MILE_FEET / GLEASON_TEXT_ENGLISH_MILE_FEET;
}

function normalizedChord(start: GleasonHistoricalPoint, end: GleasonHistoricalPoint): number {
  const a = gleasonForward(start);
  const b = gleasonForward(end);
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Diagnostic derived scale retained after P6.C1, based on Fig.43's 60 miles
 * per longitude degree at the Equator plus the circle relation C=2πr.
 * It is not a universal historical route metric and has no automatic SI identity.
 */
export function gleasonFig43CircleDerivedDistance(
  start: GleasonHistoricalPoint,
  end: GleasonHistoricalPoint,
): number {
  return normalizedChord(start, end) * GLEASON_FIG43_CIRCLE_MILES_PER_NRU;
}

/** Legacy comparison only: the earlier video assumption of 60 NM for each of
 * 180 radial latitude degrees. It is not the historical default.
 */
export function gleasonLegacyRadial60Distance(
  start: GleasonHistoricalPoint,
  end: GleasonHistoricalPoint,
): number {
  return normalizedChord(start, end) * GLEASON_LEGACY_RADIAL60_NAUTICAL_MILES_PER_NRU;
}

/** Walter-style external comparison. EQ is caller supplied distance from the
 * north-pole center to the Equator; geometry is identical up to scale.
 */
export function gleasonWalterConfigurableDistance(
  start: GleasonHistoricalPoint,
  end: GleasonHistoricalPoint,
  equatorDistance: number,
): number {
  if (!Number.isFinite(equatorDistance) || equatorDistance <= 0) {
    throw new RangeError('equatorDistance must be a positive finite value');
  }
  return normalizedChord(start, end) * (2 * equatorDistance);
}

/**
 * Figure 43 is a latitude-specific longitude scale. It is not a general
 * arbitrary two-point route rule. Same-latitude use exposes both the parallel
 * arc and the direct planar chord; they are intentionally different quantities.
 */
export function gleasonSameLatitudeHistoricalLongitudeMetrics(
  start: GleasonHistoricalPoint,
  end: GleasonHistoricalPoint,
  latitudeToleranceDeg = 1e-9,
): Readonly<GleasonSameLatitudeLongitudeResult> | null {
  if (Math.abs(start.latitude - end.latitude) > latitudeToleranceDeg) return null;
  const latitude = (start.latitude + end.latitude) / 2;
  const longitudeDelta = Math.abs(shortestSignedLongitudeDelta(start.longitude, end.longitude));
  const milesPerDegree = historicalLongitudeDegreeMiles(latitude);
  const parallelArc = longitudeDelta * milesPerDegree;
  const parallelRadius = 360 * milesPerDegree / (2 * Math.PI);
  const straightChord = 2 * parallelRadius * Math.sin(longitudeDelta * Math.PI / 360);
  return Object.freeze({
    latitude_deg: latitude,
    miles_per_longitude_degree: milesPerDegree,
    longitude_delta_deg: longitudeDelta,
    parallel_arc_historical_fig43_mile: parallelArc,
    parallel_radius_historical_fig43_mile: parallelRadius,
    straight_chord_historical_fig43_mile: Math.abs(straightChord),
  });
}
