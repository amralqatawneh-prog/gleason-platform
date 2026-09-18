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
  return <details className="phase-card globe-layer-controls" open>
    <summary>{locale === 'ar' ? 'طبقات الكرة المرجعية' : 'Reference globe layers'}</summary>
    <p>{locale === 'ar'
      ? 'حدود الدول مضمنة في التطبيق. احفظ حزم الدول لإتاحة معالمها ومطاراتها دون اتصال.'
      : 'Country boundaries are bundled. Save country packs to use their features and airports offline.'}</p>
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
  </details>;
}
