# Changelog

## [0.1.0] - 2026-09-09

### Added
- Phase 1 monorepo foundation.
- FastAPI base API, health/readiness/capability endpoints.
- Configuration, structured logging, request correlation and standardized errors.
- Database lifecycle abstraction and PostgreSQL-ready Docker stack.
- React/Vite responsive app shell with Arabic/English and RTL/LTR.
- PWA app shell, service worker and offline fallback.
- IndexedDB/offline pack manifest abstractions.
- WebGL capability detection and 3D graceful-degradation shell.
- Capacitor mobile shell configuration.
- Unit/integration/static Phase 1 tests and documentation.

### Changed
- Normalized the repository permanently into `backend/`, `frontend/`, `data/`, `database/`, and `docs/` domains.
- Removed flattened duplicate application files from the repository root.
- Renamed the acceptance workflow to `.github/workflows/phase1-gates.yml`.
- Added a CI structure guard so flattened backend/frontend files cannot silently return to the root.
