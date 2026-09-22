import { useMemo, useState } from 'react';
import {
  fixturesForResearchProfile,
  gleasonLocalScaleDiagnostic,
  type CalibrationResearchProfileId,
} from './gleasonCalibrationLaboratory';

type Props = { locale: 'ar' | 'en' };

const PROFILE_OPTIONS: readonly (CalibrationResearchProfileId | 'all')[] = Object.freeze([
  'all',
  'gleason-book-local-longitude',
  'gleason-fig43-circle-derived-diagnostic',
  'planar-law-of-cosines-diagnostic',
  'walter-flat-plane-eq-10008',
  'gleason-raster-restored-diagnostic',
  'gleason-raster-calibrated',
]);

function format(value: number | null, locale: 'ar' | 'en', digits = 6): string {
  if (value == null) return '—';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function GleasonCalibrationLaboratoryPanel({ locale }: Props) {
  const [profileId, setProfileId] = useState<CalibrationResearchProfileId | 'all'>('all');
  const [latitude, setLatitude] = useState(0);
  const fixtures = useMemo(() => fixturesForResearchProfile(profileId), [profileId]);
  const diagnostic = useMemo(() => gleasonLocalScaleDiagnostic(latitude), [latitude]);

  return <section
    className="gleason-calibration-laboratory gleason-measurement-lab"
    data-p6c3-status="in-progress"
    data-p6c3-fixture-count={fixtures.length}
    data-p6c3-profile={profileId}
    aria-labelledby="gleason-calibration-title"
  >
    <div className="section-heading">
      <div>
        <h2 id="gleason-calibration-title">{locale === 'ar' ? 'مختبر المعايرة والـ Fixtures' : 'Calibration & Fixture Laboratory'}</h2>
        <p>{locale === 'ar'
          ? 'P6.C3 · مقارنة مصدرية للكتاب والفيديو وWalter والرستر والمرجع الحديث. تُعرض البواقي حسب هوية كل مصدر، ولا يختار المختبر «فائزًا» ولا يوحّد المقاييس المختلفة سرًا.'
          : 'P6.C3 · Source-backed book/video/Walter/raster/reference comparisons. Residuals preserve each source identity; the laboratory does not choose a “winner” or silently normalize unlike scales.'}</p>
      </div>
      <span className="evidence-badge">P6.C3 · IN PROGRESS</span>
    </div>

    <div className="gleason-lab-card" data-p6c3-tool="research-profile-selector">
      <label>
        <strong>{locale === 'ar' ? 'ملف البحث' : 'Research profile'}</strong>
        <select
          aria-label={locale === 'ar' ? 'ملف البحث' : 'Research profile'}
          value={profileId}
          onChange={event => setProfileId(event.target.value as CalibrationResearchProfileId | 'all')}
        >
          {PROFILE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <small className="muted">{locale === 'ar'
        ? 'هذا الاختيار يرشح نتائج المختبر فقط؛ لا يغيّر المسار أو هوية P6.C2 أو تمثيل P6.7A.'
        : 'This selection filters the laboratory only; it does not rewrite the route, P6.C2 identity, or P6.7A rendering.'}</small>
    </div>

    <div className="gleason-lab-grid" data-p6c3-tool="fixture-results">
      {fixtures.map(fixture => <article
        key={fixture.fixture_id}
        className="gleason-lab-card"
        data-p6c3-fixture-id={fixture.fixture_id}
        data-p6c3-fixture-status={fixture.status}
        data-p6c3-source-class={fixture.source_class}
        data-p6c3-profile-id={fixture.research_profile_id}
        data-p6c3-residual-absolute={fixture.residual_absolute == null ? '' : fixture.residual_absolute.toFixed(12)}
      >
        <div className="polygon-measurement-card__head">
          <div>
            <strong>{fixture.fixture_id}</strong>
            <small>{fixture.fixture_kind} · {fixture.source_class}</small>
          </div>
          <span className="evidence-badge">{fixture.status === 'gated' ? 'GATED' : fixture.evidence_level}</span>
        </div>
        <div className="gleason-si-profile-provenance">
          <span><b>{locale === 'ar' ? 'الملف' : 'Profile'}:</b> {fixture.research_profile_id}</span>
          <span><b>{locale === 'ar' ? 'المصدر' : 'Source'}:</b> {format(fixture.source_distance, locale)} {fixture.source_unit}</span>
          <span><b>{locale === 'ar' ? 'التنبؤ' : 'Prediction'}:</b> {format(fixture.profile_prediction, locale)} {fixture.prediction_unit ?? ''}</span>
          <span><b>{locale === 'ar' ? 'الباقي المطلق' : 'Absolute residual'}:</b> {format(fixture.residual_absolute, locale)} {fixture.prediction_unit ?? fixture.source_unit}</span>
          <span><b>{locale === 'ar' ? 'الباقي %' : 'Residual %'}:</b> {fixture.residual_percent == null ? '—' : `${format(fixture.residual_percent, locale, 6)}%`}</span>
          <span><b>{locale === 'ar' ? 'السياق' : 'Context'}:</b> {fixture.latitude_context} · {fixture.direction_context}</span>
        </div>
        {fixture.gate_reason && <div className="notice" data-p6c3-gate-reason={fixture.gate_reason}>
          <strong>{locale === 'ar' ? 'المعايرة مغلقة' : 'Calibration gated'}</strong>
          <span>{fixture.gate_reason}</span>
        </div>}
        <details>
          <summary>{locale === 'ar' ? 'المصدر والقيود' : 'Provenance & limitations'}</summary>
          {fixture.provenance.map(item => <small key={item} className="muted">{item}</small>)}
          {fixture.notes.map(item => <small key={item} className="muted">{item}</small>)}
        </details>
      </article>)}
    </div>

    <article
      className="gleason-lab-card"
      data-p6c3-tool="local-scale-diagnostic"
      data-p6c3-latitude-deg={diagnostic.latitude_deg.toFixed(6)}
      data-p6c3-fig43-miles-per-longitude-degree={diagnostic.historical_fig43_miles_per_longitude_degree.toFixed(12)}
      data-p6c3-walter-radius-km={diagnostic.walter_radius_km.toFixed(12)}
      data-p6c3-walter-tangential-km-per-longitude-degree={diagnostic.walter_tangential_km_per_longitude_degree.toFixed(12)}
      data-p6c3-walter-radial-km-per-latitude-degree={diagnostic.walter_radial_km_per_latitude_degree.toFixed(12)}
    >
      <div className="polygon-measurement-card__head">
        <div>
          <strong>{locale === 'ar' ? 'تشخيص المقياس المحلي' : 'Local scale diagnostic'}</strong>
          <small>Figure 43 local longitude scale ≠ Walter SI plane</small>
        </div>
        <span className="evidence-badge">DIAGNOSTIC</span>
      </div>
      <label>
        <span>{locale === 'ar' ? 'خط العرض' : 'Latitude'}</span>
        <input
          aria-label={locale === 'ar' ? 'خط العرض التشخيصي' : 'Diagnostic latitude'}
          type="number"
          min="-90"
          max="90"
          step="1"
          value={latitude}
          onChange={event => {
            const next = Number(event.target.value);
            if (Number.isFinite(next)) setLatitude(Math.max(-90, Math.min(90, next)));
          }}
        />
      </label>
      <div className="gleason-si-profile-provenance">
        <span dir="ltr">Fig.43: {format(diagnostic.historical_fig43_miles_per_longitude_degree, locale)} historical mi / °lon</span>
        <span dir="ltr">Walter radius: {format(diagnostic.walter_radius_km, locale)} km</span>
        <span dir="ltr">Walter tangential local arc: {format(diagnostic.walter_tangential_km_per_longitude_degree, locale)} km / °lon</span>
        <span dir="ltr">Walter radial: {format(diagnostic.walter_radial_km_per_latitude_degree, locale)} km / °lat</span>
      </div>
      {diagnostic.limitations.map(item => <small key={item} className="muted">{item}</small>)}
    </article>

    <div className="notice" data-p6c3-8k-raster-gate="missing-true-companion-raster">
      <strong>{locale === 'ar' ? '8K/JGW — مغلق حتى اكتمال المصدر' : '8K/JGW — gated until source bundle is complete'}</strong>
      <span>{locale === 'ar'
        ? 'ملف JGW محفوظ، لكن صورة 8K المطابقة غير موجودة بعد. لا نستخدم JPEG ‏1464×2048 كبديل ولا نسمّي وحدات JGW أمتارًا أو أميالًا دون تحقق مستقل.'
        : 'The JGW is preserved, but the true companion 8K raster is still missing. The 1464×2048 JPEG is not substituted, and JGW units are not named metres/miles without independent verification.'}</span>
    </div>
  </section>;
}
