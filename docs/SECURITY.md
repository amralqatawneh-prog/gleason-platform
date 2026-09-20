# Security and Supply-Chain Baseline — current through P5.9

_Last reconciled: 2026-09-20. Accepted application version: v0.4.0._

## Application security rules

- API secrets belong only in backend environment variables / secret stores.
- Frontend `VITE_*` variables are public configuration; secrets must never be
  placed there.
- CORS is explicit and configurable.
- Request IDs are emitted for traceability.
- Standardized API errors must not expose internal stack traces.
- Production Docker configuration disables debug behavior.
- Source/provenance metadata must not be fabricated to satisfy a UI path.
- Unimplemented future services fail closed as unavailable rather than exposing
  placeholder operations.

## Authentication boundary

Authentication/authorization is intentionally not enabled for the current
public/local comparison platform because the implemented server surface does not
yet provide private cloud notebooks/accounts or protected user write APIs.

Authentication and authorization become mandatory before adding protected cloud
accounts, private synchronized experiments, or equivalent user-private server
data.

## Dependency / supply-chain controls

Frontend:
- `npm ci` is the supported reproducible install path.
- `package-lock.json` carries the exact transitive resolution/integrity data.
- CI enforces `npm audit --audit-level=high`.

Backend:
- `uv==0.12.15` is the documented lock/sync tool.
- `uv.lock` is authoritative for the resolved backend environment.
- CI uses locked installs and runs backend tests before release gates continue.

Build dependencies are pinned in `backend/pyproject.toml`.

## Source-data integrity

Production geographic sources are checksum-locked in
`data/sources/phase3-source-lock.json`. CI verifies the locked SHA-256 values
before importing production datasets.

The historical Gleason source record is checksum-identified in
`data/sources/gleason-book.yaml`. Historical scan control points remain empty;
security/integrity policy also prohibits fabricating them.

## Current automated evidence

Release Acceptance Gates #487 on the clean P5.9 owner-tested pre-closure head
`4a5181c6fc8e4ed19f08f2281644cd40ee0282e0` completed successfully and
reported:

- npm security audit: **0 vulnerabilities**;
- backend tests: PASS;
- frontend core/PWA/Chromium gates: PASS;
- production build: PASS;
- locked production-source verification/import: PASS;
- Docker/PostGIS/Redis runtime gates: PASS.

This evidence applies to that exact revision. P5.9 manual regression then passed 10/10 checks as reported by the owner. Any dependency/source/security change requires fresh evidence; closure-documentation commits must also pass their own CI before merge.

## Future security work

The following remain later-phase work unless separately implemented:

- authentication/authorization for private cloud features;
- provider-specific rate limiting and secret rotation for live external APIs;
- stricter container/base-image digest pinning;
- signed mobile/store release handling;
- broader supply-chain/SBOM/release-signing hardening;
- private experiment synchronization and account data governance.

No Phase 5 documentation update should imply these controls already exist.
