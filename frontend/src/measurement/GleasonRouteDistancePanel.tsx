import { useEffect, useMemo, useRef, useState } from 'react';
import { gleasonRouteDistance, gleasonSiRouteDistance, type GleasonRouteDistanceResult, type GleasonSiRouteDistanceResult } from '../api';
import {
  gleasonFig37NauticalToEnglishMiles,
  gleasonFrameTimeDifference,
  gleasonSameLatitudeHistoricalLongitudeMetrics,
  gleasonTextNauticalToEnglishMiles,
} from './gleasonHistoricalMeasurement';
import { historicalLongitudeDegreeMiles } from '../models/gleason';
import type { OrderedRouteState } from './routeState';

type Props = { locale: 'ar' | 'en'; state: OrderedRouteState };

function pointLetter(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : `P${index + 1}`;
}
function format(value: number, locale: 'ar' | 'en', digits = 3): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function GleasonRouteDistancePanel({ locale, state }: Props) {
  const [result, setResult] = useState<GleasonRouteDistanceResult | null>(null);
  const [siResult, setSiResult] = useState<GleasonSiRouteDistanceResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const requestRevision = useRef(0);
  const points = useMemo(() => state.points.map(point => ({
    point_id: point.pointId,
    latitude: point.endpoint.point.latitude,
    longitude: point.endpoint.point.longitude,
  })), [state.points]);

  useEffect(() => {
    const revision = ++requestRevision.current;
    if (points.length < 2) { setResult(null); setSiResult(null); setStatus('idle'); return; }
    setResult(null); setSiResult(null); setStatus('loading');
    void Promise.all([
      gleasonRouteDistance(points, state.routeId),
      gleasonSiRouteDistance(points, state.routeId),
    ]).then(([next, nextSi]) => {
      if (requestRevision.current !== revision) return;
      setResult(next); setSiResult(nextSi); setStatus('ready');
    }).catch(() => {
      if (requestRevision.current !== revision) return;
      setResult(null); setSiResult(null); setStatus('error');
    });
    return () => { requestRevision.current += 1; };
  }, [points, state.routeId, state.revision]);

  const segments = points.slice(0, -1).map((start, index) => {
    const end = points[index + 1];
    return {
      index,
      start,
      end,
      frame: gleasonFrameTimeDifference(start.longitude, end.longitude),
      historical: gleasonSameLatitudeHistoricalLongitudeMetrics(start, end),
    };
  });

  return <section
    className="gleason-route-distance-panel gleason-measurement-lab"
    data-measurement-status={status}
    data-measurement-method={result?.output.method_id ?? 'gleason-native-normalized'}
    data-measurement-unit={result?.output.unit ?? 'normalized-radius-unit'}
    data-measurement-scale-basis={result?.output.scale_basis ?? 'gleason-normalized-model-radius'}
    data-segment-geometry={result?.output.segment_geometry ?? 'straight-projected-chord'}
    data-route-segment-count={result?.output.segment_count ?? Math.max(0, points.length - 1)}
    data-route-distance-normalized-radius-unit={
      result ? result.output.total_distance_normalized_radius_unit.toFixed(12) : ''
    }
    data-historical-scale-profile={result?.output.historical_scale_profile_id ?? 'gleason-fig43-circle-derived'}
    data-route-distance-historical-fig43-mile={
      result ? result.output.total_distance_historical_fig43_mile_derived.toFixed(6) : ''
    }
    aria-labelledby="gleason-route-distance-title"
  >
    <div className="section-heading">
      <div>
        <h2 id="gleason-route-distance-title">{locale === 'ar' ? 'مختبر قياس جليسون' : 'Gleason Measurement Laboratory'}</h2>
        <p>{locale === 'ar'
          ? 'ثلاث هويات منفصلة: مسطرة المستوى المشتقة، مقياس خطوط الطول التاريخي Fig.43، ومحول الإطار/الزمن Fig.37–38. لا ندمجها في رقم واحد.'
          : 'Three separate identities: derived map-plane ruler, historical Figure 43 longitude scale, and Figure 37–38 frame/time calculator. They are never collapsed into one number.'}</p>
      </div>
      <span className="evidence-badge">P6.C2 · SI PROFILES</span>
    </div>

    {points.length < 2 && <p className="muted gleason-route-distance-empty">{locale === 'ar'
      ? 'أضف نقطتين على الأقل إلى المسار المرتب لبدء مختبر جليسون.'
      : 'Add at least two ordered route points to start the Gleason laboratory.'}</p>}

    {points.length >= 2 && status === 'loading' && <div className="notice"><strong>{locale === 'ar' ? 'جارٍ الحساب' : 'Calculating'}</strong></div>}
    {status === 'error' && <div className="notice gleason-route-distance-error" role="alert">
      <strong>{locale === 'ar' ? 'تعذر الحساب' : 'Calculation failed'}</strong>
      <span>{locale === 'ar' ? 'لم تُعرض قيمة غير متحققة.' : 'No unverified numeric value is shown.'}</span>
    </div>}

    {result && <>
      {siResult && <div className="gleason-lab-grid gleason-si-grid" data-gleason-tool="si-profiles">
        {siResult.output.profiles.map((profile, index) => <article
          key={profile.profile_id}
          className="gleason-lab-card"
          data-si-profile-id={profile.profile_id}
          data-si-conversion-status={profile.conversion_status}
          data-si-evidence-level={profile.evidence_level}
          data-si-distance-m={profile.distance_m.toFixed(6)}
          data-si-distance-km={profile.distance_km.toFixed(9)}
          data-si-distance-nmi={profile.distance_nmi.toFixed(9)}
        >
          <div className="polygon-measurement-card__head">
            <div>
              <strong>{index + 1}) {profile.profile_id}</strong>
              <small>{profile.source_profile_id} · {profile.source_class}</small>
            </div>
            <span className="evidence-badge">{profile.conversion_status === 'direct-si'
              ? 'DIRECT SI'
              : (locale === 'ar' ? 'افتراض معلن' : 'EXPLICIT ASSUMPTION')}</span>
          </div>
          <div className="gleason-route-distance-total">
            <span>{locale === 'ar' ? 'المسافة المحولة وفق هذا الملف' : 'Distance under this profile'}</span>
            <strong dir="ltr">{format(profile.distance_km, locale, 3)} km</strong>
            <small dir="ltr">{format(profile.distance_m, locale, 2)} m · {format(profile.distance_nmi, locale, 3)} NM</small>
          </div>
          <p className="muted">{profile.conversion_basis}</p>
          <div className="gleason-route-distance-provenance">
            <strong>{locale === 'ar' ? 'الهوية والدليل' : 'Identity & evidence'}</strong>
            <span>{profile.evidence_level} · {profile.native_distance_unit}</span>
            <span dir="ltr">{format(profile.native_distance_value, locale, 6)} {profile.native_distance_unit}</span>
          </div>
          {profile.limitations.map(item => <small key={item} className="muted">{item}</small>)}
        </article>)}
        <article className="gleason-lab-card" data-si-profile-unavailable="gleason-book-historical">
          <div className="polygon-measurement-card__head">
            <div>
              <strong>{locale === 'ar' ? 'ملف Gleason التاريخي المباشر إلى SI' : 'Direct Gleason historical → SI'}</strong>
              <small>gleason-book-historical · FAIL CLOSED</small>
            </div>
            <span className="evidence-badge">UNRESOLVED</span>
          </div>
          <p className="muted">{locale === 'ar'
            ? 'لا يزال التحويل المباشر مغلقًا لأن هوية mile في Fig.43 غير محسومة. القيم أعلاه التي تستخدم Fig.43 تظهر فقط كافتراضات معلنة منفصلة، وليست نتيجة Gleason تاريخية نهائية.'
            : 'Direct conversion remains closed because the Figure 43 mile identity is unresolved. Figure-43-based SI values above are exposed only as separate explicit assumptions, not as the final Gleason historical result.'}</p>
        </article>
      </div>}

      <div className="gleason-lab-grid">
        <article className="gleason-lab-card" data-gleason-tool="historical-circle-derived">
          <div className="polygon-measurement-card__head">
            <div>
              <strong>{locale === 'ar' ? '1) تشخيص Fig.43/الدائرة — اشتقاق للمقارنة وليس مسافة تاريخية عامة' : '1) Fig.43 / circle-derived diagnostic'}</strong>
              <small>gleason-fig43-circle-derived · DERIVED_FROM_DOCUMENTED</small>
            </div>
            <span className="evidence-badge">DERIVED_FROM_DOCUMENTED</span>
          </div>
          <div className="gleason-route-distance-total">
            <span>{locale === 'ar' ? 'المجموع بالاشتقاق التشخيصي الحالي' : 'Current circle-derived diagnostic total'}</span>
            <strong dir="ltr">{format(result.output.total_distance_historical_fig43_mile_derived, locale, 2)} historical Fig.43 miles</strong>
            <small dir="ltr">{format(result.output.total_distance_normalized_radius_unit, locale, 9)} NRU</small>
          </div>
          <p className="muted">{locale === 'ar'
            ? 'P6.C1 أعاد تصنيف هذه القيمة كتشخيص اشتقاقي: Fig.43 يعطي 60 mile/° عند خط الاستواء، ثم يشتق المشروع 21600 للمحيط ويطبق C=2πr. لا تُعامل هذه القيمة وحدها كمسافة Gleason عامة أو كتحويل SI. فرضية 10800 NM/NRU تبقى مقارنة قديمة فقط.'
            : 'P6.C1 reclassifies this value as a derived diagnostic: Figure 43 gives 60 miles/degree at the Equator, then the project derives 21600 circumference and applies C=2πr. This value alone is not a universal Gleason route distance or an SI conversion. The 10800 NM/NRU assumption remains legacy-only.'}</p>
          <ol className="gleason-route-distance-segments">
            {result.output.segments.map(segment => <li
              key={segment.segment_id}
              className="gleason-route-distance-segment"
              data-route-segment-id={segment.segment_id}
              data-segment-distance-normalized-radius-unit={segment.distance_normalized_radius_unit.toFixed(12)}
            >
              <strong>{pointLetter(segment.index)} → {pointLetter(segment.index + 1)}</strong>
              <span dir="ltr">{format(segment.distance_historical_fig43_mile_derived, locale, 2)} historical Fig.43 mi</span>
              <small dir="ltr">legacy: {format(segment.distance_legacy_radial60_nautical_mile, locale, 2)} NM</small>
              <small dir="ltr">{format(segment.distance_normalized_radius_unit, locale, 9)} NRU</small>
            </li>)}
          </ol>
          <div className="notice" data-gleason-scale-boundary="explicit">
            <strong>{locale === 'ar' ? 'مسافة Gleason الأصلية المعيارية — هذه ليست أمتارًا أو كيلومترات' : 'Gleason native normalized distance — these are not metres or kilometres'}</strong>
            <span dir="ltr">COMPUTED_RESULT · gleason-native-normalized · normalized-radius-unit · gleason-normalized-model-radius</span>
          </div>
          <div className="gleason-route-distance-provenance">
            <strong>{locale === 'ar' ? 'هوية الحساب والمصدر' : 'Computation identity & provenance'}</strong>
            <span>{result.provenance.provider_id} · {result.provenance.provider_version}</span>
            <span>{result.provenance.implementation} · {result.provenance.implementation_version}</span>
          </div>
        </article>

        <article className="gleason-lab-card" data-gleason-tool="historical-longitude-scale">
          <div className="polygon-measurement-card__head">
            <div>
              <strong>{locale === 'ar' ? '2) مقياس خطوط الطول التاريخي' : '2) Historical longitude scale'}</strong>
              <small>Fig.43 · historical-book-mile / longitude degree</small>
            </div>
            <span className="evidence-badge">DOCUMENTED</span>
          </div>
          <div className="gleason-historical-point-scales">
            {points.map((point, index) => <div key={point.point_id}>
              <strong>{pointLetter(index)}</strong>
              <span dir="ltr">{format(point.latitude, locale, 4)}° → {format(historicalLongitudeDegreeMiles(point.latitude), locale, 4)} book mi/° lon</span>
            </div>)}
          </div>
          <ol className="gleason-historical-segments">
            {segments.map(segment => <li key={segment.index}>
              <strong>{pointLetter(segment.index)} → {pointLetter(segment.index + 1)}</strong>
              {segment.historical
                ? <span dir="ltr">Δlon {format(segment.historical.longitude_delta_deg, locale, 4)}° · {format(segment.historical.miles_per_longitude_degree, locale, 4)} mi/° · arc {format(segment.historical.parallel_arc_historical_fig43_mile, locale, 2)} · chord {format(segment.historical.straight_chord_historical_fig43_mile, locale, 2)}</span>
                : <span>{locale === 'ar'
                  ? 'غير معرّف كمسافة عامة: النقطتان ليستا على خط العرض نفسه.'
                  : 'Not defined as a general distance: endpoints are not on the same latitude.'}</span>}
            </li>)}
          </ol>
          <p className="muted">{locale === 'ar'
            ? 'لا نستخدم Δlongitude × 60 كقاعدة عالمية. Fig.43 يجعل الميل/درجة تابعًا لخط العرض.'
            : 'We do not use Δlongitude × 60 as a global rule. Figure 43 makes miles/degree latitude-dependent.'}</p>
        </article>

        <article className="gleason-lab-card" data-gleason-tool="frame-time">
          <div className="polygon-measurement-card__head">
            <div>
              <strong>{locale === 'ar' ? '3) الإطار والزمن والتحويلات' : '3) Frame, time & conversions'}</strong>
              <small>Figs.37–38 · longitude/time dial</small>
            </div>
            <span className="evidence-badge">DOCUMENTED</span>
          </div>
          <ol className="gleason-historical-segments">
            {segments.map(segment => <li key={segment.index}>
              <strong>{pointLetter(segment.index)} → {pointLetter(segment.index + 1)}</strong>
              <span dir="ltr">Δlon {format(segment.frame.signed_longitude_delta_deg, locale, 4)}° · Δtime {format(segment.frame.signed_sun_time_minutes, locale, 2)} min</span>
            </li>)}
          </ol>
          <div className="gleason-conversion-reference">
            <span dir="ltr">Fig.37: 180 nautical/geographical mi = {format(gleasonFig37NauticalToEnglishMiles(180), locale, 3)} English mi</span>
            <span dir="ltr">Text feet: 1 nautical mi = {format(gleasonTextNauticalToEnglishMiles(1), locale, 6)} English mi</span>
          </div>
          <p className="muted">{locale === 'ar'
            ? 'نحفظ نسب Fig.37 وتعريفات القدمين كما وردت منفصلة، ولا نخفي اختلافهما العددي الصغير.'
            : 'The Figure 37 ratio and textual foot definitions remain separate; their small numerical inconsistency is not hidden.'}</p>
        </article>
      </div>

      <div className="notice" data-gleason-raster-foundation="provisional">
        <strong>{locale === 'ar' ? 'Raster جليسون عالي الجودة — georeferencing أولي' : 'High-resolution Gleason raster — provisional georeferencing'}</strong>
        <span dir="ltr">4653×6506 px · PDF SHA-256 26105ca1f98ec9d… · center≈(2315.18,3287.41) · outer ring≈1851.84 px · fit RMS≈5.77 px</span>
      </div>
      <div className="notice gleason-source-audit-notice">
        <strong>{locale === 'ar' ? 'نتيجة مراجعة الفيديوهين' : 'Video-source audit result'}</strong>
        <span>{locale === 'ar'
          ? 'الفيديو الأول يوافق عمليًا هندسة مسطرة المستوى ضمن نحو 1% في مثالين. الفيديو الثاني يستخدم 60 ميلًا لكل درجة طول في Sydney–Perth، وهو لا يوافق Fig.43 جنوب خط الاستواء؛ لذلك لم نستورد هذه القاعدة.'
          : 'Video 1 agrees with the derived map-plane ruler within about 1% in two examples. Video 2 uses 60 miles per longitude degree for Sydney–Perth, which conflicts with Figure 43 south of the Equator; that shortcut is not imported.'}</span>
      </div>
    </>}
  </section>;
}
