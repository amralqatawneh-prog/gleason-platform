# Gleason Platform — Current Project Handoff

_Last updated: 2026-09-18_

## Purpose

This document is the canonical continuity handoff for the Gleason Platform project. It records the agreed roadmap, implementation rules, completed phases, current Phase 4 state, validation evidence, known boundaries, and the next permitted steps.

## Repository and working branch

- Repository: `amralqatawneh-prog/gleason-platform`
- Current implementation branch: `feat/phase4-wgs84-reference`
- Current tested head: `0005c030e5545e43a1a5c759e3adbcad603ff99e`
- Latest CI on that head: `Release Acceptance Gates` run #177 — SUCCESS after retry of a transient Docker Hub network failure.
- Phase 5 has NOT started.

## Project architecture agreed with owner

The platform is a web-first, PWA, offline-first comparative geospatial platform with three strictly independent model engines:

1. **Gleason Historical Model**
   - Source-faithful historical reconstruction.
   - Claims/rules classified as DOCUMENTED / DERIVED / ASSUMED / DISPLAY_CONVENTION / REFERENCE.
   - Historical claims must never be silently presented as modern scientific facts.

2. **AE Visualization Model**
   - Independent modern Azimuthal Equidistant visualization.
   - Must not be automatically attributed to Gleason.

3. **WGS84 Reference Model**
   - Modern geodetic reference model.
   - Numeric outputs are `REFERENCE_RESULT`.
   - Backend calculations are authoritative; rendering is only visualization.

Canonical WGS84 geographic coordinates are the shared geographic state for later synchronization work. Pixel coordinates are never used as the cross-model synchronization contract.

Semantic separation:
- `SOURCE_TEXT`
- `SOURCE_CLAIM`
- `COMPUTED_RESULT`
- `REFERENCE_RESULT`

## Governance and execution rules

The owner explicitly requires:

- Execute one phase/slice at a time.
- Do not jump ahead.
- Do not start the next phase until the current phase is technically closed and, where required, explicitly accepted by the owner.
- Every phase/slice includes:
  - implementation summary,
  - files/functions changed,
  - run/update instructions,
  - automated test results,
  - manual test checklist/results,
  - known issues/limitations,
  - status and completion percentage,
  - acceptance criteria.
- Never fabricate PASS/FAIL.
- Mocks are allowed only when explicitly labeled.
- Every release-relevant change should have:
  - changelog update,
  - clear Git commit,
  - test report,
  - documentation update.
- Manual checks that are not performed are `WAIVED BY OWNER`, never PASS.
- Phase 5 is forbidden until explicit Phase 4 acceptance.

## Gleason source rules and verified historical basis

Primary source reviewed:
- `Alex Gleason - Is the Bible From Heaven.pdf`
- 432 PDF pages.
- Second Edition revised/enlarged.
- Copyright 1890; rewritten/revised/enlarged 1893.
- SHA-256:
  `03e429285376c7fcd21659116f43a8da7d6e363169e7c7841c9b31518effbe60`

Important verified source notes:
- Ch. XIII–XIX cover geodetic arguments, sun motion, distance, longitude, time, navigation, eclipses, rivers.
- Ch. XVII describes “A New Circular Map of the World, and Longitude and Time Calculator.”
- PDF p.377 describes the 14¼-inch circle, 24-hour dial, and detached radiating arms marked with latitude degrees.
- PDF p.429 / Fig.43 states the historical longitude-line divergence claim.
- The current computational formula for historical longitude-degree miles is a DERIVED reconstruction:
  `60 - (2/3) * latitude`
  and must not be represented as WGS84.
- PDF p.360 / Fig.30 explicitly says exactness is not claimed for the illustrated sun spiral.
- The current Gleason forward/inverse provider is a DERIVED computational reconstruction; do not claim the book prints a modern analytic projection formula.

## Phase history

### Phase 0 — ACCEPTED ✅

Project framing, source policy, semantic categories, roadmap, and acceptance discipline established.

### Phase 1 — ACCEPTED ✅

Delivered:
- monorepo skeleton,
- FastAPI + React/Vite,
- responsive RTL/LTR,
- PWA manifest/service worker app shell,
- IndexedDB abstraction and offline pack manifest,
- Capacitor Android/iOS,
- Docker/config/logging/CI/tests,
- capability detection,
- WebGL/3D fallback shell.

Canonical normalized structure enforced by CI.

### Phase 2 — ACCEPTED ✅

Final accepted release line: v0.2.0.

