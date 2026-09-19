# Changelog

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
