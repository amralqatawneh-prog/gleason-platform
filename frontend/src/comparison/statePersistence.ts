import { activeIndexes, type InstalledSearchPacks, type OfflinePlace } from '../offline/searchIndex.js';
import type { PlaceSelection } from '../search/placeSelection.js';
import {
  selectFreePoint,
  selectPlace,
  type GeographicPosition,
  type GeographicSelection,
  type SelectionModel,
} from './geographicSelection.js';

export const PHASE5_STATE_STORAGE_KEY = 'phase5-shared-state-v1';
export const PHASE5_STATE_SCHEMA_VERSION = 1 as const;

export interface PersistedPhase5StateV1 {
  readonly schemaVersion: typeof PHASE5_STATE_SCHEMA_VERSION;
  readonly selection: GeographicSelection | null;
}

export type Phase5RestoreStatus =
  | 'empty'
  | 'restored-free-point'
  | 'restored-place'
  | 'restored-point-only'
  | 'discarded-invalid'
  | 'discarded-unsupported-version';

export interface Phase5RestoreResult {
  readonly status: Phase5RestoreStatus;
  readonly selection: GeographicSelection | null;
  readonly reason: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringOrUndefined(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}
function stringOrNull(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}
function finiteOrUndefined(value: unknown): value is number | undefined {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

function validPoint(value: unknown): value is GeographicPosition {
  if (!isRecord(value)) return false;
  return typeof value.latitude === 'number'
    && Number.isFinite(value.latitude)
    && value.latitude >= -90 && value.latitude <= 90
    && typeof value.longitude === 'number'
    && Number.isFinite(value.longitude)
    && value.longitude >= -180 && value.longitude <= 180
    && finiteOrUndefined(value.ellipsoidalHeightM);
}

function validModel(value: unknown): value is SelectionModel {
  return value === 'gleason' || value === 'ae' || value === 'wgs84';
}

function validPlaceIdentity(value: unknown): value is Omit<PlaceSelection,'latitude'|'longitude'> {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && value.id.length > 0
    && ['country','city','sea','ocean','river','mountain','airport'].includes(String(value.category))
    && typeof value.name === 'string' && value.name.length > 0
    && stringOrUndefined(value.nameAr)
    && stringOrUndefined(value.countryCode)
    && typeof value.sourceId === 'string' && value.sourceId.length > 0
    && typeof value.sourceRecordId === 'string' && value.sourceRecordId.length > 0
    && stringOrNull(value.sourceVersion)
    && stringOrNull(value.sourceUrl)
    && stringOrNull(value.sourceLicense)
    && stringOrNull(value.coordinateClassification)
    && typeof value.sourceLabel === 'string' && value.sourceLabel.length > 0
    && (value.provenanceStatus === 'complete' || value.provenanceStatus === 'legacy-or-incomplete')
    && typeof value.offline === 'boolean';
}

function decodeSelection(value: unknown): GeographicSelection | null {
  if (value === null) return null;
  if (!isRecord(value)
    || value.schemaVersion !== 1
    || value.referenceFrame !== 'WGS84'
    || value.angularUnits !== 'degrees'
    || !validModel(value.model)
    || !validPoint(value.point)) return null;

  if (value.kind === 'free-point' && value.origin === 'map' && value.place === null) {
    return selectFreePoint(value.model,value.point);
  }
  if (value.kind === 'place' && value.origin === 'search' && value.model === 'wgs84' && validPlaceIdentity(value.place)) {
    return selectPlace({ ...value.place, latitude:value.point.latitude, longitude:value.point.longitude });
  }
  return null;
}

export function encodePhase5State(selection: GeographicSelection | null): Readonly<PersistedPhase5StateV1> {
  return Object.freeze({ schemaVersion:PHASE5_STATE_SCHEMA_VERSION, selection });
}

export function decodePhase5State(value: unknown): { kind:'decoded'; state:Readonly<PersistedPhase5StateV1> }
  | { kind:'unsupported-version'; version:unknown }
  | { kind:'invalid' } {
  if (!isRecord(value)) return {kind:'invalid'};
  if (value.schemaVersion !== PHASE5_STATE_SCHEMA_VERSION) {
    return {kind:'unsupported-version',version:value.schemaVersion};
  }
  if (!('selection' in value)) return {kind:'invalid'};
  if (value.selection === null) return {kind:'decoded',state:encodePhase5State(null)};
  const selection=decodeSelection(value.selection);
  return selection
    ? {kind:'decoded',state:encodePhase5State(selection)}
    : {kind:'invalid'};
}

function findInstalledPlace(selection:Extract<GeographicSelection,{kind:'place'}>,packs:InstalledSearchPacks):OfflinePlace|null {
  for(const index of activeIndexes(packs)){
    const entry=index.entries.find(item=>item.id===selection.place.id);
    if(!entry) continue;
    if(entry.category!==selection.place.category) continue;
    if(entry.sourceId!==selection.place.sourceId || entry.sourceRecordId!==selection.place.sourceRecordId) continue;
    if(entry.latitude!==selection.point.latitude || entry.longitude!==selection.point.longitude) continue;
    if(selection.place.sourceVersion!==null && (entry.source?.version??null)!==selection.place.sourceVersion) continue;
    return entry;
  }
  return null;
}

export function restorePhase5State(value:unknown,packs:InstalledSearchPacks):Readonly<Phase5RestoreResult> {
  if (value === undefined) return Object.freeze({status:'empty',selection:null,reason:null});
  const decoded=decodePhase5State(value);
  if(decoded.kind==='unsupported-version'){
    return Object.freeze({status:'discarded-unsupported-version',selection:null,reason:`unsupported schema version: ${String(decoded.version)}`});
  }
  if(decoded.kind==='invalid'){
    return Object.freeze({status:'discarded-invalid',selection:null,reason:'invalid persisted Phase 5 state'});
  }
  const selection=decoded.state.selection;
  if(!selection) return Object.freeze({status:'empty',selection:null,reason:null});
  if(selection.kind==='free-point'){
    return Object.freeze({status:'restored-free-point',selection,reason:null});
  }

  const installed=findInstalledPlace(selection,packs);
  if(installed){
    const restored=selectPlace({
      id:installed.id,
      category:installed.category,
      name:installed.name,
      nameAr:installed.nameAr,
      countryCode:installed.countryCode,
      latitude:installed.latitude,
      longitude:installed.longitude,
      sourceId:installed.sourceId,
      sourceRecordId:installed.sourceRecordId,
      sourceVersion:installed.source?.version??null,
      sourceUrl:installed.source?.sourceUrl??null,
      sourceLicense:installed.source?.license??null,
      coordinateClassification:installed.coordinateClassification??null,
      sourceLabel:installed.source
        ? `${installed.source.name}${installed.source.version?` ${installed.source.version}`:''}`
        : installed.sourceId,
      provenanceStatus:installed.source?.version&&installed.coordinateClassification?'complete':'legacy-or-incomplete',
      offline:true,
    });
    return Object.freeze({status:'restored-place',selection:restored,reason:null});
  }

  // Preserve only the verified geographic coordinate; never carry unverifiable
  // place identity across an offline restore.
  const pointOnly=selectFreePoint('wgs84',selection.point);
  return Object.freeze({
    status:'restored-point-only',
    selection:pointOnly,
    reason:'saved place identity was not found unchanged in installed offline packs',
  });
}
