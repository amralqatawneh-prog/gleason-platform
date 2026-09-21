import { useEffect, useMemo, useRef, useState } from 'react';
import {
  aePolygonMeasurement,
  gleasonPolygonMeasurement,
  wgs84PolygonMeasurement,
  type AEPolygonResult,
  type GleasonPolygonResult,
  type Wgs84PolygonResult,
} from '../api';
import type { OrderedRouteState } from './routeState';

type Props = {
  locale: 'ar' | 'en';
  state: OrderedRouteState;
};

type LoadState<T> = {
  readonly status: 'idle' | 'loading' | 'ready' | 'error';
  readonly result: T | null;
  readonly error: string | null;
};

const idle = <T,>(): LoadState<T> => ({ status: 'idle', result: null, error: null });
const loading = <T,>(): LoadState<T> => ({ status: 'loading', result: null, error: null });

function format(value: number, locale: 'ar' | 'en', maximumFractionDigits = 3): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

function orientationLabel(value: 'counterclockwise' | 'clockwise', locale: 'ar' | 'en'): string {
  if (locale === 'ar') return value === 'counterclockwise' ? 'عكس عقارب الساعة' : 'مع عقارب الساعة';
  return value === 'counterclockwise' ? 'Counterclockwise' : 'Clockwise';
}

type CardProps = {
  locale: 'ar' | 'en';
  engine: 'wgs84' | 'ae' | 'gleason';
  title: string;
  semanticType: 'REFERENCE_RESULT' | 'COMPUTED_RESULT';
  status: LoadState<unknown>['status'];
  methodId: string;
  scaleBasis: string;
  perimeter: number | null;
  perimeterUnit: string;
  area: number | null;
  areaUnit: string;
  signedArea: number | null;
  orientation: 'counterclockwise' | 'clockwise' | null;
  interiorRule: string;
  error: string | null;
  secondaryPerimeter?: string | null;
  secondaryArea?: string | null;
};

function PolygonCard({
  locale, engine, title, semanticType, status, methodId, scaleBasis,
  perimeter, perimeterUnit, area, areaUnit, signedArea, orientation, interiorRule, error,
  secondaryPerimeter = null, secondaryArea = null,
}: CardProps) {
  return <article
    className="polygon-measurement-card"
    data-polygon-engine={engine}
    data-measurement-status={status}
    data-method-id={methodId}
    data-scale-basis={scaleBasis}
    data-perimeter={perimeter == null ? '' : String(perimeter)}
    data-area={area == null ? '' : String(area)}
  >
    <div className="polygon-measurement-card__head">
      <div><strong>{title}</strong><small>{methodId}</small></div>
      <span className="evidence-badge">{semanticType}</span>
    </div>
    {status === 'loading' && <p className="muted">{locale === 'ar' ? 'جارٍ حساب المحيط والمساحة…' : 'Calculating perimeter and area…'}</p>}
    {status === 'error' && <div className="notice polygon-measurement-error" role="alert">
      <strong>{locale === 'ar' ? 'لم تُعرض نتيجة عددية' : 'No numeric result shown'}</strong>
      <span>{locale === 'ar'
        ? 'الهندسة غير صالحة لهذا المحرك أو متحللة وفق عقد P6.6.'
        : 'The geometry is invalid or degenerate for this engine under the P6.6 contract.'}</span>
      {error && <small>{error}</small>}
    </div>}
    {status === 'ready' && perimeter != null && area != null && signedArea != null && orientation && <>
      <div className="polygon-measurement-values">
        <div>
          <span>{locale === 'ar' ? 'المحيط المغلق' : 'Closed perimeter'}</span>
          <strong dir="ltr">{format(perimeter, locale, engine === 'gleason' ? 12 : 3)} {perimeterUnit}</strong>
        </div>
        <div>
          <span>{locale === 'ar' ? 'المساحة الأساسية' : 'Primary area'}</span>
          <strong dir="ltr">{format(area, locale, engine === 'gleason' ? 12 : 3)} {areaUnit}</strong>
        </div>
        <div>
          <span>{locale === 'ar' ? 'المساحة الموقّعة' : 'Signed area'}</span>
          <strong dir="ltr">{format(signedArea, locale, engine === 'gleason' ? 12 : 3)} {areaUnit}</strong>
        </div>
      </div>
      {engine === 'gleason' && secondaryPerimeter && secondaryArea && <div className="gleason-polygon-derived">
        <span>{locale === 'ar' ? 'معايرة مسطرة مشتقة — ليست مساحة سطح تاريخية' : 'Derived ruler calibration — not a historical surface-area claim'}</span>
        <strong dir="ltr">{secondaryPerimeter}</strong>
        <strong dir="ltr">{secondaryArea}</strong>
      </div>}
      <div className="polygon-measurement-meta">
        <span><b>{locale === 'ar' ? 'الاتجاه' : 'Orientation'}:</b> {orientationLabel(orientation, locale)}</span>
        <span><b>{locale === 'ar' ? 'أساس المقياس' : 'Scale basis'}:</b> {scaleBasis}</span>
        <span><b>{locale === 'ar' ? 'قاعدة الداخل' : 'Interior rule'}:</b> {interiorRule}</span>
      </div>
    </>}
  </article>;
}

