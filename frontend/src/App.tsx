import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { ProjectionMap, type Phase2MapModel } from './map2d/ProjectionMap';
import type { GeoPoint } from './models/projectionTypes';
import type { OfflinePlace } from './offline/searchIndex';
import { refreshCoreSearchPack, SEARCH_PACKS_CHANGED } from './offline/searchPackStore';
import { fetchCapabilities } from './api';
import { type Locale, strings } from './i18n';
import { detectCapabilities } from './platform/capabilities';
import { GeodesicInspector, type GeodesicNamedPoint } from './reference/GeodesicInspector';
import { GlobeLayerControls } from './reference/GlobeLayerControls';
import { DEFAULT_GLOBE_LAYERS, loadGlobeLayerVisibility, loadGlobePlaces, saveGlobeLayerVisibility, type GlobeLayerVisibility } from './reference/globeLayers';
import { ReferenceGlobe } from './reference/ReferenceGlobe';
import { PlaceSearch, type PlaceSelection } from './search/PlaceSearch';
import { SourceViewer } from './source/SourceViewer';
import { RELEASE_NAME } from './shared/version';
import { INITIAL_SELECTION_STATE, selectionReducer } from './comparison/selectionState';
import { selectFreePoint, type SelectionModel } from './comparison/geographicSelection';
import { ModelLaboratory } from './comparison/ModelLaboratory';
import { type Phase5RestoreStatus } from './comparison/statePersistence';
import { loadPhase5State, savePhase5State } from './comparison/statePersistenceStore';
import { OrderedRoutePanel } from './measurement/OrderedRoutePanel';
import { INITIAL_ORDERED_ROUTE_STATE, orderedRouteReducer } from './measurement/routeState';

