import { useEffect, useMemo, useState } from 'react';
import { fetchCapabilities } from './api';
import { type Locale, strings } from './i18n';
import { detectCapabilities, threeDMode } from './platform/capabilities';
import { RELEASE_NAME } from './shared/version';

export default function App() {
  const [locale, setLocale] = useState<Locale>('ar');
  const [online, setOnline] = useState(navigator.onLine);
  const [serverState, setServerState] = useState<'checking' | 'connected' | 'offline'>('checking');
  const capabilities = useMemo(() => detectCapabilities(), []);
  const t = strings[locale];
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    addEventListener('online', sync);
    addEventListener('offline', sync);
    return () => {
      removeEventListener('online', sync);
      removeEventListener('offline', sync);
    };
  }, []);

  useEffect(() => {
    fetchCapabilities().then((result) => setServerState(result ? 'connected' : 'offline'));
  }, [online]);

  return (
    <div className="app-shell" dir={direction}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">◎</span>
          <div>
            <h1>{t.title}</h1>
            <p>{t.subtitle} · {RELEASE_NAME}</p>
          </div>
        </div>
        <div className="top-actions">
          <span className={`status-dot ${online ? 'ok' : 'warn'}`}>{online ? t.online : t.offlineNow}</span>
          <span className="status-dot">API: {serverState}</span>
          <button className="secondary" onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}>
            {locale === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <label className="search-box">
            <span>⌕</span>
            <input aria-label={t.search} placeholder={t.search} disabled />
          </label>
          <section>
            <h2>{t.layers}</h2>
            {['الدول / Countries', 'المدن / Cities', 'Grid', 'الشمس / Sun', 'القمر / Moon'].map((item) => (
              <label className="layer-row" key={item}>
                <input type="checkbox" disabled /> <span>{item}</span>
              </label>
            ))}
          </section>
          <section>
            <h2>{t.time}</h2>
            <input className="time-slider" type="range" min="0" max="24" value="12" readOnly />
            <div className="time-readout">2026-09-09 · 12:00 UTC</div>
          </section>
        </aside>

        <main className="comparison-grid">
          <ModelPanel title={t.gleason} badge="Historical / Source-bound" text={t.notImplemented} />
          <ModelPanel
            title={t.globe}
            badge={threeDMode(capabilities) === 'available' ? t.available3d : t.fallback3d}
            text={t.notImplemented}
          />
        </main>

        <aside className="inspector">
          <h2>{t.compare}</h2>
          <dl>
            <Metric label="Latitude" value="—" />
            <Metric label="Longitude" value="—" />
            <Metric label="Distance" value="—" />
            <Metric label="Azimuth" value="—" />
          </dl>
          <div className="notice">
            <strong>{t.offline}</strong>
            <span>IndexedDB · Service Worker · Offline Pack schema v1</span>
          </div>
        </aside>
      </div>

      <footer className="statusbar">
        <span>WGS84: foundation only</span>
        <span>Gleason: source engine pending Phase 2</span>
        <span>{capabilities.touch ? 'Touch capable' : 'Pointer device'}</span>
      </footer>
    </div>
  );
}

function ModelPanel({ title, badge, text }: { title: string; badge: string; text: string }) {
  return (
    <section className="model-panel">
      <div className="panel-title"><strong>{title}</strong><span>{badge}</span></div>
      <div className="map-placeholder">
        <div className="grid-art" aria-hidden="true" />
        <div className="placeholder-message"><span className="orb">◎</span><p>{text}</p></div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><dt>{label}</dt><dd>{value}</dd></div>;
}
