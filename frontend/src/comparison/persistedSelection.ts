import { selectFreePoint, selectPlace, type GeographicPosition, type GeographicSelection, type SelectionModel } from './geographicSelection.js';
import type { PlaceSelection } from '../search/placeSelection.js';

export const PHASE5_PERSISTENCE_CONTRACT = 'phase5-shared-selection' as const;
export const PHASE5_PERSISTENCE_SCHEMA_VERSION = 1 as const;

export interface PersistedPlaceLocator {
  readonly id: string;
  readonly sourceId: string;
  readonly sourceRecordId: string;
  readonly sourceVersion: string | null;
}

export type PersistedSelectionV1 =
  | {
      readonly kind: 'free-point';
      readonly model: SelectionModel;
      readonly point: Readonly<GeographicPosition>;
    }
  | {
      readonly kind: 'place';
      readonly locator: Readonly<PersistedPlaceLocator>;
    };

export interface PersistedPhase5StateV1 {
  readonly contract: typeof PHASE5_PERSISTENCE_CONTRACT;
  readonly schemaVersion: typeof PHASE5_PERSISTENCE_SCHEMA_VERSION;
  readonly savedAt: string;
  readonly selection: PersistedSelectionV1 | null;
}

export type PersistedStateDecodeResult =
  | { readonly status: 'valid'; readonly state: Readonly<PersistedPhase5StateV1> }
  | { readonly status: 'unsupported-version'; readonly schemaVersion: unknown }
  | { readonly status: 'invalid' };

export type PersistedRestoreResult =
  | { readonly status: 'empty'; readonly selection: null }
  | { readonly status: 'restored'; readonly selection: GeographicSelection }
  | { readonly status: 'missing-local-place'; readonly selection: null }
  | { readonly status: 'unsupported-version'; readonly selection: null }
  | { readonly status: 'invalid'; readonly selection: null };

type LocalPlaceResolver = (locator: Readonly<PersistedPlaceLocator>) => PlaceSelection | null;

function plainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual=Object.keys(value).sort();
  const expected=[...keys].sort();
  return actual.length===expected.length && actual.every((key,index)=>key===expected[index]);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function finitePosition(value: unknown): value is GeographicPosition {
  if(!plainRecord(value)) return false;
  const keys=Object.keys(value);
  if(!keys.every(key=>['latitude','longitude','ellipsoidalHeightM'].includes(key))) return false;
  if(keys.length<2 || keys.length>3) return false;
  const latitude=value.latitude;
  const longitude=value.longitude;
  const height=value.ellipsoidalHeightM;
  return typeof latitude==='number' && Number.isFinite(latitude) && latitude>=-90 && latitude<=90
    && typeof longitude==='number' && Number.isFinite(longitude) && longitude>=-180 && longitude<=180
    && (height===undefined || (typeof height==='number' && Number.isFinite(height)));
}

function validModel(value: unknown): value is SelectionModel {
  return value==='gleason' || value==='ae' || value==='wgs84';
}

function validLocator(value: unknown): value is PersistedPlaceLocator {
  if(!plainRecord(value) || !exactKeys(value,['id','sourceId','sourceRecordId','sourceVersion'])) return false;
  return nonEmptyString(value.id)
    && nonEmptyString(value.sourceId)
    && nonEmptyString(value.sourceRecordId)
    && (value.sourceVersion===null || nonEmptyString(value.sourceVersion));
}

function sameLocator(locator: PersistedPlaceLocator, place: PlaceSelection): boolean {
  return place.offline === true
    && place.id === locator.id
    && place.sourceId === locator.sourceId
    && place.sourceRecordId === locator.sourceRecordId
    && (locator.sourceVersion === null || place.sourceVersion === locator.sourceVersion);
}

function freezePoint(point: GeographicPosition): Readonly<GeographicPosition> {
  return Object.freeze({
    latitude:point.latitude,
    longitude:point.longitude,
    ...(point.ellipsoidalHeightM===undefined?{}:{ellipsoidalHeightM:point.ellipsoidalHeightM}),
  });
}

