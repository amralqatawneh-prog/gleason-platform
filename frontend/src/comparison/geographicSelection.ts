import type { GeoPoint } from '../models/projectionTypes';
import type { PlaceSelection } from '../search/placeSelection';

/** Geographic interchange only: never pixels, projected metres or historical radius. */
export type SelectionModel = 'gleason' | 'ae' | 'wgs84';
export interface GeographicPosition extends GeoPoint {
  /** WGS84 ellipsoidal metres; absent means unknown, not zero or sea level. */
  ellipsoidalHeightM?: number;
}
type PlaceIdentity = Readonly<Omit<PlaceSelection, 'latitude' | 'longitude'>>;
interface SelectionBase {
  readonly schemaVersion: 1;
  readonly referenceFrame: 'WGS84';
  readonly angularUnits: 'degrees';
  readonly point: Readonly<GeographicPosition>;
  /** View producing the selection; this does not classify source evidence. */
  readonly model: SelectionModel;
}
export type GeographicSelection = SelectionBase & (
  | { readonly kind: 'place'; readonly origin: 'search'; readonly place: PlaceIdentity }
  | { readonly kind: 'free-point'; readonly origin: 'map'; readonly place: null }
);

function position(point: GeographicPosition): Readonly<GeographicPosition> {
  if (!Number.isFinite(point.latitude) || point.latitude < -90 || point.latitude > 90
    || !Number.isFinite(point.longitude) || point.longitude < -180 || point.longitude > 180
    || (point.ellipsoidalHeightM !== undefined && !Number.isFinite(point.ellipsoidalHeightM))) {
    throw new RangeError('Expected WGS84 degrees in [-90,90]/[-180,180] and optional finite ellipsoidal metres');
  }
  // Copy only contract fields, so screen coordinates and unrelated metadata cannot leak in.
  return Object.freeze({ latitude: point.latitude, longitude: point.longitude,
    ...(point.ellipsoidalHeightM === undefined ? {} : { ellipsoidalHeightM: point.ellipsoidalHeightM }) });
}

export function selectPlace(place: PlaceSelection): GeographicSelection {
  const { latitude, longitude, ...identity } = place;
  return Object.freeze({ schemaVersion: 1, referenceFrame: 'WGS84', angularUnits: 'degrees',
    kind: 'place', origin: 'search', model: 'wgs84', point: position({ latitude, longitude }),
    place: Object.freeze(identity) });
}

export function selectFreePoint(model: SelectionModel, point: GeographicPosition): GeographicSelection {
  if (!['gleason', 'ae', 'wgs84'].includes(model)) throw new RangeError('Unknown selection model');
  // A fresh pick never inherits a place identity, even at exactly the same coordinates.
  return Object.freeze({ schemaVersion: 1, referenceFrame: 'WGS84', angularUnits: 'degrees',
    kind: 'free-point', origin: 'map', model, point: position(point), place: null });
}
