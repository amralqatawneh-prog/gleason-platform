import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
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
import { ModelLaboratory } from './comparison/ModelLaboratory';
import { loadPhase5Selection, savePhase5Selection } from './offline/phase5StateStore';

export default function App() {
  const [locale,setLocale]=useState<Locale>('ar');
  const [online,setOnline]=useState(navigator.onLine);
  const [serverState,setServerState]=useState<'checking'|'connected'|'offline'>('checking');
  const [{selection,revision},dispatchSelection]=useReducer(selectionReducer,INITIAL_SELECTION_STATE);
  const selectionStateRef=useRef({selection,revision});
  const userSelectionStartedRef=useRef(false);
  const [restoreStatus,setRestoreStatus]=useState<'loading'|'empty'|'restored'|'missing-local-place'|'unsupported-version'|'invalid'|'superseded'|'error'>('loading');
  const [saveStatus,setSaveStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle');
  const selectedPlace=selection?.place??null;
  const [globeLayers,setGlobeLayers]=useState<GlobeLayerVisibility>(DEFAULT_GLOBE_LAYERS);
  const [globePlaces,setGlobePlaces]=useState<OfflinePlace[]>([]);
  const capabilities=useMemo(()=>detectCapabilities(),[]);
  const t=strings[locale]; const direction=locale==='ar'?'rtl':'ltr';

  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=direction;},[locale,direction]);
  useEffect(()=>{const sync=()=>setOnline(navigator.onLine);addEventListener('online',sync);addEventListener('offline',sync);return()=>{removeEventListener('online',sync);removeEventListener('offline',sync);};},[]);
  useEffect(()=>{fetchCapabilities().then((result)=>setServerState(result?'connected':'offline'));},[online]);
  useEffect(()=>{selectionStateRef.current={selection,revision};},[selection,revision]);
  useEffect(()=>{
    let mounted=true;
    void loadPhase5Selection().then(result=>{
      if(!mounted)return;
      if(result.status==='restored'){
        const current=selectionStateRef.current;
        if(!userSelectionStartedRef.current && current.revision===0 && current.selection===null){
          dispatchSelection({type:'restore',selection:result.selection});
          setRestoreStatus('restored');
        }else setRestoreStatus('superseded');
      }else setRestoreStatus(result.status);
    }).catch(()=>{if(mounted)setRestoreStatus('error');});
    return()=>{mounted=false;};
  },[]);
  useEffect(()=>{
    if(revision===0 || !selection)return;
    let mounted=true;
    setSaveStatus('saving');
    void savePhase5Selection(selection)
      .then(()=>{if(mounted)setSaveStatus('saved');})
      .catch(()=>{if(mounted)setSaveStatus('error');});
    return()=>{mounted=false;};
  },[selection,revision]);
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

  const handlePoint=useCallback((model:Phase2MapModel,point:GeoPoint)=>{
    userSelectionStartedRef.current=true;
    dispatchSelection({type:'point',model,point});
  },[]);
  const handleReferencePoint=useCallback((point:GeoPoint)=>{
    userSelectionStartedRef.current=true;
    dispatchSelection({type:'point',model:'wgs84',point});
  },[]);
  const locatePlace=useCallback((place:PlaceSelection)=>{
    userSelectionStartedRef.current=true;
    dispatchSelection({type:'place',place});
  },[]);
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

  return <div className="app-shell" dir={direction} data-selection-revision={revision} data-persistence-restore={restoreStatus} data-persistence-save={saveStatus}>
    <header className="topbar"><div className="brand"><span className="brand-mark">◎</span><div><h1>{t.title}</h1><p>{t.subtitle} · {RELEASE_NAME}</p></div></div><div className="top-actions"><span className={`status-dot ${online?'ok':'warn'}`}>{online?t.online:t.offlineNow}</span><span className="status-dot">API: {serverState}</span><button className="secondary" onClick={()=>setLocale(locale==='ar'?'en':'ar')}>{locale==='ar'?'English':'العربية'}</button></div></header>
    <div className="workspace phase2-workspace">
      <aside className="sidebar">
        <section className="phase-card"><h2>{locale==='ar'?'تفاصيل الكرة المرجعية WGS84':'Detailed WGS84 reference globe'}</h2><p>{locale==='ar'?'استكشف الإحداثيات والمسافات والمعالم، واحفظ حزم الدول لاستخدامها دون اتصال.':'Explore coordinates, distances and places. Save country packs to use them offline.'}</p></section>
        <GlobeLayerControls locale={locale} layers={globeLayers} onChange={changeGlobeLayers} featureCount={globePlaces.length}/>
        <PlaceSearch locale={locale} onSelectPlace={locatePlace} selectedPlaceId={selectedPlace?.id}/>
        <section className="phase-card"><h2>{locale==='ar'?'النماذج المتاحة':'Available models'}</h2><div className="model-key"><span className="dot historical"/>Gleason Historical <small>DERIVED</small></div><div className="model-key"><span className="dot reference"/>Azimuthal Equidistant <small>REFERENCE</small></div><div className="model-key"><span className="dot reference"/>WGS84 Reference <small>REFERENCE_RESULT</small></div></section>
      </aside>
      <main className="phase2-main">
        <section className="reference-workspace"><ReferenceGlobe capabilities={capabilities} locale={locale} layers={globeLayers} layerPlaces={globePlaces} focusPoint={selectedPlace?selection!.point:null} selectionPoint={selection?.point??null} selectionLabel={selectedPlaceName} onPoint={handleReferencePoint}/></section>
        <GeodesicInspector locale={locale} currentPoint={currentWgs84Point}/>
        <ModelLaboratory locale={locale} selection={selection}/>
        <div className="projection-grid"><ProjectionMap model="gleason" locale={locale} onPoint={handlePoint} selectionPoint={selection?.point??null} selectionLabel={selectedPlaceName}/><ProjectionMap model="ae" locale={locale} onPoint={handlePoint} selectionPoint={selection?.point??null} selectionLabel={selectedPlaceName}/></div><SourceViewer locale={locale}/>
      </main>
      <aside className="inspector"><h2>{locale==='ar'?'المفتش الجغرافي':'Geographic inspector'}</h2>{selection?<dl><Metric label={locale==='ar'?'النموذج':'Model'} value={selection.model}/><Metric label="Latitude" value={selection.point.latitude.toFixed(6)}/><Metric label="Longitude" value={selection.point.longitude.toFixed(6)}/><Metric label={locale==='ar'?'الحالة':'Status'} value={selection.model==='wgs84'?'WGS84 reference selection ✓':'local inverse ✓'}/></dl>:<p className="muted">{locale==='ar'?'انقر داخل العرض المرجعي أو اختر مكانًا من البحث.':'Click the reference view or select a place from search.'}</p>}{selectedPlace&&<div className="notice place-provenance"><strong>{selectedPlaceName}</strong><span>ID: {selectedPlace.id}</span><span>{selectedPlace.category} · {selectedPlace.countryCode??'—'}</span><span>{locale==='ar'?'المصدر':'Source'}: {selectedPlace.sourceLabel}</span><span>{locale==='ar'?'معرّف المصدر':'Source ID'}: {selectedPlace.sourceId}</span><span>{locale==='ar'?'سجل المصدر':'Source record'}: {selectedPlace.sourceRecordId}</span><span>{locale==='ar'?'إصدار المصدر':'Source version'}: {selectedPlace.sourceVersion??(locale==='ar'?'غير معروف':'Unknown')}</span><span>{locale==='ar'?'نوع الإحداثيات':'Coordinate classification'}: {selectedPlace.coordinateClassification??(locale==='ar'?'غير موثّق في الحزمة القديمة':'Unknown in legacy pack')}</span><span>{locale==='ar'?'الترخيص':'License'}: {selectedPlace.sourceLicense??'—'}</span>{selectedPlace.sourceUrl&&/^https?:\/\//i.test(selectedPlace.sourceUrl)&&<a href={selectedPlace.sourceUrl} target="_blank" rel="noreferrer">{locale==='ar'?'رابط المصدر':'Source link'}</a>}<span>{selectedPlace.offline?'OFFLINE canonical record':'ONLINE canonical record'}</span></div>}<div className="notice"><strong>{locale==='ar'?'الشفافية المصدرية':'Source transparency'}</strong><span>PLACE SOURCE PROVENANCE ≠ REFERENCE_RESULT</span></div><div className="notice"><strong>{locale==='ar'?'طبقات محلية':'Offline layers'}</strong><span>Natural Earth / Phase 3 cached indexes · {globePlaces.length} features</span></div><div className="notice"><strong>{locale==='ar'?'التوافق':'Compatibility'}</strong><span>{capabilities.webgl2?'WebGL2 3D':'2D fallback'} · {capabilities.touch?'Touch capable':'Pointer device'} · PWA</span></div><PersistenceNotice locale={locale} restoreStatus={restoreStatus} saveStatus={saveStatus}/></aside>
    </div>
    <footer className="statusbar"><span>{RELEASE_NAME} · {locale==='ar'?'المرحلة الخامسة — حفظ محلي مُصدَّر':'Phase 5 — versioned local persistence'}</span><span>WGS84-0.4.0 reference</span><span>Bundled countries + cached Phase 3 layers</span></footer>
  </div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><dt>{label}</dt><dd>{value}</dd></div>;}


function PersistenceNotice({
  locale,restoreStatus,saveStatus,
}:{
  locale:Locale;
  restoreStatus:'loading'|'empty'|'restored'|'missing-local-place'|'unsupported-version'|'invalid'|'superseded'|'error';
  saveStatus:'idle'|'saving'|'saved'|'error';
}){
  const ar={
    loading:'جارٍ فحص الحالة المحلية…',
    empty:'لا توجد حالة محفوظة.',
    restored:'تمت استعادة الاختيار من الحالة المحلية الموثوقة.',
    'missing-local-place':'لم تُستعد هوية المكان لأن السجل غير موجود في الحزم المحلية المثبتة.',
    'unsupported-version':'تم تجاهل حالة محفوظة بإصدار غير مدعوم.',
    invalid:'تم تجاهل حالة محلية تالفة أو غير صالحة.',
    superseded:'لم تُطبّق الاستعادة لأن اختيارًا أحدث حدث في هذه الجلسة.',
    error:'تعذر قراءة التخزين المحلي.',
  } as const;
  const en={
    loading:'Checking local state…',
    empty:'No saved local state.',
    restored:'Selection restored from trusted local state.',
    'missing-local-place':'Place identity was not restored because the record is absent from installed local packs.',
    'unsupported-version':'Saved state uses an unsupported schema version and was ignored.',
    invalid:'Malformed or invalid local state was ignored.',
    superseded:'Restore was skipped because a newer selection occurred in this session.',
    error:'Local state could not be read.',
  } as const;
  const saveAr={idle:'لم يحدث حفظ جديد في هذه الجلسة.',saving:'جارٍ حفظ الاختيار…',saved:'تم حفظ أحدث اختيار محليًا.',error:'تعذر حفظ أحدث اختيار.'} as const;
  const saveEn={idle:'No new save in this session.',saving:'Saving selection…',saved:'Latest selection saved locally.',error:'Latest selection could not be saved.'} as const;
  return <div className="notice phase5-persistence">
    <strong>{locale==='ar'?'الحالة المحلية P5.8':'P5.8 local state'}</strong>
    <span>{locale==='ar'?ar[restoreStatus]:en[restoreStatus]}</span>
    <span>{locale==='ar'?saveAr[saveStatus]:saveEn[saveStatus]}</span>
    <small>{locale==='ar'?'يُحفظ الاختيار المشترك فقط؛ الكاميرات والمسارات والخدمات المستقبلية غير مخزنة.':'Only the shared selection is persisted; cameras, routes and future services are not stored.'}</small>
  </div>;
}
