import { useEffect, useMemo, useRef, useState } from 'react';
import { wgs84RouteDistance, type Wgs84RouteDistanceResult } from '../api';
import type { OrderedRouteState } from './routeState';

type Props = {
  locale: 'ar' | 'en';
  state: OrderedRouteState;
};

function pointLetter(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : `P${index + 1}`;
}

function formatMetres(value: number, locale: 'ar' | 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(value);
}

export function Wgs84RouteDistancePanel({ locale, state }: Props) {
  const [result, setResult] = useState<Wgs84RouteDistanceResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const requestRevision = useRef(0);

  const points = useMemo(() => state.points.map(point => ({
    point_id: point.pointId,
    latitude: point.endpoint.point.latitude,
    longitude: point.endpoint.point.longitude,
  })), [state.points]);

  useEffect(() => {
    const revision = ++requestRevision.current;
    if (points.length < 2) {
      setResult(null);
      setStatus('idle');
      return;
    }

    setResult(null);
    setStatus('loading');
    void wgs84RouteDistance(points, state.routeId).then(next => {
      if (requestRevision.current !== revision) return;
      setResult(next);
      setStatus('ready');
    }).catch(() => {
      if (requestRevision.current !== revision) return;
      setResult(null);
      setStatus('error');
    });
    return () => { requestRevision.current += 1; };
  }, [points, state.routeId, state.revision]);

  const implementation = result?.provenance.implementation ?? '—';
  const total = result?.output.total_distance_m ?? null;

  return <section
    className="wgs84-route-distance-panel"
    data-measurement-status={status}
    data-measurement-method={result?.output.method_id ?? 'wgs84-geodesic'}
    data-measurement-unit={result?.output.unit ?? 'metre'}
    data-route-segment-count={result?.output.segment_count ?? Math.max(0, points.length - 1)}
    data-route-distance-m={total == null ? '' : total.toFixed(6)}
    aria-labelledby="wgs84-route-distance-title"
  >
    <div className="section-heading">
      <div>
        <h2 id="wgs84-route-distance-title">{locale === 'ar' ? 'مسطرة ومسافة WGS84' : 'WGS84 ruler / distance'}</h2>
        <p>{locale === 'ar'
          ? 'P6.3 · مسافة جيوديسية على إهليلج WGS84 لكل مقطع متجاور، مع مجموع المسار المفتوح. مصدر النقطة لا يغيّر هوية الحساب.'
          : 'P6.3 · WGS84 ellipsoidal geodesic distance for each adjacent segment plus the open-polyline total. A point’s source model does not change the calculation identity.'}</p>
      </div>
      <span className="evidence-badge">REFERENCE_RESULT · P6.3</span>
    </div>

    {points.length < 2 && <p className="muted wgs84-route-distance-empty">{locale === 'ar'
      ? 'أضف نقطتين على الأقل إلى المسار المرتب لبدء القياس.'
      : 'Add at least two ordered route points to start measuring.'}</p>}

    {points.length >= 2 && status === 'loading' && <div className="notice">
      <strong>{locale === 'ar' ? 'جارٍ حساب المسافة' : 'Calculating distance'}</strong>
      <span>{locale === 'ar' ? 'سيُستخدم الخادم عند توفره، وإلا يعمل الحساب المحلي دون اتصال.' : 'The backend is used when available; otherwise the independent offline calculation is used.'}</span>
    </div>}

    {status === 'error' && <div className="notice wgs84-route-distance-error" role="alert">
      <strong>{locale === 'ar' ? 'تعذر حساب المسافة' : 'Distance calculation failed'}</strong>
      <span>{locale === 'ar' ? 'لم تُعرض قيمة عددية غير متحققة.' : 'No unverified numeric value is shown.'}</span>
    </div>}

    {result && <div className="wgs84-route-distance-result">
      <div className="wgs84-route-distance-total">
        <span>{locale === 'ar' ? 'المجموع — مسار مفتوح' : 'Total — open polyline'}</span>
        <strong dir="ltr">{formatMetres(result.output.total_distance_m, locale)} m</strong>
        <small dir="ltr">{(result.output.total_distance_m / 1000).toFixed(3)} km · display conversion only</small>
      </div>

      <div className="notice route-guide-notice" data-route-guide-semantics="p6.7a-controlled">
        <strong>{locale === 'ar' ? 'العرض المرئي تديره P6.7A' : 'Visual rendering is controlled by P6.7A'}</strong>
        <span>{locale === 'ar'
          ? 'هذه اللوحة تحسب مسافة WGS84 الجيوديسية فقط. الخط الذهبي على الخرائط الثلاث تديره لوحة P6.7A وفق هوية الحساب المختارة هناك؛ تغيير طريقة العرض لا يغيّر نتيجة هذه اللوحة ولا يحول الخط إلى طريق أو مسار رحلة جوية مسجّل.'
          : 'This panel computes WGS84 geodesic distance only. The gold path on all three views is controlled by the P6.7A selected computation identity; changing that rendering method does not change this numeric result and never turns the line into a road or observed flight track.'}</span>
      </div>

      <div className="wgs84-route-distance-meta">
        <span><b>{locale === 'ar' ? 'الطريقة' : 'Method'}:</b> {result.output.method_id}</span>
        <span><b>{locale === 'ar' ? 'وحدة العقد' : 'Contract unit'}:</b> {result.output.unit}</span>
        <span><b>{locale === 'ar' ? 'أساس المقياس' : 'Scale basis'}:</b> {result.output.scale_basis}</span>
        <span><b>{locale === 'ar' ? 'دلالة المسار' : 'Path semantics'}:</b> {result.output.path_semantics}</span>
        <span><b>{locale === 'ar' ? 'المحرك' : 'Engine'}:</b> {implementation}</span>
      </div>

      <ol className="wgs84-route-distance-segments">
        {result.output.segments.map(segment => <li
          key={segment.segment_id}
          className="wgs84-route-distance-segment"
          data-route-segment-id={segment.segment_id}
          data-segment-distance-m={segment.distance_m.toFixed(6)}
        >
          <strong>{pointLetter(segment.index)} → {pointLetter(segment.index + 1)}</strong>
          <span dir="ltr">{formatMetres(segment.distance_m, locale)} m</span>
          <small>{segment.segment_id}</small>
        </li>)}
      </ol>

      <div className="notice wgs84-route-distance-provenance">
        <strong>{locale === 'ar' ? 'هوية الحساب والمصدر' : 'Computation identity & provenance'}</strong>
        <span>{result.provenance.reference_frame} · {result.provenance.algorithm}</span>
        <span>{result.provenance.implementation} · {result.provenance.implementation_version}</span>
        <span>{locale === 'ar'
          ? 'الحساب جيوديسي WGS84 فقط؛ لا يُعاد تفسيره كمسافة AE أو Gleason، ولا كمسار طريق أو طيران.'
          : 'This is WGS84 geodesic distance only; it is not reinterpreted as AE/Gleason distance or as a road/flight route.'}</span>
        <span>{locale === 'ar'
          ? 'الارتفاع غير المعروف لا يُفترض صفرًا في مدخلات P6.3؛ مسافة السطح تستخدم خط العرض والطول فقط.'
          : 'Unknown height is not fabricated as zero in P6.3 inputs; surface distance uses latitude/longitude only.'}</span>
      </div>
    </div>}
  </section>;
}