export default function App() {
  const [locale,setLocale]=useState<Locale>('ar');
  const [online,setOnline]=useState(navigator.onLine);
  const [serverState,setServerState]=useState<'checking'|'connected'|'offline'>('checking');
  const [{selection,revision},dispatchSelection]=useReducer(selectionReducer,INITIAL_SELECTION_STATE);
  const [routeState,dispatchRoute]=useReducer(orderedRouteReducer,INITIAL_ORDERED_ROUTE_STATE);
  const [routePickMode,setRoutePickMode]=useState(false);
  const [persistenceStatus,setPersistenceStatus]=useState<Phase5RestoreStatus|'loading'|'save-error'>('loading');
  const [persistenceReady,setPersistenceReady]=useState(false);
  const selectedPlace=selection?.place??null;
  const [globeLayers,setGlobeLayers]=useState<GlobeLayerVisibility>(DEFAULT_GLOBE_LAYERS);
  const [globePlaces,setGlobePlaces]=useState<OfflinePlace[]>([]);
  const capabilities=useMemo(()=>detectCapabilities(),[]);
  const t=strings[locale]; const direction=locale==='ar'?'rtl':'ltr';

  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=direction;},[locale,direction]);
  useEffect(()=>{
    let active=true;
    void loadPhase5State().then(result=>{
      if(!active)return;
      dispatchSelection({type:'restore',selection:result.selection});
      setPersistenceStatus(result.status);
      setPersistenceReady(true);
    }).catch(()=>{
      if(!active)return;
      setPersistenceStatus('discarded-invalid');
      setPersistenceReady(true);
    });
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    if(!persistenceReady)return;
    let active=true;
    void savePhase5State(selection).catch(()=>{if(active)setPersistenceStatus('save-error');});
    return()=>{active=false;};
  },[selection,persistenceReady]);

  useEffect(()=>{const sync=()=>setOnline(navigator.onLine);addEventListener('online',sync);addEventListener('offline',sync);return()=>{removeEventListener('online',sync);removeEventListener('offline',sync);};},[]);
  useEffect(()=>{fetchCapabilities().then((result)=>setServerState(result?'connected':'offline'));},[online]);
  useEffect(()=>{
    let mounted=true;
    void loadGlobeLayerVisibility().then(layers=>{if(mounted)setGlobeLayers(layers);}).catch(()=>undefined);
    if(navigator.onLine)void refreshCoreSearchPack().catch(()=>undefined);
    return()=>{mounted=false;};
  },[]);
  useEffect(()=>{
    let revision=0;
    const refresh=()=>{
      const request=++revision;
      void loadGlobePlaces(globeLayers).then(places=>{if(request===revision)setGlobePlaces(places);}).catch(()=>{if(request===revision)setGlobePlaces([]);});
    };
    refresh();window.addEventListener(SEARCH_PACKS_CHANGED,refresh);
    return()=>{revision++;window.removeEventListener(SEARCH_PACKS_CHANGED,refresh);};
  },[globeLayers]);

  const handlePoint=useCallback((model:SelectionModel,point:GeoPoint)=>{
    const routeSelection=selectFreePoint(model,point);
    dispatchSelection({type:'point',model,point});
    if(routePickMode)dispatchRoute({type:'add-selection',selection:routeSelection});
  },[routePickMode]);
  const locatePlace=useCallback((place:PlaceSelection)=>{dispatchSelection({type:'place',place});},[]);
  const changeGlobeLayers=useCallback((next:GlobeLayerVisibility)=>{
    setGlobeLayers(next);
    void saveGlobeLayerVisibility(next).catch(()=>undefined);
  },[]);
  const selectedPlaceName=selectedPlace?(locale==='ar'&&selectedPlace.nameAr?selectedPlace.nameAr:selectedPlace.name):undefined;
  const currentWgs84Point:GeodesicNamedPoint|null=selection?{
    latitude:selection.point.latitude,
    longitude:selection.point.longitude,
    label:selectedPlaceName,
  }:null;

  return <div className="app-shell" dir={direction} data-selection-revision={revision} data-persistence-status={persistenceStatus} data-route-map-add-mode={routePickMode?'true':'false'}>
    <header className="topbar"><div className="brand"><span className="brand-mark">◎</span><div><h1>{t.title}</h1><p>{t.subtitle} · {RELEASE_NAME}</p></div></div><div className="top-actions"><span className={`status-dot ${online?'ok':'warn'}`}>{online?t.online:t.offlineNow}</span><span className="status-dot">API: {serverState}</span><button className="secondary" onClick={()=>setLocale(locale==='ar'?'en':'ar')}>{locale==='ar'?'English':'العربية'}</button></div></header>
    <div className="workspace phase2-workspace">
      <aside className="sidebar">
        <section className="phase-card"><h2>{locale==='ar'?'تفاصيل الكرة المرجعية WGS84':'Detailed WGS84 reference globe'}</h2><p>{locale==='ar'?'استكشف الإحداثيات والمسافات والمعالم، واحفظ حزم الدول لاستخدامها دون اتصال.':'Explore coordinates, distances and places. Save country packs to use them offline.'}</p></section>
        <GlobeLayerControls locale={locale} layers={globeLayers} onChange={changeGlobeLayers} featureCount={globePlaces.length}/>
        <PlaceSearch locale={locale} onSelectPlace={locatePlace} selectedPlaceId={selectedPlace?.id}/>
        <section className="phase-card"><h2>{locale==='ar'?'النماذج المتاحة':'Available models'}</h2><div className="model-key"><span className="dot historical"/>Gleason Historical <small>DERIVED</small></div><div className="model-key"><span className="dot reference"/>Azimuthal Equidistant <small>REFERENCE</small></div><div className="model-key"><span className="dot reference"/>WGS84 Reference <small>REFERENCE_RESULT</small></div></section>
      </aside>
      <main className="phase2-main">
        <section className="reference-workspace"><ReferenceGlobe capabilities={capabilities} locale={locale} layers={globeLayers} layerPlaces={globePlaces} focusPoint={selectedPlace?selection!.point:null} selectionPoint={selection?.point??null} selectionLabel={selectedPlaceName} onPoint={(point)=>handlePoint('wgs84',point)}/></section>
        <GeodesicInspector locale={locale} currentPoint={currentWgs84Point}/>
        <OrderedRoutePanel locale={locale} selection={selection} state={routeState} dispatch={dispatchRoute} mapAddMode={routePickMode} onMapAddModeChange={setRoutePickMode}/>
        <ModelLaboratory locale={locale} selection={selection}/>
        <div className="projection-grid"><ProjectionMap model="gleason" locale={locale} onPoint={handlePoint} selectionPoint={selection?.point??null} selectionLabel={selectedPlaceName}/><ProjectionMap model="ae" locale={locale} onPoint={handlePoint} selectionPoint={selection?.point??null} selectionLabel={selectedPlaceName}/></div><SourceViewer locale={locale}/>
      </main>
      <aside className="inspector"><h2>{locale==='ar'?'المفتش الجغرافي':'Geographic inspector'}</h2>{selection?<dl><Metric label={locale==='ar'?'النموذج':'Model'} value={selection.model}/><Metric label="Latitude" value={selection.point.latitude.toFixed(6)}/><Metric label="Longitude" value={selection.point.longitude.toFixed(6)}/><Metric label={locale==='ar'?'الحالة':'Status'} value={selection.model==='wgs84'?'WGS84 reference selection ✓':'local inverse ✓'}/></dl>:<p className="muted">{locale==='ar'?'انقر داخل العرض المرجعي أو اختر مكانًا من البحث.':'Click the reference view or select a place from search.'}</p>}{selectedPlace&&<div className="notice place-provenance"><strong>{selectedPlaceName}</strong><span>ID: {selectedPlace.id}</span><span>{selectedPlace.category} · {selectedPlace.countryCode??'—'}</span><span>{locale==='ar'?'المصدر':'Source'}: {selectedPlace.sourceLabel}</span><span>{locale==='ar'?'معرّف المصدر':'Source ID'}: {selectedPlace.sourceId}</span><span>{locale==='ar'?'سجل المصدر':'Source record'}: {selectedPlace.sourceRecordId}</span><span>{locale==='ar'?'إصدار المصدر':'Source version'}: {selectedPlace.sourceVersion??(locale==='ar'?'غير معروف':'Unknown')}</span><span>{locale==='ar'?'نوع الإحداثيات':'Coordinate classification'}: {selectedPlace.coordinateClassification??(locale==='ar'?'غير موثّق في الحزمة القديمة':'Unknown in legacy pack')}</span><span>{locale==='ar'?'الترخيص':'License'}: {selectedPlace.sourceLicense??'—'}</span>{selectedPlace.sourceUrl&&/^https?:\/\//i.test(selectedPlace.sourceUrl)&&<a href={selectedPlace.sourceUrl} target="_blank" rel="noreferrer">{locale==='ar'?'رابط المصدر':'Source link'}</a>}<span>{selectedPlace.offline?'OFFLINE canonical record':'ONLINE canonical record'}</span></div>}<div className="notice persistence-status" data-phase5-persistence-status={persistenceStatus}><strong>{locale==='ar'?'حفظ حالة المرحلة الخامسة':'Phase 5 state persistence'}</strong><span>{locale==='ar'
  ? persistenceStatus==='loading'?'جارٍ استعادة الحالة المحلية…'
    : persistenceStatus==='restored-place'?'تمت استعادة المكان من الحزم المحلية المثبتة.'
    : persistenceStatus==='restored-free-point'?'تمت استعادة النقطة الجغرافية المحلية.'
    : persistenceStatus==='restored-point-only'?'تمت استعادة الإحداثيات فقط؛ لم تُعتمد هوية المكان المحفوظة لعدم وجود سجل محلي مطابق.'
    : persistenceStatus==='discarded-unsupported-version'?'تم تجاهل حالة محفوظة بإصدار غير مدعوم.'
    : persistenceStatus==='discarded-invalid'?'تم تجاهل حالة محلية تالفة أو غير صالحة.'
    : persistenceStatus==='save-error'?'تعذر حفظ الحالة المحلية الحالية.'
    :'لا توجد حالة محفوظة سابقة.'
  : persistenceStatus==='loading'?'Restoring local Phase 5 state…'
    : persistenceStatus==='restored-place'?'Place restored from an installed local pack.'
    : persistenceStatus==='restored-free-point'?'Local geographic point restored.'
    : persistenceStatus==='restored-point-only'?'Coordinates restored only; saved place identity was not trusted without an unchanged installed record.'
    : persistenceStatus==='discarded-unsupported-version'?'Stored state with an unsupported version was ignored.'
    : persistenceStatus==='discarded-invalid'?'Malformed or invalid local state was ignored.'
    : persistenceStatus==='save-error'?'The current local state could not be saved.'
    :'No previous saved state.'}</span></div><div className="notice"><strong>{locale==='ar'?'الشفافية المصدرية':'Source transparency'}</strong><span>PLACE SOURCE PROVENANCE ≠ REFERENCE_RESULT</span></div><div className="notice"><strong>{locale==='ar'?'طبقات محلية':'Offline layers'}</strong><span>Natural Earth / Phase 3 cached indexes · {globePlaces.length} features</span></div><div className="notice"><strong>{locale==='ar'?'التوافق':'Compatibility'}</strong><span>{capabilities.webgl2?'WebGL2 3D':'2D fallback'} · {capabilities.touch?'Touch capable':'Pointer device'} · PWA</span></div></aside>
    </div>
    <footer className="statusbar"><span>{RELEASE_NAME} · {locale==='ar'?'المرحلة السادسة — P6.2 حالة المسار المرتب':'Phase 6 — P6.2 ordered route state'}</span><span>WGS84-0.4.0 reference</span><span>Bundled countries + cached Phase 3 layers</span></footer>
  </div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><dt>{label}</dt><dd>{value}</dd></div>;}