export function PolygonMeasurementPanel({ locale, state }: Props) {
  const requestRevision = useRef(0);
  const [wgs84, setWgs84] = useState<LoadState<Wgs84PolygonResult>>(idle);
  const [ae, setAE] = useState<LoadState<AEPolygonResult>>(idle);
  const [gleason, setGleason] = useState<LoadState<GleasonPolygonResult>>(idle);

  const points = useMemo(() => state.points.map(point => ({
    point_id: point.pointId,
    latitude: point.endpoint.point.latitude,
    longitude: point.endpoint.point.longitude,
  })), [state.points]);

  useEffect(() => {
    const revision = ++requestRevision.current;
    if (points.length < 3) {
      setWgs84(idle());
      setAE(idle());
      setGleason(idle());
      return;
    }

    setWgs84(loading());
    setAE(loading());
    setGleason(loading());

    void wgs84PolygonMeasurement(points).then(result => {
      if (requestRevision.current === revision) setWgs84({ status: 'ready', result, error: null });
    }).catch(error => {
      if (requestRevision.current === revision) setWgs84({ status: 'error', result: null, error: error instanceof Error ? error.message : String(error) });
    });
    void aePolygonMeasurement(points).then(result => {
      if (requestRevision.current === revision) setAE({ status: 'ready', result, error: null });
    }).catch(error => {
      if (requestRevision.current === revision) setAE({ status: 'error', result: null, error: error instanceof Error ? error.message : String(error) });
    });
    void gleasonPolygonMeasurement(points).then(result => {
      if (requestRevision.current === revision) setGleason({ status: 'ready', result, error: null });
    }).catch(error => {
      if (requestRevision.current === revision) setGleason({ status: 'error', result: null, error: error instanceof Error ? error.message : String(error) });
    });

    return () => { requestRevision.current += 1; };
  }, [points, state.revision]);

  const wgsOutput = wgs84.result?.output ?? null;
  const aeOutput = ae.result?.output ?? null;
  const gleasonOutput = gleason.result?.output ?? null;

  return <section
    className="polygon-measurement-panel"
    data-polygon-point-count={points.length}
    data-polygon-ready={points.length >= 3 ? 'true' : 'false'}
    aria-labelledby="polygon-measurement-title"
  >
    <div className="section-heading">
      <div>
        <h2 id="polygon-measurement-title">{locale === 'ar' ? 'المضلع · المحيط · المساحة' : 'Polygon · perimeter · area'}</h2>
        <p>{locale === 'ar'
          ? 'P6.6 · تُستخدم النقاط المرتبة نفسها كرؤوس مضلع يُغلق ضمنيًا من آخر نقطة إلى الأولى. كل محرك يحسب بوحداته ومساحته الخاصة دون تطبيع بين النماذج.'
          : 'P6.6 · The same ordered points become polygon vertices, closed implicitly from last to first. Each engine keeps its own units and calculation space; no cross-model normalization is applied.'}</p>
      </div>
      <span className="evidence-badge">P6.6 · CLOSED RING</span>
    </div>

    {points.length < 3 && <p className="muted polygon-measurement-empty">{locale === 'ar'
      ? 'أضف ثلاث نقاط مرتبة على الأقل. لا تُكرر النقطة الأولى في النهاية؛ الإغلاق يتم تلقائيًا.'
      : 'Add at least three ordered points. Do not repeat the first point at the end; closure is automatic.'}</p>}

    {points.length >= 3 && <>
      <div className="notice polygon-measurement-semantics">
        <strong>{locale === 'ar' ? 'دلالة P6.6' : 'P6.6 semantics'}</strong>
        <span>{locale === 'ar'
          ? 'المساحة الأساسية هي القيمة المطلقة للمساحة الموقّعة. الاتجاه يحدد الإشارة. التقاطع الذاتي يُحسب جبريًا ولا يُفسَّر تلقائيًا كمساحة تعبئة/اتحاد.'
          : 'Primary area is the absolute signed area. Orientation controls the sign. Self-intersection is algebraic and is not silently reinterpreted as a fill/union area.'}</span>
      </div>
      <div className="polygon-measurement-grid">
        <PolygonCard
          locale={locale} engine="wgs84" title="WGS84 geodesic" semanticType="REFERENCE_RESULT"
          status={wgs84.status} methodId="wgs84-geodesic" scaleBasis="wgs84-ellipsoid"
          perimeter={wgsOutput?.perimeter_m ?? null} perimeterUnit="m"
          area={wgsOutput?.area_m2 ?? null} areaUnit="m²"
          signedArea={wgsOutput?.signed_area_m2 ?? null} orientation={wgsOutput?.orientation ?? null}
          interiorRule={wgsOutput?.interior_rule ?? 'signed-half-surface-range'} error={wgs84.error}
        />
        <PolygonCard
          locale={locale} engine="ae" title="Azimuthal Equidistant" semanticType="REFERENCE_RESULT"
          status={ae.status} methodId="ae-projected-plane" scaleBasis="ae-projected-plane-si-metre"
          perimeter={aeOutput?.perimeter_m ?? null} perimeterUnit="m"
          area={aeOutput?.area_m2 ?? null} areaUnit="m²"
          signedArea={aeOutput?.signed_area_m2 ?? null} orientation={aeOutput?.orientation ?? null}
          interiorRule={aeOutput?.interior_rule ?? 'absolute-algebraic-planar-area'} error={ae.error}
        />
        <PolygonCard
          locale={locale} engine="gleason" title="Gleason normalized" semanticType="COMPUTED_RESULT"
          status={gleason.status} methodId="gleason-native-normalized" scaleBasis="gleason-normalized-model-radius"
          perimeter={gleasonOutput?.perimeter_normalized_radius_unit ?? null} perimeterUnit="NRU"
          area={gleasonOutput?.area_normalized_radius_unit_squared ?? null} areaUnit="NRU²"
          signedArea={gleasonOutput?.signed_area_normalized_radius_unit_squared ?? null} orientation={gleasonOutput?.orientation ?? null}
          interiorRule={gleasonOutput?.interior_rule ?? 'absolute-algebraic-planar-area'} error={gleason.error}
          secondaryPerimeter={gleasonOutput ? `${format(gleasonOutput.perimeter_map_ruler_nautical_mile_derived, locale, 2)} derived NM perimeter` : null}
          secondaryArea={gleasonOutput ? `${format(gleasonOutput.area_map_ruler_nautical_mile_squared_derived, locale, 2)} derived NM² planar area` : null}
        />
      </div>
      <div className="notice polygon-measurement-boundary">
        <strong>{locale === 'ar' ? 'لا توجد مساواة مخفية بين النتائج' : 'No hidden equivalence between results'}</strong>
        <span>{locale === 'ar'
          ? 'متر ومتر² في AE يصفان المستوى المسقط، لا مساحة WGS84. وحدات Gleason المعيارية لا تتحول تلقائيًا إلى متر/كم أو متر²/كم².'
          : 'AE metres/m² describe the projected plane, not WGS84 ellipsoidal area. Gleason normalized units are not automatically converted to SI length or area.'}</span>
      </div>
    </>}
  </section>;
}
