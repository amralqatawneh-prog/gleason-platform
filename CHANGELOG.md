# Changelog

## [Unreleased] — PR #9 merged into main (2026-09-19)

- Owner explicitly authorized merging PR #9 into `main`.
- PR #9 merged successfully at `97f043174b07cef9884075b1c37a4e4394f6f8bb`.
- The default branch now contains the Phase 5 work through closed P5.7 plus the reconciled README/current documentation.
- P5.8 remains NEXT / NOT STARTED; P5.9 and Phase 6 remain NOT STARTED.
- Accepted application version remains 0.4.0 and full Phase 5 remains IN PROGRESS / NOT YET ACCEPTED.
- No tag, GitHub Release or deployment was created.


## [Unreleased] — GitHub documentation and metadata reconciliation (2026-09-19)

- Owner requested a comprehensive GitHub/documentation refresh before P5.8.
- Refresh `README.md`, current handoff, roadmap, Phase 5 plan, navigation/measurement boundary, dependency register, offline architecture, security baseline and repository-structure policy through the accepted P5.7 state.
- Add `docs/GITHUB_SYNC_AUDIT_2026-09-19.md` with the 186-file tracked snapshot, current-vs-historical documentation classification, version/capability verification, locked source checksums and Phase 5 status.
- Mark `PROJECT_ARCHITECTURE.md` explicitly as the accepted historical Phase 0 architecture baseline and point current execution status to the current handoff/roadmap.
- Preserve historical reports/verification artifacts rather than rewriting old status statements as if they were current.
- Production source manifests, dependency versions, numerical engines, database data and app version are unchanged.
- Baseline before this documentation-only reconciliation: `e710075531dbdbc2fdd2ed62dde07f22786e320f`, Release Acceptance Gates #397 SUCCESS.
- P5.8 and Phase 6 remain NOT STARTED. No merge, tag or release.


## [Unreleased] — P5.7 owner acceptance closure (2026-09-19)

- Owner reported «نجحت جميع اختبارات P5.7». Record manual result PASS — REPORTED BY OWNER.
- P5.7 closes with CI #383 and CI #387 SUCCESS.
- Homogeneous numeric differences remain gated by P5.5 plus matching adapter domain/output structure; incompatible cross-model pairs expose no numeric delta.
- Future time/layer/route service contracts remain explicitly unavailable; no later engine is implied.
- P5.8 Versioned Local State Persistence is next but NOT STARTED. Phase 6 route/ruler/area remains NOT STARTED.
- Full Phase 5 remains in progress; no merge, tag or release. Accepted app version remains 0.4.0.


## [Unreleased] — P5.7 automated verification (2026-09-19)

- P5.7 implementation/documentation head `6b21fbf78494335ca5cbec4c4c75a634b475cfac` passed Release Acceptance Gates #383.
- CI reports 0 npm vulnerabilities, 78 frontend core tests, 2 PWA tests and 15 Chromium scenarios PASS, plus production build/parity/Docker/PostGIS/Redis/source/search gates.
- Homogeneous differences additionally fail closed when adapter domains or output structures differ.
- Owner manual P5.7 verification remains NOT RUN; P5.7 is not closed. P5.8 and Phase 6 are not started.


## [Unreleased] — Phase 5 / P5.7 homogeneous differences and future contracts (2026-09-19)

- Owner instructed «أكمل» after P5.6 closure. Start P5.7 only.
- Add signed homogeneous differences (`right - left`) only after the P5.5 comparability contract passes; incompatible pairs expose no numeric delta.
- Keep Gleason differences in `normalized-radius` and AE/WGS84 compatible differences in their declared units; no normalization or unit conversion is introduced.
- Add versioned future-service boundaries for time/astronomy, cross-model layer synchronization and route/measurement. All are explicitly unavailable in Phase 5.
- Existing per-view layers remain available; only the future shared layer-sync service is unavailable.
- Route drawing, distance, ruler and area remain Phase 6; P5.8 persistence is not started.
- Add core/browser regression coverage and `docs/PHASE_5_P5_7_REPORT.md`. Automated/owner PASS is not claimed until verification completes.


## [Unreleased] — P5.6 owner acceptance closure (2026-09-19)

