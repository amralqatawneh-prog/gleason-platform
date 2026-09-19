import { useMemo } from 'react';
import type { GeographicSelection } from './geographicSelection';
import { inspectSelection, type LaboratoryEntry } from './modelLaboratory';

type Props = { locale: 'ar' | 'en'; selection: GeographicSelection | null };
const copy = {
  ar: {
    title:'مختبر النماذج',subtitle:'P5.4 · عرض مستقل لمدخلات ومخرجات كل نموذج ومصدرها وحدودها',
    empty:'اختر مكانًا أو نقطة جغرافية لعرض نتائج النماذج الثلاثة.',canonical:'المدخل الجغرافي المشترك',
    version:'الإصدار',unit:'الوحدة',semantic:'تصنيف النتيجة',evidence:'مستوى الدليل',domain:'المجال',
    heightPolicy:'سياسة الارتفاع',input:'المدخل',output:'المخرج',unavailable:'غير متاح لهذا المدخل',
    sources:'المصادر والأدلة',limitations:'الحدود',notes:'ملاحظات الحساب',unknown:'غير معروف',
    origin:'أصل الاختيار',place:'هوية المكان',none:'لا توجد',
    compareBoundary:'لا تُقارن هذه القيم عدديًا في P5.4؛ عقد قابلية المقارنة يأتي في P5.5.',
  },
  en: {
    title:'Model Laboratory',subtitle:'P5.4 · Independent model inputs, outputs, provenance and limits',
    empty:'Select a place or geographic point to inspect all three models.',canonical:'Canonical geographic input',
    version:'Version',unit:'Unit',semantic:'Result classification',evidence:'Evidence level',domain:'Domain',
    heightPolicy:'Height policy',input:'Input',output:'Output',unavailable:'Unavailable for this input',
    sources:'Sources and evidence',limitations:'Limitations',notes:'Computation notes',unknown:'Unknown',
    origin:'Selection origin',place:'Place identity',none:'None',
    compareBoundary:'P5.4 does not compare these values numerically; the comparability contract belongs to P5.5.',
  },
} as const;

function format(value:number):string {
  if (Math.abs(value) >= 1_000_000) return value.toFixed(3);
  if (Math.abs(value) >= 1_000) return value.toFixed(6);
  return value.toFixed(9);
}

export function ModelLaboratory({ locale, selection }:Props) {
  const t=copy[locale];
  const entries=useMemo(()=>inspectSelection(selection),[selection]);
  return <section className="model-laboratory" aria-labelledby="model-laboratory-title">
    <div className="section-heading model-laboratory__heading">
      <div><h2 id="model-laboratory-title">{t.title}</h2><p>{t.subtitle}</p></div><span className="evidence-badge">P5.4</span>
    </div>
    {!selection ? <p className="muted model-laboratory__empty">{t.empty}</p> : <>
      <div className="model-lab-canonical" data-selection-kind={selection.kind}>
        <strong>{t.canonical}</strong>
        <span dir="ltr">Lat {selection.point.latitude.toFixed(6)}° · Lon {selection.point.longitude.toFixed(6)}°</span>
        <span>{locale==='ar'?'الارتفاع الإهليلجي':'Ellipsoidal height'}: {selection.point.ellipsoidalHeightM===undefined?t.unknown:`${selection.point.ellipsoidalHeightM.toFixed(3)} m`}</span>
        <span>{t.origin}: {selection.origin} · {selection.model}</span>
        <span>{t.place}: {selection.place?`${selection.place.id} · ${selection.place.sourceId} · ${selection.place.sourceVersion??t.unknown}`:t.none}</span>
      </div>
      <div className="model-lab-grid">{entries.map(entry=><ModelCard key={entry.key} entry={entry} locale={locale} t={t}/>)}</div>
      <p className="model-lab-boundary">{t.compareBoundary}</p>
    </>}
  </section>;
}

function ModelCard({entry,locale,t}:{entry:LaboratoryEntry;locale:'ar'|'en';t:typeof copy.ar|typeof copy.en}) {
  const inputHeight=entry.metadata.heightPolicy==='required-ellipsoidal-metres'
    ?(locale==='ar'?'يتطلب ارتفاعًا إهليلجيًا صريحًا':'Requires explicit ellipsoidal height')
    :(locale==='ar'?'الارتفاع غير ممثل':'Height is not represented');
  return <article className="model-lab-card" data-model={entry.key} data-status={entry.status}>
    <div className="model-lab-card__top"><div><strong>{entry.displayName}</strong><small>{entry.metadata.modelId}</small></div>
      <span className={`model-lab-status ${entry.status}`}>{entry.status==='available'?(locale==='ar'?'متاح':'Available'):t.unavailable}</span></div>
    <dl className="model-lab-meta">
      <div><dt>{t.version}</dt><dd>{entry.metadata.modelVersion}</dd></div>
      <div><dt>{t.unit}</dt><dd>{entry.metadata.units}</dd></div>
      <div><dt>{t.semantic}</dt><dd>{entry.metadata.semanticType}</dd></div>
      <div><dt>{t.evidence}</dt><dd>{entry.metadata.evidenceLevel}</dd></div>
      <div><dt>{t.heightPolicy}</dt><dd>{inputHeight}</dd></div>
      <div className="model-lab-meta__wide"><dt>{t.domain}</dt><dd>{entry.metadata.domain}</dd></div>
    </dl>
    <div className="model-lab-io">
      <div><strong>{t.input}</strong><span>WGS84 · degrees</span></div>
      {entry.status==='available'&&entry.output?<div className="model-lab-output"><strong>{t.output} · {entry.output.kind}</strong>
        <div dir="ltr">{entry.output.values.map(value=><span key={value.label}>{value.label} {format(value.value)} {entry.metadata.units}</span>)}</div>
      </div>:<div className="model-lab-unavailable"><strong>{t.unavailable}</strong><code>{entry.errorCode}</code><span>{entry.reason}</span></div>}
    </div>
    {entry.notes.length>0&&<details><summary>{t.notes}</summary><ul>{entry.notes.map((note,index)=><li key={index}>{note}</li>)}</ul></details>}
    <details><summary>{t.sources}</summary><ul>{entry.metadata.evidence.map((source,index)=><li key={`${source.sourceId}-${index}`}><code>{source.sourceId}</code> · {source.evidenceLevel}<br/><span>{source.locator}</span><br/><small>{source.note}</small></li>)}</ul></details>
    <details><summary>{t.limitations}</summary><ul>{entry.metadata.limitations.map((limit,index)=><li key={index}>{limit}</li>)}</ul></details>
  </article>;
}
