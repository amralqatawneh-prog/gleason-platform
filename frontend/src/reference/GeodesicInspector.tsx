import { useMemo, useState } from 'react';
import { geodesicInverse, type GeodesicInverseResult, type ReferenceGeoInput } from '../api';

export type GeodesicNamedPoint = ReferenceGeoInput & { label?: string };

type Props = {
  locale: 'ar' | 'en';
  currentPoint?: GeodesicNamedPoint | null;
};

function formatBearing(value: number | null): string {
  return value == null ? '—' : `${value.toFixed(3)}°`;
}

function pointLabel(point: GeodesicNamedPoint | null, fallback: string): string {
  if (!point) return fallback;
  return point.label || `${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`;
}

export function GeodesicInspector({ locale, currentPoint }: Props) {
  const [start, setStart] = useState<GeodesicNamedPoint | null>(null);
  const [end, setEnd] = useState<GeodesicNamedPoint | null>(null);
  const [result, setResult] = useState<GeodesicInverseResult | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

  const canCalculate = Boolean(start && end && state !== 'loading');
  const distance = useMemo(() => {
    if (!result) return null;
    return {
      km: result.output.distance_m / 1000,
      m: result.output.distance_m,
    };
  }, [result]);

  async function calculate() {
    if (!start || !end) return;
    setState('loading');
    setResult(null);
    try {
      const response = await geodesicInverse(start, end);
      setResult(response);
      setState('idle');
    } catch {
      setState('error');
    }
  }

  function capture(which: 'start' | 'end') {
    if (!currentPoint) return;
    const copy = { ...currentPoint };
    if (which === 'start') setStart(copy); else setEnd(copy);
    setResult(null);
    setState('idle');
  }

  return <section className="geodesic-inspector">
    <div className="section-heading">
      <div>
        <span className="eyebrow">Phase 4 · P4.5</span>
        <h2>{locale === 'ar' ? 'مفتش المسافة الجيوديسية WGS84' : 'WGS84 geodesic inspector'}</h2>
        <p>{locale === 'ar'
          ? 'المسافة والاتجاهات محسوبة في المحرك الخلفي WGS84 وتُعرض كـ REFERENCE_RESULT.'
          : 'Distance and bearings are calculated by the backend WGS84 engine and returned as REFERENCE_RESULT.'}</p>
      </div>
      <span className="evidence-badge">REFERENCE_RESULT</span>
    </div>

    <div className="geodesic-points">
      <div className="geodesic-point-card">
        <strong>A · {locale === 'ar' ? 'نقطة البداية' : 'Start'}</strong>
        <span>{pointLabel(start, locale === 'ar' ? 'لم تُحدد' : 'Not set')}</span>
        {start && <small>Lat {start.latitude.toFixed(6)}° · Lon {start.longitude.toFixed(6)}°</small>}
        <button className="secondary" type="button" disabled={!currentPoint} onClick={() => capture('start')}>
          {locale === 'ar' ? 'استخدم النقطة الحالية كبداية' : 'Use current point as start'}
        </button>
      </div>
      <div className="geodesic-point-card">
        <strong>B · {locale === 'ar' ? 'نقطة النهاية' : 'End'}</strong>
        <span>{pointLabel(end, locale === 'ar' ? 'لم تُحدد' : 'Not set')}</span>
        {end && <small>Lat {end.latitude.toFixed(6)}° · Lon {end.longitude.toFixed(6)}°</small>}
        <button className="secondary" type="button" disabled={!currentPoint} onClick={() => capture('end')}>
          {locale === 'ar' ? 'استخدم النقطة الحالية كنهاية' : 'Use current point as end'}
        </button>
      </div>
    </div>

    <div className="geodesic-actions">
      <button type="button" disabled={!canCalculate} onClick={() => void calculate()}>
        {state === 'loading' ? (locale === 'ar' ? 'جارٍ الحساب…' : 'Calculating…') : (locale === 'ar' ? 'احسب المسافة والاتجاهات' : 'Calculate distance & bearings')}
      </button>
      {state === 'error' && <span className="muted">{locale === 'ar' ? 'تعذر الحصول على نتيجة WGS84 من الخادم.' : 'Could not obtain a WGS84 result from the server.'}</span>}
    </div>

    {result && distance && <div className="geodesic-result">
      <div className="metric"><dt>{locale === 'ar' ? 'المسافة' : 'Distance'}</dt><dd>{distance.km.toFixed(3)} km</dd></div>
      <div className="metric"><dt>{locale === 'ar' ? 'المسافة بالمتر' : 'Distance (m)'}</dt><dd>{distance.m.toFixed(3)} m</dd></div>
      <div className="metric"><dt>{locale === 'ar' ? 'الاتجاه الابتدائي' : 'Initial bearing'}</dt><dd>{formatBearing(result.output.initial_bearing_deg)}</dd></div>
      <div className="metric"><dt>{locale === 'ar' ? 'اتجاه الوصول' : 'Final bearing'}</dt><dd>{formatBearing(result.output.final_bearing_deg)}</dd></div>
      <div className="metric"><dt>{locale === 'ar' ? 'الاتجاه العكسي' : 'Reverse bearing'}</dt><dd>{formatBearing(result.output.reverse_bearing_deg)}</dd></div>
      <div className="notice geodesic-provenance">
        <strong>{result.provenance.provider_id} · {result.provenance.reference_frame}</strong>
        <span>{result.semantic_type} · {result.operation}</span>
        <span>{result.provenance.implementation} {result.provenance.implementation_version}</span>
        <span>{result.provenance.algorithm}</span>
      </div>
    </div>}
  </section>;
}
