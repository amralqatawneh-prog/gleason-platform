import { useMemo } from 'react';
import type { GeographicSelection } from './geographicSelection';
import { inspectSelection, type LaboratoryEntry } from './modelLaboratory';
import { laboratoryComparability, type ComparabilityDecision, type ComparabilityReasonCode } from './comparability';
import { laboratoryDifferences, type HomogeneousDifference } from './homogeneousDifference';
import { FUTURE_SERVICE_CONTRACTS, type FutureServiceContract, type FutureServiceKind } from './futureServices';

type Props = { locale: 'ar' | 'en'; selection: GeographicSelection | null };

const copy = {
  ar: {
    title:'مختبر النماذج',
    subtitle:'P5.4–P5.7 · تمثيل مستقل، قابلية مقارنة، وفروق محكومة بالعقد',
    introTitle:'نفس النقطة الجغرافية ← ثلاث طرق مستقلة لتمثيلها',
    introBody:'هذه القيم تصف موقع النقطة داخل نظام كل نموذج. هي ليست مسافة بين مدينتين، ولا يحوّل البرنامج نموذجًا إلى آخر.',
    empty:'اختر مكانًا أو نقطة جغرافية لعرض نتائج النماذج الثلاثة.',
    canonical:'النقطة التي تدخل إلى النماذج الثلاثة',
    version:'الإصدار',unit:'الوحدة',semantic:'تصنيف النتيجة',evidence:'مستوى الدليل',domain:'المجال',
    heightPolicy:'سياسة الارتفاع',input:'المدخل',output:'النتيجة العددية',unavailable:'غير متاح لهذا المدخل',
    sources:'المصادر والأدلة',limitations:'الحدود',notes:'ملاحظات الحساب',unknown:'غير معروف',
    origin:'أصل الاختيار',place:'هوية المكان',none:'لا توجد',
    technical:'إظهار التفاصيل التقنية',
    hideMeaning:'ما معنى هذه النتيجة؟',
    distanceWarning:'هذه الأرقام لا تمثل مسافة بين مكانين.',
    compareTitle:'عقد قابلية المقارنة',
    compareIntro:'لا يكفي تشابه الأرقام أو حتى تشابه الوحدة لكي تصبح نتيجتان قابلتين للمقارنة. يجب أن يتطابق معنى الكمية ونظام الإحداثيات والوحدة والمقياس.',
    comparable:'قابلة للمقارنة مباشرة',
    notComparable:'غير قابلة للمقارنة مباشرة',
    comparisonUnavailable:'المقارنة غير متاحة حاليًا',
    noConversion:'لم يُطبّق أي تحويل أو تطبيع بين النماذج.',
    differenceTitle:'الفرق العددي',
    differenceBlocked:'لا يُعرض فرق عددي لأن الكميتين غير متجانستين وفق عقد P5.5.',
    differenceAvailable:'فرق متجانس مسموح',
    differenceRule:'يحسب P5.7 الفرق الموقّع (اليمين − اليسار) فقط بعد نجاح عقد القابلية، ومن دون أي تحويل للوحدات.',
    futureTitle:'عقود الخدمات المستقبلية',
    futureIntro:'هذه العقود تحجز حدودًا versioned فقط. حالة Unavailable تعني أن الخدمة نفسها لم تُنفذ بعد.',
    futureUnavailable:'غير متاح',
    plannedPhase:'المرحلة المخططة',
    compareBoundary:'الأزواج الثلاثة الحالية غير متجانسة، لذلك لا يعرض P5.7 أي فرق رقمي بينها. هذا مقصود وليس نقصًا في الحساب.',
  },
  en: {
    title:'Model Laboratory',
    subtitle:'P5.4–P5.7 · Independent representation, comparability and contract-gated differences',
    introTitle:'One geographic point → three independent representations',
    introBody:'These values describe where the point sits inside each model system. They are not distances between cities, and the app does not convert one model into another.',
    empty:'Select a place or geographic point to inspect all three models.',
    canonical:'Point sent to all three models',
    version:'Version',unit:'Unit',semantic:'Result classification',evidence:'Evidence level',domain:'Domain',
    heightPolicy:'Height policy',input:'Input',output:'Numeric result',unavailable:'Unavailable for this input',
    sources:'Sources and evidence',limitations:'Limitations',notes:'Computation notes',unknown:'Unknown',
    origin:'Selection origin',place:'Place identity',none:'None',
    technical:'Show technical details',
    hideMeaning:'What does this result mean?',
    distanceWarning:'These numbers are not a distance between two places.',
    compareTitle:'Comparability contract',
    compareIntro:'Similar numbers — or even the same unit — do not make two results comparable. Quantity meaning, coordinate space, unit and scale must be compatible.',
    comparable:'Directly comparable',
    notComparable:'Not directly comparable',
    comparisonUnavailable:'Comparison currently unavailable',
    noConversion:'No conversion or normalization was applied between models.',
    differenceTitle:'Numeric difference',
    differenceBlocked:'No numeric difference is shown because the quantities are not homogeneous under the P5.5 contract.',
    differenceAvailable:'Allowed homogeneous difference',
    differenceRule:'P5.7 computes signed right − left differences only after comparability passes, with no unit conversion.',
    futureTitle:'Future service contracts',
    futureIntro:'These versioned contracts reserve boundaries only. Unavailable means the service itself is not implemented yet.',
    futureUnavailable:'Unavailable',
    plannedPhase:'Planned phase',
    compareBoundary:'All three current cross-model pairs are heterogeneous, so P5.7 intentionally shows no numeric cross-model difference.',
  },
} as const;

