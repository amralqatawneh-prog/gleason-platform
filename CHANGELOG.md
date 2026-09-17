# Changelog

## [Unreleased] — Phase 4
### Started
- Phase 4 authorized by owner on 2026-09-17.
- Added `docs/PHASE_4_PLAN.md` defining the WGS84 Reference Model scope, provenance rules, delivery slices, acceptance gates, and explicit Phase 5 boundary.
- Implementation branch: `feat/phase4-wgs84-reference`.
### Boundary
- No Phase 5 synchronization/comparison work is included.
- Solar/lunar/planetary astronomy remains outside Phase 4.

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
