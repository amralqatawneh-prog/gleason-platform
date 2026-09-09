import { gleasonSourceCatalog } from './gleasonCatalog';

export function SourceViewer({ locale }: { locale: 'ar' | 'en' }) {
  const ar = locale === 'ar';
  return (
    <section className="source-viewer">
      <div className="section-heading">
        <div><h2>{ar ? 'عارض المصدر التاريخي' : 'Historical Source Viewer'}</h2><p>{gleasonSourceCatalog.title} · {gleasonSourceCatalog.edition}</p></div>
        <span className="evidence-badge">SHA-256 verified</span>
      </div>
      <div className="source-grid">
        {gleasonSourceCatalog.figures.map((item) => (
          <article className="source-card" key={item.id}>
            <div className="source-card__top"><strong>{item.label}</strong><span>{item.evidence}</span></div>
            <p>{item.topic}</p><small>{item.pages}</small><p className="source-note">{item.note}</p>
          </article>
        ))}
      </div>
      <div className="georef-status"><strong>{ar ? 'المعايرة التاريخية' : 'Historical georeferencing'}</strong><span>{gleasonSourceCatalog.georeferencing.engine}</span><p>{gleasonSourceCatalog.georeferencing.note}</p></div>
    </section>
  );
}