Delivered:
- Gleason historical projection engine,
- independent AE engine,
- independent OpenLayers maps,
- source viewer,
- affine georeferencing baseline,
- source catalog,
- core-world offline map,
- projection APIs/tests,
- source-faithful metadata.

Explicitly deferred:
- WGS84 globe to Phase 4,
- synchronization to Phase 5.

### Phase 3 — ACCEPTED ✅

Final accepted version: v0.3.0.

Delivered:
- PostGIS/pg_trgm place catalog,
- unified search,
- offline search index and regional packs,
- production-source lock and SHA-256 validation,
- Natural Earth + OurAirports import pipeline,
- country/city/sea/ocean/river/mountain/airport taxonomy,
- Arabic/English search,
- offline core-world search pack,
- country/regional packs,
- canonical place IDs and provenance.

Locked source category counts enforced in CI:
- country 177
- city 243
- sea 16
- ocean 7
- river 12
- mountain 632
- airport 86,089

Owner manual Phase 3 acceptance passed.

## Phase 4 — WGS84 Reference Model

Overall Phase 4 status:
**READY FOR OWNER ACCEPTANCE — technical slices P4.1 through P4.7 are complete; Phase 4 itself is NOT yet accepted until the owner explicitly accepts it.**

### P4.1 — COMPLETE ✅

WGS84 provider foundation.

Delivered:
- `WGS84GeodeticPoint`
- `ECEFPoint`
- geodetic ↔ ECEF
- geodesic inverse
- explicit longitude normalization function
- provenance metadata
- `REFERENCE_RESULT` semantics

Reference identifiers:
- geographic CRS: EPSG:4979
- ECEF CRS: EPSG:4978
- frame: WGS 84
- provider/model: `wgs84-reference`
- version: `WGS84-0.4.0`

Important rule:
- ellipsoidal height is not orthometric/geoid/mean-sea-level height.
- backend authoritative API does not silently normalize out-of-domain longitude.

### P4.2 — COMPLETE ✅

Reference API delivered:
- `GET /api/v1/models/reference/wgs84`
- `POST /api/v1/reference/wgs84/geodetic-to-ecef`
- `POST /api/v1/reference/wgs84/ecef-to-geodetic`
- `POST /api/v1/reference/wgs84/geodesic-inverse`

Invalid latitude/longitude returns explicit validation error.

### P4.3 — COMPLETE ✅

WGS84 globe and 2D fallback.

Delivered:
- interactive WebGL2 WGS84 ellipsoid,
- drag rotation,
- click-to-coordinate selection,
- automatic 2D fallback,
- responsive UI,
- Arabic/English,
- `REFERENCE_RESULT` labeling.

Manual PASS:
- WebGL2 mode,
- drag,
- click,
- mobile-size layout,
- WebGL-disabled fallback,
- 2D click.

### P4.4 — COMPLETE ✅

Phase 3 place integration.

Delivered:
- canonical Phase 3 place selection shown on WGS84 view,
- same canonical place ID, category, country, source, online/offline state,
- focus marker in 3D and 2D,
- corrected globe orientation,
- corrected CORS for localhost/127.0.0.1.

Manual PASS:
- Qatar
- Doha
- DOH
- globe orientation
- API connectivity

No Phase 5 synchronization was introduced.

### P4.5 — COMPLETE ✅

WGS84 Geodesic Inspector.

Uses backend WGS84 geodesic inverse, not a local approximation.

Delivered:
- capture A/B,
- backend calculation,
- distance,
- initial bearing,
- final arrival forward bearing,
- reverse endpoint-to-start bearing,
- null bearing for identical point,
- provenance,
- Arabic/English,
- `REFERENCE_RESULT`.

Manual PASS:
- Doha → Doha = 0 distance and no fake bearings.
- Doha → Amman returned valid reference geodesic values.

### P4.6 — COMPLETE ✅

Offline/persistence + detailed globe layers.

Delivered:
- IndexedDB-persisted layer visibility,
- country boundaries,
- Phase 3 cached oceans/seas/rivers/cities,
- saved regional airports,
- continent/country/marine/city/airport labels,
- front-hemisphere label filtering,
- label collision suppression,
- responsive label sizing,
- 2D fallback layer rendering,
- corrected east/west globe orientation,
- source/identity preservation.

Important agreed behavior:
- airports remain optional and regional/offline-pack based; do not load all ~86k airports globally by default.
- continent label anchors are `DISPLAY_CONVENTION`, not authoritative source coordinates.