function format(value:number):string {
  if (Math.abs(value) >= 1_000_000) return value.toFixed(3);
  if (Math.abs(value) >= 1_000) return value.toFixed(6);
  return value.toFixed(9);
}

function meaning(entry:LaboratoryEntry, locale:'ar'|'en') {
  if (locale === 'ar') {
    if (entry.key === 'gleason') return {
      title:'موقع النقطة على نموذج Gleason',
      body:'تمثل X وY موقع هذه النقطة على الخريطة الدائرية الحسابية. وحدة normalized-radius هي نسبة إلى نصف قطر الخريطة، وليست مترًا أو كيلومترًا.',
      note:'تفيد هذه النتيجة في معرفة موضع النقطة داخل نظام Gleason نفسه.',
    };
    if (entry.key === 'ae') return {
      title:'موقع النقطة على إسقاط Azimuthal Equidistant',
      body:'تمثل X وY موقع النقطة على المستوى الرياضي لإسقاط AE بالمتر بالنسبة إلى أصل الإسقاط القطبي.',
      note:'تفيد هذه النتيجة في تحديد موضع النقطة داخل هذا الإسقاط، لا في قياس المسافة إلى مدينة أخرى.',
    };
    if (entry.status === 'unavailable') return {
      title:'إحداثيات WGS84 ثلاثية الأبعاد غير متاحة',
      body:'خط العرض والطول معروفان، لكن الارتفاع الإهليلجي غير موجود في هذا الاختيار. لذلك لا يستطيع المحرك حساب ECEF X/Y/Z دون افتراض قيمة غير موثوقة.',
      note:'لم يفترض البرنامج ارتفاعًا وهميًا يساوي 0 متر.',
    };
    return {
      title:'إحداثيات WGS84 ثلاثية الأبعاد ECEF',
      body:'تمثل X وY وZ موضع النقطة في نظام ثلاثي الأبعاد بالنسبة إلى مركز الإهليلج WGS84، وبوحدة المتر.',
      note:'هذه مركبات موضع ثلاثي الأبعاد وليست مسافة بين مكانين.',
    };
  }
  if (entry.key === 'gleason') return {
    title:'Point position in the Gleason model',
    body:'X and Y locate this point on the computational circular map. normalized-radius is a fraction of the map radius, not metres or kilometres.',
    note:'This is useful for locating the point inside the Gleason system itself.',
  };
  if (entry.key === 'ae') return {
    title:'Point position in the Azimuthal Equidistant projection',
    body:'X and Y locate the point on the mathematical AE plane in metres relative to the polar projection origin.',
    note:'This locates the point inside the projection; it is not a distance to another city.',
  };
  if (entry.status === 'unavailable') return {
    title:'WGS84 three-dimensional coordinates are unavailable',
    body:'Latitude and longitude are known, but this selection has no ellipsoidal height. ECEF X/Y/Z therefore cannot be calculated without inventing an unsupported value.',
    note:'The application did not silently assume a 0 m height.',
  };
  return {
    title:'WGS84 ECEF three-dimensional coordinates',
    body:'X, Y and Z locate the point in a three-dimensional system relative to the WGS84 ellipsoid centre, in metres.',
    note:'These are 3D position components, not a distance between two places.',
  };
}

