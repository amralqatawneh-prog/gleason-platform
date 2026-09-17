# Phase 4 Validation / Release Hardening Report

## Status

**P4.7 IN PROGRESS — final technical hardening underway.**

P4.1 through P4.6 are complete. Phase 5 remains out of scope until explicit Phase 4 owner acceptance.

## Automated coverage in P4.7

The Phase 4 release gate now validates:

- WGS84 provider/reference API presence.
- Known ECEF anchor at latitude 0°, longitude 0°.
- Antimeridian geodesic from 179° to -179°.
- Invalid longitude rejection without silent normalization.
- Backend Phase 4 unit and API tests.
- Frontend reference-globe tests including orientation, picking, label projection, fallback selection, and responsive label behavior.
- Existing Phase 1–3 regression gates.
- Production frontend build.
- Service-worker syntax.
- Phase 4 PWA cache-version rotation.
- Docker Compose startup and backend readiness.
- PostGIS/pg_trgm schema and locked Phase 3 production-source imports.
- Real unified search regression including Arabic and DOH airport lookup.
- Offline core/QA pack generation.
- Redis health.
- Frontend HTTP availability.
- npm high-severity security audit.

## Manual regression evidence

Owner has reported PASS during Phase 4 for:

- WGS84 globe rendering and interaction.
- Correct east/west country orientation.
- Search/location of Qatar, Doha, and DOH.
- Geodesic inspector including zero-distance and Doha–Amman cases.
- WebGL-disabled 2D fallback.
- Layer visibility and persistence.
- Country/continent/marine/city labels.
- Back-hemisphere label hiding.
- Responsive label sizing and overlap suppression.
- Saved regional airports.
- Offline behavior with cached packs.
- Responsive/mobile-size presentation.

## Release hardening changes

- Added explicit antimeridian and near-antimeridian round-trip tests.
- Added runtime Docker smoke validation for Phase 4 reference endpoints.
- Added the Phase 4 implementation branch to direct release-gate execution.
- Added service-worker syntax validation to CI.
- Rotated the PWA cache namespace from the stale Phase 2 cache to `gleason-shell-v0.4.0-rc1` so Phase 4 assets do not share the old runtime cache namespace.

## Semantic boundary

- WGS84 numeric outputs remain `REFERENCE_RESULT`.
- Phase 3 place provenance remains separate from WGS84 computation provenance.
- Continent label anchors remain `DISPLAY_CONVENTION`.
- No Gleason historical claim is promoted to modern reference fact.
- No Phase 5 synchronization or comparison code is included.

## Remaining acceptance gate

P4.7 is not complete until:

1. the final hardening CI run passes,
2. the owner runs the requested final manual acceptance checks,
3. the owner explicitly accepts Phase 4.

Only after explicit Phase 4 acceptance may the release metadata be finalized for v0.4.0 and Phase 5 begin.