Owner manual PASS:
- country/continent orientation,
- layer toggles,
- persistence,
- seas/oceans/rivers/cities,
- saved regional airports,
- labels,
- hidden rear labels,
- label sizing,
- overlap suppression,
- Arabic/English,
- 2D fallback,
- offline behavior.

Final P4.6 closure CI: run #158 SUCCESS.

### P4.7 — COMPLETE ✅ technically

Validation / release hardening.

Added/verified:
- geodetic/ECEF anchors,
- round-trip tolerances,
- antimeridian handling,
- near-antimeridian round trip,
- poles/equator,
- identical-point geodesic,
- invalid coordinate rejection,
- provenance completeness,
- frontend reference-globe tests,
- Phase 2/3 regressions,
- npm high-severity security audit,
- production build,
- service-worker syntax,
- PWA cache rotation,
- Docker Compose runtime,
- PostGIS/pg_trgm,
- Redis,
- real production-source imports,
- real search regression,
- offline pack generation.

PWA cache namespace rotated to:
`gleason-shell-v0.4.0-rc1`

Final interaction request from owner:
- horizontal globe drag direction was inverted.
- New behavior:
  - drag pointer right → globe moves left,
  - drag pointer left → globe moves right.
- Vertical behavior unchanged.
- Click-to-select preserved.
- Automated regression test added.
- Owner manual test: PASS.

Latest CI:
- run #177
- final conclusion: SUCCESS
- initial attempt failed only because Docker Hub token/image metadata requests reset/EOF; retry succeeded.
- frontend/backend/security/build checks were already green before the transient Docker failure.

## Current acceptance state

Technical state:
- P4.1 COMPLETE ✅
- P4.2 COMPLETE ✅
- P4.3 COMPLETE ✅
- P4.4 COMPLETE ✅
- P4.5 COMPLETE ✅
- P4.6 COMPLETE ✅
- P4.7 COMPLETE ✅

Overall:
- Phase 4: **READY FOR OWNER ACCEPTANCE**
- Phase 4 is **NOT YET ACCEPTED** until the owner explicitly says they accept Phase 4.
- Phase 5: **NOT STARTED**

## Required next steps

The next permitted sequence is:

1. Update Phase 4 documentation/changelog to record P4.7 final PASS and the inverted drag interaction.
2. Run one final documentation-only CI if documentation is changed.
3. Ask the owner for explicit **Phase 4 acceptance**.
4. Only after explicit acceptance:
   - finalize release metadata to v0.4.0,
   - align `VERSION`, backend package version, frontend package version, changelog,
   - create acceptance/release documentation,
   - merge the Phase 4 PR/branch according to repository workflow,
   - optionally create/tag v0.4.0 only if actually performed and verified.
5. Only after Phase 4 is accepted and release metadata is closed may **Phase 5** begin.

## Phase 5 boundary / future agreed direction

Phase 5 is the future synchronization/comparison phase.

When authorized, synchronization must:
- use canonical WGS84 geographic coordinates as shared state,
- never synchronize by pixel position,
- keep Gleason Historical, AE Visualization, and WGS84 Reference engines independent,
- preserve source/provenance semantics,
- never normalize outputs merely to make models agree,
- make model differences visible rather than hiding them.

Do not implement Phase 5 until owner acceptance of Phase 4.

## Local Windows / Git Bash workflow

Standard update/rebuild:

```bash
git switch feat/phase4-wgs84-reference
git pull
docker compose up --build -d
docker compose ps
```

Open:
`http://127.0.0.1:8080`

Then hard refresh:
`Ctrl + Shift + R`

Important:
- Do NOT run `docker compose down -v` locally unless the owner explicitly intends to delete local Docker volumes/data.
- Git Bash/MSYS may rewrite container absolute paths. For Docker commands using absolute container paths, use `MSYS_NO_PATHCONV=1` where needed.

WebGL-disabled Chrome fallback test:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --disable-webgl --user-data-dir="$TEMP/gleason-no-webgl" http://127.0.0.1:8080
```

## Non-negotiable implementation rules

- No fabricated source claims.
- No fabricated georeferencing control points.
- No invented geometry.
- No fake PASS/FAIL.
- No hidden cross-model normalization.
- No historical claim promoted to modern reference truth.
- Backend reference calculations remain authoritative.
- Visualization is not a substitute for geodetic computation.
- Source provenance remains visible and separate from computed/reference provenance.
- One phase/slice at a time.