export function ModelLaboratory({ locale, selection }:Props) {
  const t=copy[locale];
  const entries=useMemo(()=>inspectSelection(selection),[selection]);
  const comparisons=useMemo(()=>laboratoryComparability(entries),[entries]);
  const differences=useMemo(()=>laboratoryDifferences(entries,comparisons),[entries,comparisons]);
  return <section className="model-laboratory" aria-labelledby="model-laboratory-title">
    <div className="section-heading model-laboratory__heading">
      <div><h2 id="model-laboratory-title">{t.title}</h2><p>{t.subtitle}</p></div><span className="evidence-badge">P5.4–P5.7</span>
    </div>
    {!selection ? <p className="muted model-laboratory__empty">{t.empty}</p> : <>
      <div className="model-lab-intro">
        <strong>{t.introTitle}</strong>
        <span>{t.introBody}</span>
      </div>
      <div className="model-lab-canonical" data-selection-kind={selection.kind}>
        <strong>{t.canonical}</strong>
        <span dir="ltr">Lat {selection.point.latitude.toFixed(6)}° · Lon {selection.point.longitude.toFixed(6)}°</span>
        <span>{locale==='ar'?'الارتفاع الإهليلجي':'Ellipsoidal height'}: {selection.point.ellipsoidalHeightM===undefined?t.unknown:`${selection.point.ellipsoidalHeightM.toFixed(3)} m`}</span>
        <span>{t.origin}: {selection.origin} · {selection.model}</span>
        <span>{t.place}: {selection.place?`${selection.place.id} · ${selection.place.sourceId} · ${selection.place.sourceVersion??t.unknown}`:t.none}</span>
      </div>
      <div className="model-lab-grid">{entries.map(entry=><ModelCard key={entry.key} entry={entry} locale={locale} t={t}/>)}</div>
      <ComparabilityPanel decisions={comparisons} differences={differences} locale={locale} t={t}/>
      <FutureServicesPanel contracts={FUTURE_SERVICE_CONTRACTS} locale={locale} t={t}/>
      <p className="model-lab-boundary">{t.compareBoundary}</p>
    </>}
  </section>;
}