- Owner reported «نجحت كل الاختبارات». Record manual result PASS — REPORTED BY OWNER.
- P5.6 closes with CI #329 and CI #340 SUCCESS.
- Independent navigation/focus/zoom/rotation behavior remains accepted for this slice; canonical geographic selection is preserved by navigation.
- P5.7 is next but NOT STARTED. Phase 6 routes/ruler/area remain NOT STARTED.
- Full Phase 5 remains in progress; no merge, tag or release. Accepted app version remains 0.4.0.


## [Unreleased] — Phase 5 / P5.6 navigation (2026-09-19)

- Owner instructed «أكمل» after P5.5 closure. P5.6 is the only active slice.
- Reconcile already-present navigation commits with the canonical documentation instead of duplicating implementation.
- Deliver independent camera navigation for Gleason/AE/WGS84: zoom controls, wheel, touch/pinch, zoom-to-area, rotation/view-direction where meaningful, reset, fit-full and focus-selected.
- Preserve canonical geographic selection during camera navigation; keep zoom scales independent across models.
- WGS84 rendering/picking is zoom-aware; fallback declares unsupported 3D rotation/tilt instead of pretending support.
- Final audited implementation head `378f0a8ed6710195cb1e48e0ebcd4518116a5d0d` passed CI #329 with 0 npm vulnerabilities, 71 frontend core tests, 2 PWA tests, 14 Chromium scenarios and all release gates.
- Owner manual verification remains NOT RUN; P5.6 is not yet closed. P5.7 and Phase 6 remain NOT STARTED.


## [Unreleased] — P5.5 owner acceptance closure (2026-09-19)

- Owner reported «نجحت جميع اختبارات P5.5». Record manual result PASS — REPORTED BY OWNER.
- P5.5 closes with CI #266 and CI #271 SUCCESS; the contract rejects incompatible model quantities without fabricated normalization or unit conversion.
- P5.6 Optional Geographic Focus / Navigation is next but NOT STARTED.
- Full Phase 5 remains in progress; no merge, tag or release. Accepted app version remains 0.4.0.


## [Unreleased] — P5.5 automated verification (2026-09-19)

- P5.5 implementation head `1bf01cda0a1b4273b14f7d1c06a844021e575648` passed Release Acceptance Gates #266.
- CI reports 0 npm vulnerabilities, 67 frontend core tests, 2 PWA tests and 12 Chromium scenarios PASS, plus parity/build/Docker/PostGIS/Redis/locked-source/search gates.
- Owner manual P5.5 verification remains NOT RUN; P5.5 is not closed and P5.6 is not started.


## [Unreleased] — Phase 5 / P5.5 Comparability Contract (2026-09-19)

- Owner instructed «أكمل» after P5.4 closure. Start P5.5 only.
- Add a typed comparability contract requiring compatible quantity meaning, coordinate space, unit, scale basis and availability; decisions are comparable/not-comparable/unavailable with explicit reasons.
- Never convert or normalize Gleason normalized-radius into metres/kilometres. AE plane metres and WGS84 ECEF metres remain structurally different quantities despite sharing the metre unit.
- Add a bilingual Model Laboratory comparability panel plus core/browser regression tests. No numeric differences, routes, measurement engine, navigation tools or new dependencies.
- Automated/owner PASS is not claimed until the exact P5.5 revision is tested.


## [Unreleased] — P5.4 owner acceptance closure (2026-09-19)

- Owner reported the refined Model Laboratory is now clear: «القسم اصبح واضحا، اكمل التوثيق». Record manual clarity PASS — REPORTED BY OWNER, following the earlier functional PASS.
- Refined implementation head `29fa6190185ec7901c14f586ad26213337190272` passed Release Acceptance Gates #236 on attempt 6 after transient npm audit registry 400 errors on earlier attempts; successful audit found 0 vulnerabilities.
- CI #236 completed 62 frontend core tests, 2 PWA tests, 11 Chromium scenarios, parity/build/Docker/PostGIS/Redis/source/search gates.
- P5.4 is CLOSED. P5.5 Comparability Contract is next but NOT STARTED. No merge, tag or release; accepted app version remains 0.4.0.


## [Unreleased] — P5.4 usability clarification (2026-09-19)

