import { useMemo, useState } from 'react';
import {
  fixturesForResearchProfile,
  GLEASON_RULER_UNIT_POLICY,
  gleasonLocalScaleDiagnostic,
  gleasonRulerUnitVerifications,
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
  const rulerUnits = useMemo(() => gleasonRulerUnitVerifications(), []);
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

    <article
      className="gleason-lab-card"
      data-p6c3-tool="verified-ruler-units"
      data-p6c3-visual-reference="gleason-owner-hires-jpeg-reference-2026-09-22"
      data-p6c3-visual-reference-width="1464"
      data-p6c3-visual-reference-height="2048"
      data-p6c3-fig43-mile-si-status={GLEASON_RULER_UNIT_POLICY.generic_fig43_mile_si_status}
      data-p6c3-jgw-unit-status={GLEASON_RULER_UNIT_POLICY.owner_jgw_native_unit_status}
    >
      <div className="polygon-measurement-card__head">
        <div>
          <strong>{locale === 'ar' ? 'وحدات المسطرة المتحقق منها' : 'Verified ruler units'}</strong>
          <small>{locale === 'ar'
            ? 'مرجع بصري 1464×2048 مع تحقق كتابي من الفصل السابع عشر/الشكل 37'
            : '1464×2048 visual reference cross-checked against Chapter XVII / Figure 37'}</small>
        </div>
        <span className="evidence-badge">VERIFIED PROFILES</span>
      </div>

      <p>{locale === 'ar'
        ? 'اعتمدنا الصورة الأقل جودة كمرجع بصري للمسطرة. التحويلات أدناه ملفات مسماة ومتحقق منها؛ لا تعني أن كل كلمة mile في المصدر التاريخي لها هوية واحدة.'
        : 'The lower-resolution image is accepted as a visual ruler reference. These are named verified conversion profiles; they do not assign one identity to every historical occurrence of “mile”.'}</p>

      <div className="gleason-lab-grid" data-p6c3-ruler-unit-count={rulerUnits.length}>
        {rulerUnits.map(unit => <div
          key={unit.unit_profile_id}
          className="gleason-si-profile-provenance"
          data-p6c3-ruler-unit-id={unit.unit_profile_id}
          data-p6c3-metre-per-unit={unit.metre_per_unit.toFixed(6)}
          data-p6c3-ruler-unit-status={unit.status}
        >
          <strong>{unit.source_label}</strong>
          <span>{unit.source_relation}</span>
          <span dir="ltr">{format(unit.metre_per_unit, locale, 6)} m / mile</span>
          <span>{unit.conversion_basis}</span>
          {unit.conflict_group && <span>{locale === 'ar'
            ? 'تعارض تاريخي محفوظ — لا يتم اختيار ملف واحد سرًا.'
            : 'Historical conflict preserved — no profile is silently selected.'}</span>}
        </div>)}
      </div>

      <div className="notice" data-p6c3-ruler-conflict="preserve-both">
        <strong>{locale === 'ar' ? 'تعارض تاريخي موثق' : 'Documented historical conflict'}</strong>
        <span>{locale === 'ar'
          ? 'تعريف 6075 قدم يعطي 1851.66 م، بينما علاقة الشكل 37 تعطي 1859.6864 م. يحتفظ المختبر بالقيمتين منفصلتين.'
          : 'The 6075-foot definition gives 1851.66 m, while the Figure-37 ratio gives 1859.6864 m. The laboratory keeps both values separate.'}</span>
      </div>
      <small className="muted">{locale === 'ar'
        ? 'يبقى historical-fig43-mile غير محسوم للتحويل التلقائي إلى SI، كما تبقى وحدة JGW غير معروفة.'
        : 'historical-fig43-mile remains unresolved for automatic SI conversion, and the JGW native unit remains unknown.'}</small>
    </article>

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
      <strong>{locale === 'ar' ? 'مرجع المسطرة معتمد — معايرة JGW الجغرافية ما زالت مغلقة' : 'Ruler reference approved — JGW georeferencing still gated'}</strong>
      <span>{locale === 'ar'
        ? 'الصورة 1464×2048 معتمدة الآن كمرجع بصري للمسطرة والوحدات المطبوعة، لكنها ليست الصورة المطابقة لملف JGW. لذلك تبقى وحدة JGW وCRS غير معروفتين حتى توفر companion raster حقيقي أو دليل مستقل.'
        : 'The 1464×2048 image is now approved as a visual reference for the printed ruler and unit labels, but it is not the JGW companion raster. The JGW unit and CRS therefore remain unknown until the true companion raster or independent evidence is available.'}</span>
    </div>
  </section>;
}
