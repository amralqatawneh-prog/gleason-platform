import type { Dispatch } from 'react';
import type { GeographicSelection } from '../comparison/geographicSelection';
import type { OrderedRouteAction, OrderedRouteState } from './routeState';

type Props = {
  locale: 'ar' | 'en';
  selection: GeographicSelection | null;
  state: OrderedRouteState;
  dispatch: Dispatch<OrderedRouteAction>;
};

function pointLetter(index: number): string {
  return index < 26 ? String.fromCharCode(65 + index) : `P${index + 1}`;
}

function pointName(
  point: OrderedRouteState['points'][number],
  locale: 'ar' | 'en',
): string {
  const place = point.endpoint.place;
  if (place) {
    return locale === 'ar' && place.nameAr ? place.nameAr : place.name;
  }
  return `${point.endpoint.point.latitude.toFixed(6)}, ${point.endpoint.point.longitude.toFixed(6)}`;
}

function errorText(code: OrderedRouteState['lastError'], locale: 'ar' | 'en'): string | null {
  if (!code) return null;
  if (locale === 'ar') {
    if (code === 'ambiguous-country-endpoint') return 'لا يمكن إضافة سجل دولة كنقطة مسار ضمنية. اختر نقطة جغرافية صريحة داخل الدولة.';
    if (code === 'route-full') return 'وصل المسار إلى الحد الأقصى المؤقت للنقاط في P6.2.';
    if (code === 'invalid-coordinate') return 'إحداثيات النقطة الحالية غير صالحة للمسار.';
    if (code === 'invalid-endpoint-id') return 'تعذر إنشاء هوية صريحة لنقطة المسار.';
    return 'لا يمكن إضافة النقطة الحالية إلى المسار.';
  }
  if (code === 'ambiguous-country-endpoint') return 'A country record is not an implicit route point. Choose an explicit geographic point inside the country.';
  if (code === 'route-full') return 'The transient P6.2 route has reached its point limit.';
  if (code === 'invalid-coordinate') return 'The current coordinates are invalid for a route point.';
  if (code === 'invalid-endpoint-id') return 'Could not create an explicit route-point identity.';
  return 'The current point cannot be added to the route.';
}

export function OrderedRoutePanel({ locale, selection, state, dispatch }: Props) {
  const error = errorText(state.lastError, locale);
  return <section
    className="ordered-route-panel"
    data-route-point-count={state.points.length}
    data-route-segment-count={state.segments.length}
    data-route-revision={state.revision}
    data-route-persistent="false"
    aria-labelledby="ordered-route-title"
  >
    <div className="section-heading">
      <div>
        <h2 id="ordered-route-title">{locale === 'ar' ? 'المسار المرتب' : 'Ordered route state'}</h2>
        <p>{locale === 'ar'
          ? 'P6.2 · رتّب نقاط A ← B ← C مؤقتًا. لا تُحسب أي مسافة أو مساحة في هذه الشريحة.'
          : 'P6.2 · Build an ordered A → B → C route in transient state. No distance or area is calculated in this slice.'}</p>
      </div>
      <span className="evidence-badge">P6.2 · STATE ONLY</span>
    </div>

    <div className="ordered-route-actions">
      <button type="button" disabled={!selection} onClick={() => selection && dispatch({ type: 'add-selection', selection })}>
        {locale === 'ar' ? 'أضف النقطة الحالية' : 'Add current point'}
      </button>
      <button className="secondary" type="button" disabled={state.history.length === 0} onClick={() => dispatch({ type: 'undo' })}>
        {locale === 'ar' ? 'تراجع' : 'Undo'}
      </button>
      <button className="secondary" type="button" disabled={state.points.length === 0} onClick={() => dispatch({ type: 'clear' })}>
        {locale === 'ar' ? 'امسح المسار' : 'Clear route'}
      </button>
    </div>

    {error && <div className="notice ordered-route-error" role="alert">
      <strong>{locale === 'ar' ? 'لم تُضف النقطة' : 'Point not added'}</strong>
      <span>{error}</span>
      <button className="secondary" type="button" onClick={() => dispatch({ type: 'dismiss-error' })}>
        {locale === 'ar' ? 'إغلاق' : 'Dismiss'}
      </button>
    </div>}

    {state.points.length === 0
      ? <p className="muted ordered-route-empty">{locale === 'ar'
          ? 'المسار فارغ. اختر مكانًا أو نقطة حرة ثم أضف النقطة الحالية.'
          : 'The route is empty. Select a place or free point, then add the current point.'}</p>
      : <ol className="ordered-route-points">
          {state.points.map((point, index) => <li
            key={point.pointId}
            className="ordered-route-point"
            data-route-point-id={point.pointId}
            data-source-model={point.endpoint.sourceModel}
          >
            <div className="ordered-route-point__identity">
              <strong>{pointLetter(index)} · {pointName(point, locale)}</strong>
              <span dir="ltr">Lat {point.endpoint.point.latitude.toFixed(6)}° · Lon {point.endpoint.point.longitude.toFixed(6)}°</span>
              <small>{point.pointId} · {point.endpoint.selectionKind} · {point.endpoint.sourceModel}</small>
            </div>
            <div className="ordered-route-point__actions">
              <button className="secondary" type="button" disabled={index === 0}
                aria-label={locale === 'ar' ? `حرّك ${pointLetter(index)} للأعلى` : `Move ${pointLetter(index)} up`}
                onClick={() => dispatch({ type: 'move', pointId: point.pointId, direction: 'up' })}>↑</button>
              <button className="secondary" type="button" disabled={index === state.points.length - 1}
                aria-label={locale === 'ar' ? `حرّك ${pointLetter(index)} للأسفل` : `Move ${pointLetter(index)} down`}
                onClick={() => dispatch({ type: 'move', pointId: point.pointId, direction: 'down' })}>↓</button>
              <button className="secondary" type="button"
                aria-label={locale === 'ar' ? `احذف ${pointLetter(index)}` : `Remove ${pointLetter(index)}`}
                onClick={() => dispatch({ type: 'remove', pointId: point.pointId })}>×</button>
            </div>
          </li>)}
        </ol>}

    <div className="ordered-route-segments" data-has-numeric-measurement="false">
      <strong>{locale === 'ar' ? 'مقاطع المسار' : 'Route segments'}</strong>
      {state.segments.length === 0
        ? <span className="muted">{locale === 'ar' ? 'أضف نقطتين على الأقل لإنشاء مقطع.' : 'Add at least two points to create a segment.'}</span>
        : state.segments.map(segment => {
            const from = state.points.findIndex(point => point.pointId === segment.fromPointId);
            const to = state.points.findIndex(point => point.pointId === segment.toPointId);
            return <span key={segment.segmentId} className="ordered-route-segment" data-route-segment-id={segment.segmentId}>
              {pointLetter(from)} → {pointLetter(to)}
            </span>;
          })}
      <small>{locale === 'ar'
        ? 'هوية المقاطع فقط — لا توجد مسافة عددية في P6.2.'
        : 'Segment identity only — P6.2 exposes no numeric distance.'}</small>
    </div>

    <div className="notice ordered-route-boundary">
      <strong>{locale === 'ar' ? 'حدود P6.2' : 'P6.2 boundary'}</strong>
      <span>{locale === 'ar'
        ? 'هذه الحالة مؤقتة داخل الجلسة ولا تُحفظ في IndexedDB. الحسابات العددية تبدأ في الشرائح اللاحقة.'
        : 'This state is transient for the current session and is not saved to IndexedDB. Numeric measurement starts in later slices.'}</span>
    </div>
  </section>;
}