- Owner functional checks passed, but the Model Laboratory was too technical to understand; P5.4 remains open pending clarity retest.
- Add plain-language model meaning before raw technical metadata: explain Gleason normalized coordinates, AE planar coordinates, WGS84 ECEF, and why missing ellipsoidal height blocks ECEF.
- Move model/version/evidence/domain/source/limitations into collapsed technical details without changing any calculation or adapter contract.
- Extend browser acceptance coverage for bilingual explanations, collapsed details and mobile overflow.


## [Unreleased] — Phase 5 / P5.4 Model Laboratory (2026-09-19)

- Owner instructed «ابدأ» after P5.3 closure. Add a bilingual read-only Model Laboratory for the shared geographic selection.
- Show independent Gleason/AE/WGS84 model versions, inputs, outputs, units, semantic/evidence classifications, source records, domains, notes and limitations.
- Missing WGS84 ellipsoidal height is explicitly unavailable (`height-required`); no 0 m value is fabricated. Numeric comparability remains P5.5.
- Add core/browser tests and `docs/PHASE_5_P5_4_REPORT.md`. Automated/owner acceptance is not claimed until the new revision is tested.


## [Unreleased] — P5.3 owner acceptance and tool scheduling (2026-09-19)

- Owner reports all retests PASS after CI #204 visual correction; P5.3 closed. Phase 5 acceptance remains pending, P5.4 next.
- Record requested navigation controls in P5.6 and multi-stop routes/ruler/polygon area in Phase 6; no new tool implementation in this documentation change.
- Details: `docs/NAVIGATION_MEASUREMENT_REQUIREMENTS.md`. No new tests claimed; accepted version remains 0.4.0.

## [Unreleased] — P5.3 visual corrections (2026-09-19)

- Owner reports correct synchronized readings but missing map markers. Set OpenLayers rendering targets to physical LTR coordinates independently of UI locale; add real marker-viewport checks in Arabic/English interfaces and searches.
- Add an opaque WGS84 ellipsoid surface with display-only shading beneath existing overlays; no satellite imagery, terrain, or solar lighting claim. Retain picking/drag/provenance behavior.
- Add mesh validation and WebGL framebuffer evidence; local 58 core/build/2 PWA gates PASS. Remote evidence on PR #9. P5.3 still awaits owner retest; P5.4 not started.

## [Unreleased] — Phase 5 / P5.3 (2026-09-19)

- Owner instructed continuation after successful P5.2 tests. One reducer now drives search and all model picks; each selection increments once, with no render-to-selection callback.
- Added geographic selection overlays/readouts to Gleason/AE; WGS84 consumes the common point. Preserve independent cameras and search focus behavior. Canonical points from any map can feed explicitly WGS84 A/B capture.
- Added reducer tests and an eighth browser scenario; expanded cold-offline and fallback checks. Local 49 backend, 57 core and 2 PWA tests/build PASS; final remote evidence is on PR #9.
- P5.4 laboratory UI remains pending. See `docs/PHASE_5_P5_3_REPORT.md`.

## [Unreleased] — P5.2 verification closure (2026-09-19)

- Owner reported «نجحت جميع الاختبارات» for the three delivered P5.2 checks. Recorded PASS — REPORTED BY OWNER; device/browser/local SHA not supplied.
- Closed P5.2 with implementation CI #198 on `ce73919`; full Phase 5 acceptance remains pending. P5.3 is next and not started. Documentation-only closure; no merge, tag or release.

## [Unreleased] — Phase 5 / P5.2 (2026-09-19)

- Owner confirmed Arabic city retest PASS and authorized the next slice.
- Added independent typed Gleason/AE/WGS84 adapters with model/version/kind/unit checks, domain validation, explicit height and polar conventions, immutable evidence metadata and forward/inverse operations. Gleason/AE map picks now use their respective adapter.
- Eight new tests cover 147 round trips, independent anchors, invalid inputs, cross-model misuse, height/poles and metadata isolation. Local 55 core tests, build and 2 PWA tests PASS; exact remote results are on draft PR #9.
- P5.3 synchronization and P5.4 laboratory UI remain pending; no merge, release or new dependency. See `docs/PHASE_5_P5_2_REPORT.md`.

## [Unreleased] — Arabic city search correction

