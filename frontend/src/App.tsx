import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProjectionMap, type Phase2MapModel } from './map2d/ProjectionMap';
import type { GeoPoint } from './models/projectionTypes';
import { fetchCapabilities } from './api';
import { type Locale, strings } from './i18n';
import { detectCapabilities } from './platform/capabilities';
import { SourceViewer } from './source/SourceViewer';
import { RELEASE_NAME } from './shared/version';

interface Selection { model: Phase2MapModel; point: GeoPoint; }

export default function App() {
  const [locale,setLocale]=useState<Locale>('ar');
  const [online,setOnline]=useState(navigator.onLine);
  const [serverState,setServerState]=useState<'checking'|'connected'|'offline'>('checking');
  const [selection,setSelection]=useState<Selection|null>(null);
  const capabilities=useMemo(()=>detectCapabilities(),[]);
  const t=strings[locale]; const direction=locale==='ar'?'rtl':'ltr';
  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=direction;},[locale,direction]);
  useEffect(()=>{const sync=()=>setOnline(navigator.onLine);addEventListener('online',sync);addEventListener('offline',sync);return()=>{removeEventListener('online',sync);removeEventListener('offline',sync);};},[]);
  useEffect(()=>{fetchCapabilities().then((result)=>setServerState(result?'connected':'offline'));},[online]);
  const handlePoint=useCallback((model:Phase2MapModel,point:GeoPoint)=>setSelection({model,point}),[]);
  return <div className="app-shell" dir={direction}>
    <header className="topbar"><div className="brand"><span className="brand-mark">◎</span><div><h1>{t.title}</h1><p>{t.subtitle} · {RELEASE_NAME}</p></div></div><div className="top-actions"><span className={`status-dot ${online?'ok':'warn'}`}>{online?t.online:t.offlineNow}</span><span className="status-dot">API: {serverState}</span><button className="secondary" onClick={()=>setLocale(locale==='ar'?'en':'ar')}>{locale==='ar'?'English':'العربية'}</button></div></header>
    <div className="workspace phase2-workspace">
      <aside className="sidebar">
        <section className="phase-card"><span className="eyebrow">Phase 2 · v0.2.0</span><h2>{locale==='ar'?'النماذج المتاحة':'Available models'}</h2><div className="model-key"><span className="dot historical"/>Gleason Historical <small>DERIVED</small></div><div className="model-key"><span className="dot reference"/>Azimuthal Equidistant <small>REFERENCE</small></div></section>
        <section className="phase-card"><h2>{locale==='ar'?'حدود هذه المرحلة':'Phase boundary'}</h2><p>{locale==='ar'?'الخريطتان مستقلتان عمدًا. المزامنة بين النماذج تبدأ في المرحلة 5.':'The two maps are intentionally independent. Cross-model synchronization begins in Phase 5.'}</p></section>
        <section className="phase-card"><h2>{locale==='ar'?'الحزمة المحلية':'Offline pack'}</h2><p>Core World Pack v1 · Natural Earth 110m</p><span className="evidence-badge">Bundled · Offline</span></section>
      </aside>
      <main className="phase2-main"><div className="projection-grid"><ProjectionMap model="gleason" locale={locale} onPoint={handlePoint}/><ProjectionMap model="ae" locale={locale} onPoint={handlePoint}/></div><SourceViewer locale={locale}/></main>
      <aside className="inspector"><h2>{locale==='ar'?'المفتش الجغرافي':'Geographic inspector'}</h2>{selection?<dl><Metric label={locale==='ar'?'الخريطة':'Map'} value={selection.model}/><Metric label="Latitude" value={selection.point.latitude.toFixed(6)}/><Metric label="Longitude" value={selection.point.longitude.toFixed(6)}/><Metric label={locale==='ar'?'الحالة':'Status'} value="local inverse ✓"/></dl>:<p className="muted">{locale==='ar'?'انقر داخل إحدى الخريطتين لاستعادة الإحداثيات الجغرافية.':'Click inside either map to recover geographic coordinates.'}</p>}<div className="notice"><strong>{locale==='ar'?'الشفافية المصدرية':'Source transparency'}</strong><span>DOCUMENTED ≠ DERIVED ≠ REFERENCE</span></div><div className="notice"><strong>{locale==='ar'?'التوافق':'Compatibility'}</strong><span>{capabilities.touch?'Touch capable':'Pointer device'} · PWA</span></div></aside>
    </div>
    <footer className="statusbar"><span>GH-0.2.0 historical reconstruction</span><span>AE-0.2.0 independent reference</span><span>WGS84 globe: Phase 4</span><span>Synchronization: Phase 5</span></footer>
  </div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="metric"><dt>{label}</dt><dd>{value}</dd></div>;}
