# Changelog

## Approved Phase 4 corrections — unreleased (2026-09-18)

- M1: correct geodetic WGS84 picking, geographic markers, rear visibility and fallback letterboxing; retain inverted drag.
- M2: independent offline WGS84 geodesics/ECEF, backend parity gate, compiled-asset precache with content versioning.
- M3: keep layer controls accessible on mobile and preserve legible 3D/2D labels with decluttering.
- Owner approved M1–M8; Phase 4 acceptance remains pending.

## [Unreleased] — Phase 4
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
- P4.7 is technically complete; Phase 5 remains excluded pending explicit owner acceptance of Phase 4.

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