- Owner reported all three delivered P5.1 checks PASS, plus an Arabic city search defect. The pinned simplified Natural Earth city source omitted multilingual names. Switch to the full 110m city dataset at the same source commit; preserve 243 canonical IDs and coordinates, import NAME_AR and update the source checksum/URL.
- Added a city-only upsert and Docker/Git Bash refresh script for existing databases; no volume deletion. Added real-source online/actual frontend offline search parity checks and repeated-update coverage in CI.
- See `docs/ARABIC_CITY_SEARCH_FIX.md` for evidence, update steps and limitations.

## [Unreleased] — Phase 5 / P5.1 (2026-09-19)

- Owner explicitly started Phase 5: «ابدأ المرحله الخامسة», superseding the earlier hold. Phase 4 remains accepted; no Phase 5 acceptance is implied.
- Added a versioned typed WGS84 geographic selection with optional ellipsoidal height and immutable source/place identity. Free picks clear all previous place metadata, including on Gleason/AE maps.
- Replaced separate React point/place states with one selection; focus application no longer emits a fake user pick. Reject invalid geographic domains without silent normalization.
- Fixed stale Phase 4 acceptance text in the footer. Capabilities report implementation phase 5, accepted phase 4 and in_progress, with cross-model synchronization still false.
- Added seven contract tests and a browser regression for search-to-free-point transitions across all three models. See `docs/PHASE_5_P5_1_REPORT.md` for actual results.
- Owner authorized upload and CI; implementation `e64d223` passed CI #192 including all seven Chromium scenarios (33.7s), Docker/PostGIS/Redis/production-source gates and numerical parity. Draft PR #9 is open and unmerged. No new dependencies, release/tag or merge. P5.2–P5.9 remain pending; package version remains the last accepted 0.4.0.

## [0.4.0] — accepted application version (2026-09-18)

- Owner reported all corrected-build manual tests PASS and explicitly accepted Phase 4. Recorded the exact decision and evidence in `docs/PHASE_4_ACCEPTANCE.md`.
- Aligned VERSION, backend/frontend package metadata and dependency locks to 0.4.0; capabilities now report `accepted_phase=4` and `phase_status=accepted` while synchronization/astronomy remain unavailable.
- Phase 5 remains NOT STARTED and ON HOLD until an explicit owner instruction to start it. Phase 4 acceptance does not lift this hold.
- No PR merge, tag or GitHub Release was created by acceptance. CI #188 on `a0a8e29` validates the build supplied for owner review; the acceptance commit has its own CI check.

### Approved Phase 4 corrections

- M1: correct geodetic WGS84 picking, geographic markers, rear visibility and fallback letterboxing; retain inverted drag.
- M2: independent offline WGS84 geodesics/ECEF, backend parity gate, compiled-asset precache with content versioning.
- M3: keep layer controls accessible on mobile and preserve legible 3D/2D labels with decluttering.
- M4: align application version surfaces and separate implemented capabilities from owner acceptance.
- M5: preserve source/version/record/classification through search, HTTP/CLI packs and selection; retain legacy packs with unknown metadata.
- M6: lock npm/Python installations, prevent stale results/pack writes, refresh installed features, and add browser acceptance gates.
- M7/M8: reconcile phases 0–22 and Phase 5/6 scope, record actual renderer and retain approved future UX/performance requirements.
- Verification: 49 backend + 40 frontend core + 2 PWA tests and numerical parity pass locally and in CI #186; all six Chromium scenarios and Docker/PostGIS/Redis/production-source/API-CLI parity gates pass on uploaded snapshot `fb4dcab`.
- Owner explicitly authorized upload and CI without merge or release; seven exact-content commits uploaded to the existing Phase 4 branch. PR #8 remains draft and unmerged; owner subsequently reported manual review PASS.
- Owner approved M1–M8 and subsequently accepted Phase 4. M8 remains planned future scope.

### Phase 4 implementation history
### Started
- Phase 4 authorized by owner on 2026-09-17.
- Added `docs/PHASE_4_PLAN.md` defining the WGS84 Reference Model scope, provenance rules, delivery slices, acceptance gates, and explicit Phase 5 boundary.
- Implementation branch: `feat/phase4-wgs84-reference`.
### Boundary
- No Phase 5 synchronization/comparison work is included.
- Solar/lunar/planetary astronomy remains outside Phase 4.

