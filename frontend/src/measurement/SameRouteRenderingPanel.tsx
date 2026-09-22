import type { MeasurementMethodId } from './contracts';
import type { SameRouteRenderingPlan } from './sameRouteRendering';

type Props = {
  locale: 'ar' | 'en';
  plan: SameRouteRenderingPlan;
  methodId: MeasurementMethodId;
  onMethodChange: (methodId: MeasurementMethodId) => void;
};

const METHODS: readonly MeasurementMethodId[] = Object.freeze([
  'wgs84-geodesic',
  'ae-projected-plane',
  'gleason-native-normalized',
]);

function methodLabel(methodId: MeasurementMethodId, locale: 'ar' | 'en'): string {
  if (locale === 'ar') {
    if (methodId === 'wgs84-geodesic') return 'WGS84 جيوديسي';
    if (methodId === 'ae-projected-plane') return 'AE — خط مستقيم على المستوى المسقط';
    return 'Gleason — وتر مستقيم في المستوى المعياري';
  }
  if (methodId === 'wgs84-geodesic') return 'WGS84 geodesic';
  if (methodId === 'ae-projected-plane') return 'AE projected-plane chord';
  return 'Gleason normalized-plane chord';
}

function viewLabel(model: 'gleason' | 'ae' | 'wgs84', locale: 'ar' | 'en'): string {
  if (model === 'gleason') return locale === 'ar' ? 'عرض جليسون' : 'Gleason view';
  if (model === 'ae') return locale === 'ar' ? 'عرض AE' : 'AE view';
  return locale === 'ar' ? 'عرض WGS84' : 'WGS84 view';
}

export function SameRouteRenderingPanel({ locale, plan, methodId, onMethodChange }: Props) {
  const t = locale === 'ar' ? {
    title: 'نفس المسار — ثلاثة تمثيلات',
    intro: 'P6.7A · اختر هوية حساب واحدة. تُبنى هندسة المسار مرة واحدة من المسار المرتب نفسه ثم تُعرض على Gleason وAE وWGS84 دون تغيير هوية الحساب.',
    choose: 'هوية الحساب المختارة',
    route: 'هوية المسار',
    revision: 'مراجعة المسار',
    points: 'النقاط',
    segments: 'المقاطع',
    geometry: 'هندسة الحساب',
    quantity: 'الكمية',
    unit: 'الوحدة',
    scale: 'أساس المقياس',
    rule: 'قاعدة التفسير',
    empty: 'أضف نقطتين على الأقل إلى المسار المرتب لرؤية الخط نفسه على العروض الثلاثة.',
    invariant: 'العرض لا يغيّر الحساب: WGS84 المرسوم على جليسون يبقى WGS84، وAE المرسوم على WGS84 يبقى AE، وهكذا.',
    renderedOn: 'يُعرض على',
  } : {
    title: 'Same route — three renderings',
    intro: 'P6.7A · Choose one computation identity. The geometry is built once from the same ordered route, then visualized on Gleason, AE and WGS84 without changing who computed it.',
    choose: 'Selected computation identity',
    route: 'Route identity',
    revision: 'Route revision',
    points: 'Points',
    segments: 'Segments',
    geometry: 'Computation geometry',
    quantity: 'Quantity',
    unit: 'Unit',
    scale: 'Scale basis',
    rule: 'Interpretation rule',
    empty: 'Add at least two ordered route points to see the same path on all three views.',
    invariant: 'Rendering does not change computation: WGS84 drawn on Gleason remains WGS84, AE drawn on WGS84 remains AE, and so on.',
    renderedOn: 'Rendered on',
  };

  return <section
    className="same-route-rendering-panel"
    data-p6-slice="P6.7A"
    data-route-id={plan.routeId}
    data-route-revision={plan.routeRevision}
    data-route-point-count={plan.canonicalPoints.length}
    data-route-segment-count={plan.segments.length}
    data-computation-method={plan.computation.methodId}
    data-computation-model={plan.computation.calculationModel}
    data-computation-unit={plan.computation.unit}
    data-computation-scale-basis={plan.computation.scaleBasis}
    data-computation-geometry={plan.geometryKind}
    aria-labelledby="same-route-rendering-title"
  >
    <div className="section-heading">
      <div>
        <h2 id="same-route-rendering-title">{t.title}</h2>
        <p>{t.intro}</p>
      </div>
      <span className="evidence-badge">P6.7A · PRESERVE IDENTITY</span>
    </div>

    <div className="same-route-methods" role="group" aria-label={t.choose}>
      {METHODS.map(method => <button
        key={method}
        type="button"
        className={method === methodId ? 'active' : ''}
        aria-pressed={method === methodId}
        data-route-method-option={method}
        onClick={() => onMethodChange(method)}
      >{methodLabel(method, locale)}</button>)}
    </div>

    <div className="same-route-summary">
      <span><b>{t.route}:</b> <code>{plan.routeId}</code></span>
      <span><b>{t.revision}:</b> {plan.routeRevision}</span>
      <span><b>{t.points}:</b> {plan.canonicalPoints.length}</span>
      <span><b>{t.segments}:</b> {plan.segments.length}</span>
      <span><b>{t.geometry}:</b> <code>{plan.geometryKind}</code></span>
      <span><b>{t.quantity}:</b> {plan.computation.quantity}</span>
      <span><b>{t.unit}:</b> <code>{plan.computation.unit}</code></span>
      <span><b>{t.scale}:</b> <code>{plan.computation.scaleBasis}</code></span>
    </div>

    {plan.canonicalPoints.length < 2
      ? <p className="muted same-route-empty">{t.empty}</p>
      : <div className="same-route-view-grid">
          {(['gleason', 'ae', 'wgs84'] as const).map(model => {
            const identity = plan.visualizations[model];
            return <article
              key={model}
              className="same-route-view-card"
              data-rendered-on-model={model}
              data-rendered-computation-method={identity.computation.methodId}
              data-interpretation-rule={identity.interpretationRule}
            >
              <strong>{viewLabel(model, locale)}</strong>
              <span>{t.renderedOn}: <code>{identity.renderedOnModel}</code></span>
              <span>{t.choose}: <code>{identity.computation.methodId}</code></span>
              <span>{t.unit}: <code>{identity.computation.unit}</code></span>
              <span>{t.rule}: <code>{identity.interpretationRule}</code></span>
            </article>;
          })}
        </div>}

    <div className="notice same-route-invariant">
      <strong>{locale === 'ar' ? 'ثابت P6.7A' : 'P6.7A invariant'}</strong>
      <span>{t.invariant}</span>
    </div>
  </section>;
}