export function encodePhase5State(
  selection: GeographicSelection | null,
  savedAt: string = new Date().toISOString(),
): Readonly<PersistedPhase5StateV1> {
  if(!nonEmptyString(savedAt) || Number.isNaN(Date.parse(savedAt))) throw new RangeError('savedAt must be a valid timestamp');
  let persisted:PersistedSelectionV1|null=null;
  if(selection?.kind==='free-point'){
    persisted=Object.freeze({kind:'free-point',model:selection.model,point:freezePoint(selection.point)});
  }else if(selection?.kind==='place'){
    persisted=Object.freeze({
      kind:'place',
      locator:Object.freeze({
        id:selection.place.id,
        sourceId:selection.place.sourceId,
        sourceRecordId:selection.place.sourceRecordId,
        sourceVersion:selection.place.sourceVersion,
      }),
    });
  }
  return Object.freeze({
    contract:PHASE5_PERSISTENCE_CONTRACT,
    schemaVersion:PHASE5_PERSISTENCE_SCHEMA_VERSION,
    savedAt,
    selection:persisted,
  });
}

export function decodePhase5State(value: unknown): PersistedStateDecodeResult {
  if(!plainRecord(value)) return {status:'invalid'};
  if(value.contract!==PHASE5_PERSISTENCE_CONTRACT) return {status:'invalid'};
  if(value.schemaVersion!==PHASE5_PERSISTENCE_SCHEMA_VERSION){
    return {status:'unsupported-version',schemaVersion:value.schemaVersion};
  }
  if(!exactKeys(value,['contract','schemaVersion','savedAt','selection'])) return {status:'invalid'};
  if(!nonEmptyString(value.savedAt) || Number.isNaN(Date.parse(value.savedAt))) return {status:'invalid'};
  const selection=value.selection;
  if(selection===null){
    return {status:'valid',state:Object.freeze({
      contract:PHASE5_PERSISTENCE_CONTRACT,
      schemaVersion:PHASE5_PERSISTENCE_SCHEMA_VERSION,
      savedAt:value.savedAt,
      selection:null,
    })};
  }
  if(!plainRecord(selection) || !nonEmptyString(selection.kind)) return {status:'invalid'};
  if(selection.kind==='free-point'){
    if(!exactKeys(selection,['kind','model','point']) || !validModel(selection.model) || !finitePosition(selection.point)) return {status:'invalid'};
    return {status:'valid',state:Object.freeze({
      contract:PHASE5_PERSISTENCE_CONTRACT,
      schemaVersion:PHASE5_PERSISTENCE_SCHEMA_VERSION,
      savedAt:value.savedAt,
      selection:Object.freeze({kind:'free-point',model:selection.model,point:freezePoint(selection.point)}),
    })};
  }
  if(selection.kind==='place'){
    if(!exactKeys(selection,['kind','locator']) || !validLocator(selection.locator)) return {status:'invalid'};
    return {status:'valid',state:Object.freeze({
      contract:PHASE5_PERSISTENCE_CONTRACT,
      schemaVersion:PHASE5_PERSISTENCE_SCHEMA_VERSION,
      savedAt:value.savedAt,
      selection:Object.freeze({kind:'place',locator:Object.freeze({...selection.locator})}),
    })};
  }
  return {status:'invalid'};
}

export function restoreDecodedPhase5State(
  decoded: PersistedStateDecodeResult,
  resolveLocalPlace: LocalPlaceResolver,
): PersistedRestoreResult {
  if(decoded.status==='unsupported-version') return {status:'unsupported-version',selection:null};
  if(decoded.status==='invalid') return {status:'invalid',selection:null};
  const persisted=decoded.state.selection;
  if(persisted===null) return {status:'empty',selection:null};
  if(persisted.kind==='free-point'){
    try{return {status:'restored',selection:selectFreePoint(persisted.model,persisted.point)};}
    catch{return {status:'invalid',selection:null};}
  }
  const place=resolveLocalPlace(persisted.locator);
  if(!place || !sameLocator(persisted.locator,place)) return {status:'missing-local-place',selection:null};
  try{return {status:'restored',selection:selectPlace(place)};}
  catch{return {status:'invalid',selection:null};}
}
