import type { GlobeLayerId, GlobeLayerVisibility } from './globeLayers';

const items: Array<{ id: GlobeLayerId; ar: string; en: string }> = [
  { id: 'countries', ar: 'حدود الدول وأسماؤها', en: 'Country boundaries & names' },
  { id: 'oceans', ar: 'المحيطات', en: 'Oceans' },
  { id: 'seas', ar: 'البحار', en: 'Seas' },
  { id: 'rivers', ar: 'الأنهار', en: 'Rivers' },
  { id: 'cities', ar: 'المدن', en: 'Cities' },
  { id: 'airports', ar: 'مطارات الحزم المحفوظة', en: 'Saved-pack airports' },
  { id: 'labels', ar: 'أسماء المعالم', en: 'Feature labels' },
];

type Props = {
  locale: 'ar' | 'en';
  layers: GlobeLayerVisibility;
  onChange: (next: GlobeLayerVisibility) => void;
  featureCount: number;
};

export function GlobeLayerControls({ locale, layers, onChange, featureCount }: Props) {
  return <section className="phase-card globe-layer-controls">
    <span className="eyebrow">Phase 4 · P4.6</span>
    <h2>{locale === 'ar' ? 'طبقات الكرة المرجعية' : 'Reference globe layers'}</h2>
    <p>{locale === 'ar'
      ? 'حدود الدول من الحزمة العالمية المضمنة، وبقية المعالم من فهارس Phase 3 المحفوظة محليًا. المطارات تظهر فقط من حزم الدول التي حفظتها.'
      : 'Country boundaries come from the bundled world atlas; other features come from locally cached Phase 3 indexes. Airports appear only from country packs you saved.'}</p>
    <div className="layer-toggle-list">
      {items.map((item) => <label key={item.id} className="layer-toggle">
        <input
          type="checkbox"
          checked={layers[item.id]}
          onChange={(event) => onChange({ ...layers, [item.id]: event.target.checked })}
        />
        <span>{locale === 'ar' ? item.ar : item.en}</span>
      </label>)}
    </div>
    <small>{locale === 'ar' ? 'المعالم المحملة حاليًا' : 'Currently loaded features'}: {featureCount}</small>
  </section>;
}