### P4.7
- Added antimeridian and near-antimeridian WGS84 regression tests.
- Added Docker runtime smoke checks for WGS84 metadata, ECEF conversion, antimeridian geodesic, and invalid-longitude rejection.
- Added service-worker syntax validation and Phase 4 PWA cache rotation to `gleason-shell-v0.4.0-rc1`.
- Added `docs/PHASE_4_REPORT.md` as the pre-acceptance hardening report.
- Added and locked inverse horizontal globe drag behavior: pointer right rotates the globe left; pointer left rotates the globe right.
- GitHub Actions run #177 passed after retrying a transient Docker Hub authorization/network failure; all code/test/build/PWA gates had passed before the transient failure.
- Owner manual regression checks passed, including the final drag-direction change.
- P4.7 was technically complete before the later acceptance recorded above. Phase 5 remains excluded under the owner's explicit hold.

### P4.6
- Added persistent WGS84 globe layer controls backed by IndexedDB.
- Added country boundaries plus cached Phase 3 oceans, seas, rivers, cities, and saved regional airports.
- Added continent/country/marine/city/airport labels with front-hemisphere filtering, responsive sizing, and collision suppression.
- Corrected external-globe east/west orientation and matching geographic picking.
- Added equivalent 2D fallback presentation for the reference layers and labels.
- Documented that global airports remain excluded from the core-world pack and appear from installed regional packs.
- Owner manual checks passed for layers, labels, saved airports, offline behavior, responsive sizing, and 2D fallback.
- GitHub Actions run #155 passed after correcting the frontend core-test Vite typing configuration.

## [0.3.0] - 2026-09-17
### Added
- Phase 3 PostGIS/pg_trgm place catalog and unified search foundation.
- Locked Natural Earth and OurAirports production-source import pipeline with SHA-256 verification and coordinate provenance classifications.
- English/Arabic search over real source-derived records.
- Deterministic core-world and country offline-search pack generation with CI artifact evidence.
- Offline-search API routes and direct regression tests.
- High-severity npm security gate in release acceptance CI.
### Changed
- Capacitor 7 dependencies updated from `7.0.0` to `7.6.9`.
- Vite updated from `6.2.0` to `6.4.3` to clear audited High severity advisories.
- Arabic CI search smoke test uses URL-encoded query parameters.
- Release version finalized from `0.3.0-dev` to `0.3.0` after owner acceptance.
### Validation
- GitHub Actions run `35226135102` (run #86) passed backend/frontend tests, `npm audit --audit-level=high`, production build, Docker/PostGIS/Redis runtime, real-source imports/search, offline pack generation and frontend HTTP checks on the pre-acceptance technical head.
- Owner manual acceptance passed for `Qatar`, `Doha`, `DOH`, English/Arabic search, offline search, and responsive/mobile-size UX.
- Owner explicitly accepted Phase 3 on 2026-09-17.
### Notes
- Local Windows acceptance testing revealed developer-experience friction around old Python aliases, Git Bash `/tmp` path conversion, occupied local ports, and the explicit production-data import workflow. These are documented in `docs/PHASE_3_REPORT.md` and are non-blocking maintenance items.
- Phase 4 is not started by this release.

## [0.2.0] - 2026-09-09
### Added
- Source-grounded Gleason Historical projection `GH-0.2.0`.
- Independent WGS84 north-polar AE provider `AE-0.2.0`.
- Projection APIs, source catalog, interactive OpenLayers maps, offline Core World Pack, Source Viewer and affine georeferencing engine.
- Python/TypeScript Phase 2 validation tests and mathematical/dependency documentation.
### Changed
- Release advanced to v0.2.0 and capabilities advertise only implemented Phase 2 features.
- Service Worker cache includes the Phase 2 offline pack manifest.
### Explicit limitation
- No verified distributable standalone historical scan is embedded; scan control points are not fabricated.

## [0.1.0] - 2026-09-09
### Added
- Phase 1 monorepo, FastAPI/React/Vite/PWA foundation, Docker/PostGIS/Redis, RTL/LTR and tests.
### Changed
- Repository permanently normalized into backend/frontend/data/database/docs domains with CI structure guard.
