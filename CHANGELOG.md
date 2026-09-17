# Changelog

## [0.3.0-dev] - 2026-09-17
### Added
- Canonical PostGIS geography store for countries, cities, seas, oceans, rivers, mountains and airports.
- Provenance-aware bilingual unified geographic search API.
- Idempotent geographic import pipeline requiring source/version/license metadata.
- Offline geographic search index with Arabic/English names and aliases.
- Versioned SHA-256 Region Pack contract and PostGIS region-pack export API.
- Responsive bilingual geographic search UI with online PostGIS and offline fallback paths.
- Phase 3 importer, Region Pack, bilingual search and Docker runtime acceptance gates.
### Changed
- Development release advanced to `0.3.0-dev` on the Phase 3 branch.
- Release gates continue to enforce Phase 2 projection/source regressions.
### Explicit limitation
- No unverified or fabricated production geographic dataset is bundled; production records must come through a source-traceable licensed/public-domain import.

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