function ModelCard({entry,locale,t}:{entry:LaboratoryEntry;locale:'ar'|'en';t:typeof copy.ar|typeof copy.en}) {
  const explanation=meaning(entry,locale);
  const inputHeight=entry.metadata.heightPolicy==='required-ellipsoidal-metres'
    ?(locale==='ar'?'يتطلب ارتفاعًا إهليلجيًا صريحًا':'Requires explicit ellipsoidal height')
    :(locale==='ar'?'الارتفاع غير ممثل':'Height is not represented');
  return <article className="model-lab-card" data-model={entry.key} data-status={entry.status}>
    <div className="model-lab-card__top">
      <div><strong>{entry.displayName}</strong><small>{entry.metadata.modelId}</small></div>
      <span className={`model-lab-status ${entry.status}`}>{entry.status==='available'?(locale==='ar'?'متاح':'Available'):t.unavailable}</span>
    </div>

    <section className="model-lab-meaning" aria-label={t.hideMeaning}>
      <strong>{explanation.title}</strong>
      <p>{explanation.body}</p>
      <small>{explanation.note}</small>
    </section>

    {entry.status==='available'&&entry.output
      ? <div className="model-lab-result">
          <strong>{t.output}</strong>
          <div dir="ltr">{entry.output.values.map(value=><span key={value.label}>{value.label} {format(value.value)} {entry.metadata.units}</span>)}</div>
          <small>{t.distanceWarning}</small>
        </div>
      : <div className="model-lab-unavailable model-lab-result">
          <strong>{t.unavailable}</strong>
          <code>{entry.errorCode}</code>
          <span>{locale==='ar'?'السبب: الارتفاع الإهليلجي المطلوب غير موجود في بيانات النقطة الحالية.':'Reason: the required ellipsoidal height is missing from the current point data.'}</span>
        </div>}

    <details className="model-lab-technical">
      <summary>{t.technical}</summary>
      <dl className="model-lab-meta">
        <div><dt>{t.version}</dt><dd>{entry.metadata.modelVersion}</dd></div>
        <div><dt>{t.unit}</dt><dd>{entry.metadata.units}</dd></div>
        <div><dt>{t.semantic}</dt><dd>{entry.metadata.semanticType}</dd></div>
        <div><dt>{t.evidence}</dt><dd>{entry.metadata.evidenceLevel}</dd></div>
        <div><dt>{t.heightPolicy}</dt><dd>{inputHeight}</dd></div>
        <div className="model-lab-meta__wide"><dt>{t.domain}</dt><dd>{entry.metadata.domain}</dd></div>
      </dl>
      <div className="model-lab-io"><div><strong>{t.input}</strong><span>WGS84 · degrees</span></div></div>
      {entry.notes.length>0&&<section><strong>{t.notes}</strong><ul>{entry.notes.map((note,index)=><li key={index}>{note}</li>)}</ul></section>}
      <section><strong>{t.sources}</strong><ul>{entry.metadata.evidence.map((source,index)=><li key={`${source.sourceId}-${index}`}><code>{source.sourceId}</code> · {source.evidenceLevel}<br/><span>{source.locator}</span><br/><small>{source.note}</small></li>)}</ul></section>
      <section><strong>{t.limitations}</strong><ul>{entry.metadata.limitations.map((limit,index)=><li key={index}>{limit}</li>)}</ul></section>
    </details>
  </article>;
}


function comparisonReason(reason:ComparabilityReasonCode,locale:'ar'|'en'):string {
  const ar:Record<ComparabilityReasonCode,string>={
    'missing-output':'إحدى النتيجتين غير متاحة للمدخل الحالي.',
    'different-meaning':'نوع الكمية مختلف؛ الإحداثيات المستوية ليست هي إحداثيات ECEF ثلاثية الأبعاد.',
    'different-coordinate-space':'كل نتيجة معرفة داخل نظام إحداثيات/مرجع مختلف، لذلك لا يجوز طرح المركبات أو مساواتها مباشرة.',
    'different-units':'الوحدات مختلفة بين النتيجتين.',
    'undefined-cross-model-scale':'لا توجد قاعدة مقياس موثقة لتحويل normalized-radius بين هذا النموذج ونظام الأمتار؛ لا يُفترض تحويل إلى متر أو كيلومتر.',
  };
  const en:Record<ComparabilityReasonCode,string>={
    'missing-output':'One result is unavailable for the current input.',
    'different-meaning':'The quantity meaning differs: planar coordinates are not the same quantity as 3D ECEF coordinates.',
    'different-coordinate-space':'Each result is defined in a different coordinate/reference space, so components cannot be subtracted or equated directly.',
    'different-units':'The result units differ.',
    'undefined-cross-model-scale':'There is no declared scale basis for converting normalized-radius across this model boundary into metres or kilometres.',
  };
  return (locale==='ar'?ar:en)[reason];
}

