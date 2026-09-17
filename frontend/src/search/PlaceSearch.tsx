import { FormEvent, useState } from 'react';
import { searchPlaces, type PlaceCategory, type PlaceSearchResult } from '../api';

const categories: Array<{ value: '' | PlaceCategory; ar: string; en: string }> = [
  { value: '', ar: 'كل الأنواع', en: 'All types' },
  { value: 'country', ar: 'دول', en: 'Countries' },
  { value: 'city', ar: 'مدن', en: 'Cities' },
  { value: 'sea', ar: 'بحار', en: 'Seas' },
  { value: 'ocean', ar: 'محيطات', en: 'Oceans' },
  { value: 'river', ar: 'أنهار', en: 'Rivers' },
  { value: 'mountain', ar: 'جبال', en: 'Mountains' },
  { value: 'airport', ar: 'مطارات', en: 'Airports' },
];

export function PlaceSearch({ locale }: { locale: 'ar' | 'en' }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'' | PlaceCategory>('');
  const [results, setResults] = useState<PlaceSearchResult[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setState('loading');
    try {
      setResults(await searchPlaces(query, category || undefined));
      setState('idle');
    } catch {
      setResults([]);
      setState('error');
    }
  }

  return <section className="phase-card phase3-search">
    <span className="eyebrow">Phase 3 · Unified Search</span>
    <h2>{locale === 'ar' ? 'البحث الجغرافي الموحد' : 'Unified geographic search'}</h2>
    <form onSubmit={submit} className="search-form">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={locale === 'ar' ? 'ابحث عن دولة، مدينة، نهر، جبل، مطار…' : 'Search country, city, river, mountain, airport…'}
        aria-label={locale === 'ar' ? 'نص البحث' : 'Search query'}
      />
      <select value={category} onChange={(event) => setCategory(event.target.value as '' | PlaceCategory)}>
        {categories.map((item) => <option key={item.value || 'all'} value={item.value}>{locale === 'ar' ? item.ar : item.en}</option>)}
      </select>
      <button type="submit" disabled={state === 'loading'}>{state === 'loading' ? '…' : (locale === 'ar' ? 'بحث' : 'Search')}</button>
    </form>
    {state === 'error' && <p className="muted">{locale === 'ar' ? 'تعذر الوصول إلى فهرس البحث المتصل.' : 'Online search index is unavailable.'}</p>}
    {state === 'idle' && query.trim() && results.length === 0 && <p className="muted">{locale === 'ar' ? 'لا توجد نتائج في البيانات المستوردة حاليًا.' : 'No results in the currently imported datasets.'}</p>}
    <div className="search-results">
      {results.map((result) => <article key={result.id} className="search-result">
        <div><strong>{locale === 'ar' && result.name_ar ? result.name_ar : result.name}</strong><span className="evidence-badge">{result.category}</span></div>
        <small>{result.latitude.toFixed(5)}, {result.longitude.toFixed(5)} · {result.source.name}{result.source.version ? ` ${result.source.version}` : ''}</small>
      </article>)}
    </div>
  </section>;
}
