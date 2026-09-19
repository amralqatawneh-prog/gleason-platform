import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { selectPlace, selectFreePoint, type GeographicSelection } from './comparison/geographicSelection';

export default function App() {
  const [locale,setLocale]=useState<Locale>('ar');
  const [online,setOnline]=useState(navigator.onLine);
  const [serverState,setServerState]=useState<'checking'|'connected'|'offline'>('checking');
  const [selection,setSelection]=useState<GeographicSelection|null>(null);
  const selectedPlace=selection?.place??null;
  const [globeLayers,setGlobeLayers]=useState<GlobeLayerVisibility>(DEFAULT_GLOBE_LAYERS);
  const [globePlaces,setGlobePlaces]=useState<OfflinePlace[]>([]);
  const capabilities=useMemo(()=>detectCapabilities(),[]);
  const t=strings[locale]; const direction=locale==='ar'?'rtl':'ltr';

  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=direction;},[locale,direction]);
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

  const handlePoint=useCallback((model:Phase2MapModel,point:GeoPoint)=>setSelection(selectFreePoint(model,point)),[]);
  const locatePlace=useCallback((place:PlaceSelection)=>{setSelection(selectPlace(place));},[]);
  const changeGlobeLayers=useCallback((next:GlobeLayerVisibility)=>{
    setGlobeLayers(next);
    void saveGlobeLayerVisibility(next).catch(()=>undefined);
  },[]);
  const selectedPlaceName=selectedPlace?(locale==='ar'&&selectedPlace.nameAr?selectedPlace.nameAr:selectedPlace.name):undefined;
  const currentWgs84Point:GeodesicNamedPoint|null=selection?.model==='wgs84'?{
    latitude:selection.point.latitude,
    longitude:selection.point.longitude,
    label:selectedPlaceName,
  }:null;

  return <div className="app-shell" dir={direction}>
    <header className="topbar"><div className="brand"><span className="brand-mark">◎</span><div><h1>{t.title}</h1><p>{t.subtitle} · {RELEASE_NAME}</p></div></div><div className="top-actions"><span className={`status-dot ${online?'ok':'warn'}`}>{online?t.online:t.offlineNow}</span><span className="status-dot">API: {serverState}</span><button className="secondary" onClick={()=>setLocale(locale==='ar'?'en':'ar')}>{locale==='ar'?'English':'العربية'}</button></div></header>
    <div className="workspace phase2-workspace">
      <aside className="sidebar">
        <section className="phase-card"><h2>{locale==='ar'?'تفاصيل الكرة المرجعية WGS84':'Detailed WGS84 reference globe'}</h2><p>{locale==='ar'?'استكشف الإحداثيات والمسافات والمعالم، واحفظ حزم الدول لاستخدامها دون اتصال.':'Explore coordinates, distances and places. Save country packs to use them offline.'}</p></section>
        <GlobeLayerControls locale={locale} layers={globeLayers} onChange={changeGlobeLayers} featureCount={globePlaces.length}/>
        <PlaceSearch locale={locale} onSelectPlace={locatePlace} selectedPlaceId={selectedPlace?.id}/>
        <section className="phase-card"><h2>{locale==='ar'?'النماذج المتاحة':'Available models'}</h2><div className="model-key"><span className="dot historical"/>Gleason Historical <small>DERIVED</small></div><div className="model-key"><span className="dot reference"/>Azimuthal Equidistant <small>REFERENCE</small></div><div className="model-key"><span className="dot reference"/>WGS84 Reference <small>REFERENCE_RESULT</small></div></section>
      </aside>
      <main className="phase2-main">
        <section className="reference-workspace"><ReferenceGlobe capabilities={capabilities} locale={locale} layers={globeLayers} layerPlaces={globePlaces} focusPoint={selectedPlace?selection!.point:null} focusLabel={selectedPlaceName} onPoint={(point)=>setSelection(selectFreePoint('wgs84',point))}/></section>
        <GeodesicInspector locale={locale} currentPoint={currentWgs84Point}/>
        <div className="projection-grid"><ProjectionMap model="gleason" locale={locale} onPoint={handlePoint}/><ProjectionMap model="ae" locale={locale} onPoint={handlePoint}/></div><SourceViewer locale={locale}/>
      </main>
      <aside className="inspector"><h2>{locale==='ar'?'المفتش الجغرافي':'Geographic inspector'}</h2>{selection?<dl><Metric label={locale==='ar'?'النموذج':'Model'} value={selection.model}/><Metric label="Latitude" value={selection.point.latitude.toFixed(6)}/><Metric label="Longitude" value={selection.point.longitude.toFixed(6)}/><Metric label={locale==='ar'?'الحالة':'Status'} value={selection.model==='wgs84'?'WGS84 reference selection ✓':'local inverse ✓'}/></dl>:<p className="muted">{locale==='ar'?'انقر داخل العرض المرجعي أو اختر مكانًا من البحث.':'Click the reference view or select a place from search.'}</p>}{selectedPlace&&<div className="notice place-provenance"><strong>{selectedPlaceName}</strong><span>ID: {selectedPlace.id}</span><span>{selectedPlace.category} · {selectedPlace.countryCode??'—'}</span><span>{locale==='ar'?'المصدر':'Source'}: {selectedPlace.sourceLabel}</span><span>{locale==='ar'?'معرّف المصدر':'Source ID'}: {selectedPlace.sourceId}</span><span>{locale==='ar'?'سجل المصدر':'Source record'}: {selectedPlace.sourceRecordId}</span><span>{locale==='ar'?'إصدار المصدر':'Source version'}: {selectedPlace.sourceVersion??(locale==='ar'?'غير معروف':'Unknown')}</span><span>{locale==='ar'?'نوع الإحداثيات':'Coordinate classification'}: {selectedPlace.coordinateClassification??(locale==='ar'?'غير موثّق في الحزمة القديمة':'Unknown in legacy pack')}</span><span>{locale==='ar'?'الترخيص':'License'}: {selectedPlace.sourceLicense??'—'}</span>{selectedPlace.sourceUrl&&/^https?:\/\//i.test(selectedPlace.sourceUrl)&&<a href={selectedPlace.sourceUrl} target="_blank" rel="noreferrer">{locale==='ar'?'رابط المصدر':'Source link'}</a>}<span>{selectedPlace.offline?'OFFLINE canonical record':'ONLINE canonical record'}</span></div>}<div className="notice"><strong>{locale==='ar'?'الشفافية المصدرية':'Source transparency'}</strong><span>PLACE SOURCE PROVENANCE ≠ REFERENCE_RESULT</span></div><div className="notice"><strong>{locale==='ar'?'طبقات محلية':'Offline layers'}</strong><span>Natural Earth / Phase 3 cached indexes · {globePlaces.length} features</span></div><div className="notice"><strong>{locale==='ar'?'التوافق':'Compatibility'}</strong><span>{capabilities.webgl2?'WebGL2 3D':'2D fallback'} · {capabilities.touch?'Touch capable':'Pointer device'} · PWA</span></div></aside>
    </div>
    <footer className="statusbar"><span>{RELEASE_NAME} · {locale==='ar'?'المرحلة الخامسة قيد التنفيذ — الحالة المشتركة':'Phase 5 in progress — shared state'}</span><span>WGS84-0.4.0 reference</span><span>Bundled countries + cached Phase 3 layers</span></footer>
  </div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><dt>{label}</dt><dd>{value}</dd></div>;}