function ComparabilityPanel({decisions,differences,locale,t}:{decisions:readonly Readonly<ComparabilityDecision>[];differences:readonly Readonly<HomogeneousDifference>[];locale:'ar'|'en';t:typeof copy.ar|typeof copy.en}) {
  return <section className="model-comparability" aria-labelledby="model-comparability-title">
    <div className="model-comparability__head">
      <div><h3 id="model-comparability-title">{t.compareTitle}</h3><p>{t.compareIntro}</p></div>
      <span className="evidence-badge">P5.5</span>
    </div>
    <div className="model-comparability__grid">
      {decisions.map((decision,index)=>{
        const pair=`${decision.left.key}-${decision.right.key}`;
        const difference=differences[index];
        const statusLabel=decision.status==='comparable'?t.comparable:decision.status==='unavailable'?t.comparisonUnavailable:t.notComparable;
        return <article
          key={pair}
          className="model-comparison-card"
          data-comparison-pair={pair}
          data-comparison-status={decision.status}
          data-reasons={decision.reasons.join(',')}
          data-conversion-applied="false"
        >
          <div className="model-comparison-card__top">
            <strong>{decision.left.key.toUpperCase()} ↔ {decision.right.key.toUpperCase()}</strong>
            <span className={`model-comparison-status ${decision.status}`}>{statusLabel}</span>
          </div>
          <div className="model-comparison-signature" dir="ltr">
            <span>{decision.left.meaning} · {decision.left.units}</span>
            <span>↔</span>
            <span>{decision.right.meaning} · {decision.right.units}</span>
          </div>
          <ul>{decision.reasons.map(reason=><li key={reason}>{comparisonReason(reason,locale)}</li>)}</ul>
          <div className="model-comparison-difference" data-difference-status={difference?.status??'blocked'}>
            <strong>{t.differenceTitle}</strong>
            {difference?.status==='available'
              ? <div dir="ltr">{difference.values.map(value=><span key={value.label}>Δ{value.label} {format(value.delta)} {difference.unit}</span>)}</div>
              : <span>{t.differenceBlocked}</span>}
          </div>
          <small>{t.noConversion}</small>
        </article>;
      })}
    </div>
  </section>;
}


function futureServiceText(kind:FutureServiceKind,locale:'ar'|'en') {
  const ar:Record<FutureServiceKind,{title:string;body:string}>={
    time:{title:'خدمة الزمن/الفلك',body:'العقد محجوز فقط؛ لا يوجد في المرحلة الخامسة محرك فلكي أو خط زمني. التنفيذ المخطط في المراحل 9–10.'},
    'layer-sync':{title:'مزامنة الطبقات بين النماذج',body:'الطبقات المحلية الموجودة داخل بعض العروض لا تعني وجود خدمة طبقات مشتركة بين النماذج. النظام المتقدم مخطط للمرحلة 16.'},
    route:{title:'خدمة المسارات والقياس',body:'تضيف P6.2 حالة مرتبة مؤقتة لنقاط المسار في لوحة مستقلة. رسم المسارات والمسافة والمسطرة والمساحة ليست منفذة هنا وتبقى لشرائح لاحقة من المرحلة 6.'},
  };
  const en:Record<FutureServiceKind,{title:string;body:string}>={
    time:{title:'Time / astronomy service',body:'Only the contract boundary is reserved; Phase 5 has no astronomy engine or timeline. Implementation is planned for phases 9–10.'},
    'layer-sync':{title:'Cross-model layer synchronization',body:'Existing view-local layers do not constitute a shared cross-model layer service. The advanced layer system is planned for phase 16.'},
    route:{title:'Route and measurement service',body:'P6.2 adds transient ordered route-point state in a separate panel. Route drawing, distance, ruler and area are not implemented here and remain later phase 6 work.'},
  };
  return (locale==='ar'?ar:en)[kind];
}

function FutureServicesPanel({contracts,locale,t}:{contracts:readonly Readonly<FutureServiceContract>[];locale:'ar'|'en';t:typeof copy.ar|typeof copy.en}) {
  return <section className="future-contracts" aria-labelledby="future-contracts-title">
    <div className="future-contracts__head">
      <div><h3 id="future-contracts-title">{t.futureTitle}</h3><p>{t.futureIntro}</p></div>
      <span className="evidence-badge">P5.7</span>
    </div>
    <div className="future-contracts__grid">
      {contracts.map(contract=>{
        const text=futureServiceText(contract.kind,locale);
        return <article className="future-contract-card" key={contract.kind} data-future-service={contract.kind} data-service-status={contract.status}>
          <div className="future-contract-card__top">
            <strong>{text.title}</strong>
            <span>{t.futureUnavailable}</span>
          </div>
          <p>{text.body}</p>
          <small>{t.plannedPhase}: {contract.plannedPhase} · contract v{contract.contractVersion}</small>
        </article>;
      })}
    </div>
  </section>;
}
