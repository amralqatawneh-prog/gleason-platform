import { useEffect, useMemo, useRef, useState } from 'react';
import { gleasonRouteDistance, type GleasonRouteDistanceResult } from '../api';
import type { OrderedRouteState } from './routeState';

type Props = {
  locale: 'ar' | 'en';
  state: OrderedRouteState;
};

function pointLetter(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : `P${index + 1}`;
}

function formatNormalized(value: number, locale: 'ar' | 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', {
    maximumFractionDigits: 9,
    minimumFractionDigits: 0,
  }).format(value);
}

export function GleasonRouteDistancePanel({ locale, state }: Props) {
  const [result, setResult] = useState<GleasonRouteDistanceResult | null>(null);
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
    void gleasonRouteDistance(points, state.routeId).then(next => {
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
  const total = result?.output.total_distance_normalized_radius_unit ?? null;

  return <section
    className="gleason-route-distance-panel ae-route-distance-panel"
    data-measurement-status={status}
    data-measurement-method={result?.output.method_id ?? 'gleason-native-normalized'}
    data-measurement-unit={result?.output.unit ?? 'normalized-radius-unit'}
    data-measurement-scale-basis={result?.output.scale_basis ?? 'gleason-normalized-model-radius'}
    data-segment-geometry={result?.output.segment_geometry ?? 'straight-projected-chord'}
    data-route-segment-count={result?.output.segment_count ?? Math.max(0, points.length - 1)}
    data-route-distance-normalized-radius-unit={total == null ? '' : total.toFixed(12)}
    aria-labelledby="gleason-route-distance-title"
  >
    <div className="section-heading">
      <div>
        <h2 id="gleason-route-distance-title">{locale === 'ar' ? 'مسافة Gleason الأصلية المعيارية' : 'Gleason native normalized distance'}</h2>
        <p>{locale === 'ar'
          ? 'P6.5 · تُسقط النقاط إلى إعادة بناء Gleason المشتقة ثم تُقاس المقاطع المستقيمة بوحدة normalized-radius-unit الخاصة بالنموذج.'
          : 'P6.5 · Canonical points are projected into the project-derived Gleason reconstruction and adjacent straight chords are measured in normalized-radius-unit.'}</p>
      </div>
      <span className="evidence-badge">COMPUTED_RESULT · P6.5</span>
    </div>

    {points.length < 2 && <p className="muted gleason-route-distance-empty">{locale === 'ar'
      ? 'أضف نقطتين على الأقل إلى المسار المرتب لبدء قياس Gleason.'
      : 'Add at least two ordered route points to start Gleason measurement.'}</p>}

    {points.length >= 2 && status === 'loading' && <div className="notice">
      <strong>{locale === 'ar' ? 'جارٍ حساب مسافة Gleason' : 'Calculating Gleason distance'}</strong>
      <span>{locale === 'ar'
        ? 'يُستخدم الخادم عند توفره، وإلا يعمل الحساب المحلي من نفس إعادة البناء GH-0.2.0.'
        : 'The backend is used when available; otherwise the browser computes from the same GH-0.2.0 reconstruction.'}</span>
    </div>}

    {status === 'error' && <div className="notice gleason-route-distance-error" role="alert">
      <strong>{locale === 'ar' ? 'تعذر حساب مسافة Gleason' : 'Gleason distance calculation failed'}</strong>
      <span>{locale === 'ar' ? 'لم تُعرض قيمة عددية غير متحققة.' : 'No unverified numeric value is shown.'}</span>
    </div>}

    {result && <div className="gleason-route-distance-result ae-route-distance-result">
      <div className="gleason-route-distance-total ae-route-distance-total">
        <span>{locale === 'ar' ? 'المجموع — مسار مفتوح في مستوى Gleason' : 'Total — open polyline in Gleason plane'}</span>
        <strong dir="ltr">{formatNormalized(result.output.total_distance_normalized_radius_unit, locale)}</strong>
        <small dir="ltr">normalized-radius-unit · no SI conversion</small>
      </div>

      <div className="notice ae-distortion-notice" data-gleason-scale-boundary="explicit">
        <strong>{locale === 'ar' ? 'تنبيه: هذه ليست أمتارًا أو كيلومترات' : 'Important: these are not metres or kilometres'}</strong>
        <span>{locale === 'ar'
          ? 'الوحدة خاصة بإعادة البناء المعيارية للنموذج. لا يوجد في P6.5 تحويل تلقائي إلى وحدات SI، ولا تُستخدم مسافة WGS84 أو AE بديلًا عنها.'
          : 'The unit belongs to the normalized model reconstruction. P6.5 performs no automatic SI conversion and does not substitute WGS84 or AE distance.'}</span>
      </div>

      <div className="gleason-route-distance-meta ae-route-distance-meta">
        <span><b>{locale === 'ar' ? 'الطريقة' : 'Method'}:</b> {result.output.method_id}</span>
        <span><b>{locale === 'ar' ? 'الوحدة' : 'Unit'}:</b> {result.output.unit}</span>
        <span><b>{locale === 'ar' ? 'أساس المقياس' : 'Scale basis'}:</b> {result.output.scale_basis}</span>
        <span><b>{locale === 'ar' ? 'هندسة المقطع' : 'Segment geometry'}:</b> {result.output.segment_geometry}</span>
        <span><b>{locale === 'ar' ? 'دلالة المسار' : 'Path semantics'}:</b> {result.output.path_semantics}</span>
        <span><b>{locale === 'ar' ? 'المحرك' : 'Engine'}:</b> {implementation}</span>
      </div>

      <ol className="gleason-route-distance-segments ae-route-distance-segments">
        {result.output.segments.map(segment => <li
          key={segment.segment_id}
          className="gleason-route-distance-segment ae-route-distance-segment"
          data-route-segment-id={segment.segment_id}
          data-segment-distance-normalized-radius-unit={segment.distance_normalized_radius_unit.toFixed(12)}
        >
          <strong>{pointLetter(segment.index)} → {pointLetter(segment.index + 1)}</strong>
          <span dir="ltr">{formatNormalized(segment.distance_normalized_radius_unit, locale)}</span>
          <small>{segment.segment_id}</small>
        </li>)}
      </ol>

      <div className="notice gleason-route-distance-provenance ae-route-distance-provenance">
        <strong>{locale === 'ar' ? 'هوية الحساب والمصدر' : 'Computation identity & provenance'}</strong>
        <span>{result.provenance.provider_id} · {result.provenance.provider_version}</span>
        <span>{result.provenance.implementation} · {result.provenance.implementation_version}</span>
        <span>{locale === 'ar'
          ? 'إعادة البناء التحليلية الحالية مشتقة من وصف المصدر المسجل، وليست معادلة مطبوعة حرفيًا في الكتاب.'
          : 'The current analytic reconstruction is derived from the registered source evidence; it is not claimed as a formula printed verbatim in the book.'}</span>
        <span>{locale === 'ar'
          ? 'الحساب Gleason معياري فقط؛ لا يُعاد تفسيره كمسافة WGS84 أو AE ولا كطريق أو مسار طيران.'
          : 'This is Gleason normalized measurement only. It is not reinterpreted as WGS84/AE distance or as a road/flight route.'}</span>
      </div>
    </div>}
  </section>;
}
