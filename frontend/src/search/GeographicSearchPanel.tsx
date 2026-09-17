import './search.css';
import { useMemo, useState } from 'react';
import { searchGeography, type GeographicSearchItem } from '../api';
import { buildOfflineGeographicIndex, searchOfflineGeography, type OfflineGeographicEntity } from '../offline/geographicSearch';

interface Props {
  locale: 'ar' | 'en';
  online: boolean;
  offlineEntities?: readonly OfflineGeographicEntity[];
}

const ENTITY_TYPES = ['country','city','sea','ocean','river','mountain','airport'] as const;

export function GeographicSearchPanel({ locale, online, offlineEntities = [] }: Props) {
  const [query, setQuery] = useState('');
  const [entityType, setEntityType] = useState('');
  const [results, setResults] = useState<GeographicSearchItem[]>([]);
  const [status, setStatus] = useState<'idle'|'loading'|'online'|'offline'|'error'>('idle');
  const offlineIndex = useMemo(() => buildOfflineGeographicIndex(offlineEntities), [offlineEntities]);

  async function runSearch() {
    const trimmed = query.trim();
    if (!trimmed) { setResults([]); setStatus('idle'); return; }
    if (online) {
      setStatus('loading');
      const response = await searchGeography(trimmed, entityType || undefined);
      if (response) { setResults(response.results); setStatus('online'); return; }
    }
    const offline = searchOfflineGeography(
      offlineIndex,
      trimmed,
      entityType ? [entityType as OfflineGeographicEntity['entityType']] : [],
      20,
    );
    setResults(offline.map((item) => ({
      id: item.id,
      entity_type: item.entityType,
      name: item.name,
      name_ar: item.nameAr ?? null,
      aliases: item.aliases,
      country_code: item.countryCode ?? null,
      admin1: null,
      population: null,
      elevation_m: null,
      point: item.latitude == null || item.longitude == null ? null : { latitude: item.latitude, longitude: item.longitude },
      provenance: {
        source_id: item.provenance.sourceId,
        source_version: item.provenance.sourceVersion,
        source_license: item.provenance.sourceLicense,
      },
      metadata: {},
    })));
    setStatus(offline.length ? 'offline' : 'error');
  }

  const ar = locale === 'ar';
  return <section className="phase-card search-panel">
    <div className="search-panel__head">
      <div><span className="eyebrow">Phase 3 · Unified Search</span><h2>{ar ? 'البحث الجغرافي الموحد' : 'Unified geographic search'}</h2></div>
      <span className="evidence-badge">{status === 'offline' ? 'OFFLINE' : status === 'online' ? 'POSTGIS' : online ? 'ONLINE' : 'OFFLINE READY'}</span>
    </div>
    <div className="search-controls">
      <input value={query} onChange={(e)=>setQuery(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter') void runSearch();}} placeholder={ar?'ابحث عن مدينة، دولة، بحر، نهر...':'Search city, country, sea, river...'} aria-label={ar?'بحث جغرافي':'Geographic search'} />
      <select value={entityType} onChange={(e)=>setEntityType(e.target.value)} aria-label={ar?'نوع الكيان':'Entity type'}>
        <option value="">{ar?'كل الأنواع':'All types'}</option>
        {ENTITY_TYPES.map((type)=><option key={type} value={type}>{type}</option>)}
      </select>
      <button onClick={()=>void runSearch()}>{ar?'بحث':'Search'}</button>
    </div>
    {status === 'loading' && <p className="muted">{ar?'جارٍ البحث...':'Searching...'}</p>}
    {status === 'error' && <p className="muted">{ar?'لا توجد نتائج محلية متاحة لهذه العبارة.':'No local results available for this query.'}</p>}
    <div className="search-results">
      {results.map((item)=><article key={item.id} className="search-result">
        <div><strong>{ar && item.name_ar ? item.name_ar : item.name}</strong><span>{item.entity_type}{item.country_code?` · ${item.country_code}`:''}</span></div>
        <div className="search-result__meta">
          {item.point && <span>{item.point.latitude.toFixed(4)}, {item.point.longitude.toFixed(4)}</span>}
          <span>{item.provenance.source_id} · {item.provenance.source_version}</span>
        </div>
      </article>)}
    </div>
  </section>;
}
