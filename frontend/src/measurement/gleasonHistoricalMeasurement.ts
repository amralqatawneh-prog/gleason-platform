import {
  GLEASON_MAP_RULER_NAUTICAL_MILES_PER_NRU,
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
  readonly distance_historical_book_mile: number;
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

export function gleasonMapRulerDerivedNauticalMiles(
  start: GleasonHistoricalPoint,
  end: GleasonHistoricalPoint,
): number {
  const a = gleasonForward(start);
  const b = gleasonForward(end);
  return Math.hypot(b.x - a.x, b.y - a.y) * GLEASON_MAP_RULER_NAUTICAL_MILES_PER_NRU;
}

/**
 * Figure 43 is a latitude-specific longitude scale. It is not a general
 * arbitrary two-point route rule. Therefore this helper deliberately fails
 * closed unless the two endpoints lie on the same latitude.
 */
export function gleasonSameLatitudeHistoricalLongitudeDistance(
  start: GleasonHistoricalPoint,
  end: GleasonHistoricalPoint,
  latitudeToleranceDeg = 1e-9,
): Readonly<GleasonSameLatitudeLongitudeResult> | null {
  if (Math.abs(start.latitude - end.latitude) > latitudeToleranceDeg) return null;
  const latitude = (start.latitude + end.latitude) / 2;
  const longitudeDelta = Math.abs(shortestSignedLongitudeDelta(start.longitude, end.longitude));
  const milesPerDegree = historicalLongitudeDegreeMiles(latitude);
  return Object.freeze({
    latitude_deg: latitude,
    miles_per_longitude_degree: milesPerDegree,
    longitude_delta_deg: longitudeDelta,
    distance_historical_book_mile: longitudeDelta * milesPerDegree,
  });
}
