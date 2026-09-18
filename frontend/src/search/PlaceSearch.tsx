import { FormEvent, useEffect, useState } from 'react';
import { searchPlaces, type PlaceCategory } from '../api';
import { installCountrySearchPack, refreshCoreSearchPack, searchCachedPlaces } from '../offline/searchPackStore';
import { onlineResult, offlineResult, type PlaceSelection } from './placeSelection';
export type { PlaceSelection } from './placeSelection';

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

type Props = {
  locale: 'ar' | 'en';
  onSelectPlace?: (place: PlaceSelection) => void;
  selectedPlaceId?: string;
};

export function PlaceSearch({ locale, onSelectPlace, selectedPlaceId }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'' | PlaceCategory>('');
  const [results, setResults] = useState<PlaceSelection[]>([]);
  const [state, setState] = useState<'idle' | 'loading' | 'offline' | 'error'>('idle');
  const [packMessage, setPackMessage] = useState('');

  useEffect(() => {
    if (navigator.onLine) refreshCoreSearchPack().catch(() => undefined);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setState('loading');
    setPackMessage('');
    try {
      const online = await searchPlaces(query, category || undefined);
      setResults(online.map(onlineResult));
      setState('idle');
      refreshCoreSearchPack().catch(() => undefined);
    } catch {
      try {
        const offline = await searchCachedPlaces(query, category || undefined);
        setResults(offline.map(offlineResult));
        setState('offline');
      } catch {
        setResults([]);
        setState('error');
      }
    }
  }

  async function saveCountry(countryCode: string) {
    setPackMessage(locale === 'ar' ? `جارٍ حفظ ${countryCode}…` : `Saving ${countryCode}…`);
    try {
      const pack = await installCountrySearchPack(countryCode);
      setPackMessage(locale === 'ar'
        ? `تم حفظ ${countryCode} للعمل دون اتصال (${pack.entries.length} عنصرًا).`
        : `${countryCode} saved for offline use (${pack.entries.length} entries).`);
    } catch {
      setPackMessage(locale === 'ar' ? 'تعذر حفظ حزمة المنطقة.' : 'Could not save the region pack.');
    }
  }

  return <section className="phase-card phase3-search">
    
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
    {state === 'offline' && <p className="muted">{locale === 'ar' ? 'النتائج من فهرس IndexedDB المحلي — وضع دون اتصال.' : 'Results are from the local IndexedDB index — offline mode.'}</p>}
    {state === 'error' && <p className="muted">{locale === 'ar' ? 'تعذر الوصول إلى البحث المتصل ولا توجد حزمة محلية صالحة.' : 'Online search is unavailable and no valid local pack is installed.'}</p>}
    {state === 'idle' && query.trim() && results.length === 0 && <p className="muted">{locale === 'ar' ? 'لا توجد نتائج في البيانات المستوردة حاليًا.' : 'No results in the currently imported datasets.'}</p>}
    {packMessage && <p className="muted">{packMessage}</p>}
    <div className="search-results">
      {results.map((result) => <article key={result.id} className={`search-result ${selectedPlaceId === result.id ? 'selected' : ''}`}>
        <div>
          <strong>{locale === 'ar' && result.nameAr ? result.nameAr : result.name}</strong>
          <span className="evidence-badge">{result.category}</span>
          {result.offline && <span className="evidence-badge">OFFLINE</span>}
        </div>
        <small>{result.latitude.toFixed(5)}, {result.longitude.toFixed(5)} · {result.sourceLabel}</small>
        <div className="search-result__actions">
          {onSelectPlace && <button className="secondary" type="button" onClick={() => onSelectPlace(result)}>
            {locale === 'ar' ? 'اعرض على WGS84' : 'Locate on WGS84'}
          </button>}
          {!result.offline && result.countryCode && <button className="secondary" type="button" onClick={() => void saveCountry(result.countryCode!)}>
            {locale === 'ar' ? `حفظ ${result.countryCode} دون اتصال` : `Save ${result.countryCode} offline`}
          </button>}
        </div>
      </article>)}
    </div>
  </section>;
}
