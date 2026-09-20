import { useEffect, useMemo, useRef, useState } from 'react';
import { aeRouteDistance, type AERouteDistanceResult } from '../api';
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

export function AERouteDistancePanel({ locale, state }: Props) {
  const [result, setResult] = useState<AERouteDistanceResult | null>(null);
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
    void aeRouteDistance(points, state.routeId).then(next => {
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
    className="ae-route-distance-panel"
    data-measurement-status={status}
    data-measurement-method={result?.output.method_id ?? 'ae-projected-plane'}
    data-measurement-unit={result?.output.unit ?? 'metre'}
    data-measurement-scale-basis={result?.output.scale_basis ?? 'ae-projected-plane-si-metre'}
    data-segment-geometry={result?.output.segment_geometry ?? 'straight-projected-chord'}
    data-route-segment-count={result?.output.segment_count ?? Math.max(0, points.length - 1)}
    data-route-distance-m={total == null ? '' : total.toFixed(6)}
    aria-labelledby="ae-route-distance-title"
  >
    <div className="section-heading">
      <div>
        <h2 id="ae-route-distance-title">{locale === 'ar' ? 'مسافة AE على المستوى المسقط' : 'AE projected-plane distance'}</h2>
        <p>{locale === 'ar'
          ? 'P6.4 · تُسقط كل نقطة جغرافية إلى نموذج AE القطبي الشمالي المستقل، ثم تُقاس المسافة الإقليدية المستقيمة بين كل نقطتين متجاورتين على المستوى.'
          : 'P6.4 · Each canonical geographic point is projected into the independent north-polar AE model, then adjacent points are measured by straight Euclidean distance in that plane.'}</p>
      </div>
      <span className="evidence-badge">REFERENCE_RESULT · P6.4</span>
    </div>

    {points.length < 2 && <p className="muted ae-route-distance-empty">{locale === 'ar'
      ? 'أضف نقطتين على الأقل إلى المسار المرتب لبدء قياس AE.'
      : 'Add at least two ordered route points to start AE measurement.'}</p>}

    {points.length >= 2 && status === 'loading' && <div className="notice">
      <strong>{locale === 'ar' ? 'جارٍ حساب مسافة AE' : 'Calculating AE distance'}</strong>
      <span>{locale === 'ar'
        ? 'يُستخدم الخادم عند توفره، وإلا يعمل الحساب المحلي المستقل باستخدام نفس تعريف الإسقاط.'
        : 'The backend is used when available; otherwise the independent browser implementation uses the same declared projection definition.'}</span>
    </div>}

    {status === 'error' && <div className="notice ae-route-distance-error" role="alert">
      <strong>{locale === 'ar' ? 'تعذر حساب مسافة AE' : 'AE distance calculation failed'}</strong>
      <span>{locale === 'ar' ? 'لم تُعرض قيمة عددية غير متحققة.' : 'No unverified numeric value is shown.'}</span>
    </div>}

    {result && <div className="ae-route-distance-result">
      <div className="ae-route-distance-total">
        <span>{locale === 'ar' ? 'المجموع — مسار مفتوح على مستوى AE' : 'Total — open polyline in AE plane'}</span>
        <strong dir="ltr">{formatMetres(result.output.total_distance_m, locale)} m</strong>
        <small dir="ltr">{(result.output.total_distance_m / 1000).toFixed(3)} km · display conversion only</small>
      </div>

      <div className="notice ae-distortion-notice" data-ae-distortion="explicit">
        <strong>{locale === 'ar' ? 'تنبيه: هذه ليست مسافة WGS84 الجيوديسية' : 'Important: this is not WGS84 geodesic distance'}</strong>
        <span>{locale === 'ar'
          ? 'رغم أن الوحدة متر في الطريقتين، فإن هذه القيمة طول مستقيم في مستوى AE بعد الإسقاط. إسقاط Azimuthal Equidistant يحفظ المسافات الشعاعية من مركزه عند القطب الشمالي، لكنه لا يحفظ كل المسافات بين أي نقطتين على سطح الأرض.'
          : 'Although both methods use metres, this value is a straight length in the AE projected plane. Azimuthal Equidistant preserves radial distances from its north-pole center, not every arbitrary pairwise surface distance.'}</span>
      </div>

      <div className="ae-route-distance-meta">
        <span><b>{locale === 'ar' ? 'الطريقة' : 'Method'}:</b> {result.output.method_id}</span>
        <span><b>{locale === 'ar' ? 'وحدة العقد' : 'Contract unit'}:</b> {result.output.unit}</span>
        <span><b>{locale === 'ar' ? 'أساس المقياس' : 'Scale basis'}:</b> {result.output.scale_basis}</span>
        <span><b>{locale === 'ar' ? 'هندسة المقطع' : 'Segment geometry'}:</b> {result.output.segment_geometry}</span>
        <span><b>{locale === 'ar' ? 'دلالة المسار' : 'Path semantics'}:</b> {result.output.path_semantics}</span>
        <span><b>{locale === 'ar' ? 'المحرك' : 'Engine'}:</b> {implementation}</span>
      </div>

      <ol className="ae-route-distance-segments">
        {result.output.segments.map(segment => <li
          key={segment.segment_id}
          className="ae-route-distance-segment"
          data-route-segment-id={segment.segment_id}
          data-segment-distance-m={segment.distance_m.toFixed(6)}
        >
          <strong>{pointLetter(segment.index)} → {pointLetter(segment.index + 1)}</strong>
          <span dir="ltr">{formatMetres(segment.distance_m, locale)} m</span>
          <small>{segment.segment_id}</small>
        </li>)}
      </ol>

      <div className="notice ae-route-distance-provenance">
        <strong>{locale === 'ar' ? 'هوية الحساب والمصدر' : 'Computation identity & provenance'}</strong>
        <span>{result.provenance.provider_id} · {result.provenance.provider_version}</span>
        <span>{result.provenance.implementation} · {result.provenance.implementation_version}</span>
        <span>{locale === 'ar'
          ? 'الحساب AE projected-plane فقط. لا يُعاد تفسيره كمسافة WGS84 أو Gleason، ولا كطريق أو مسار طيران.'
          : 'This is AE projected-plane distance only. It is not reinterpreted as WGS84/Gleason distance or as a road/flight route.'}</span>
        <span>{locale === 'ar'
          ? 'مصدر النقطة الأصلية لا يغيّر هوية الحساب؛ جميع النقاط تستخدم الإحداثيات الجغرافية القانونية نفسها ثم تُسقط إلى AE.'
          : 'A point’s source model does not change the calculation identity; all points use the same canonical geographic coordinate before AE projection.'}</span>
      </div>
    </div>}
  </section>;
}
