# Gleason Platform — Current Project Handoff

_Last updated: 2026-09-19_

## Purpose

This document is the canonical continuity handoff for the Gleason Platform project. It records the agreed roadmap, implementation rules, completed phases, current Phase 5 state, validation evidence, known boundaries, and the next permitted steps.

## Repository and working branch

- Repository: `amralqatawneh-prog/gleason-platform`
- Current implementation branch: `feat/phase5-shared-state` (uploaded, draft PR #9), based on accepted Phase 4 commit `1e46b8c38a5834f56d3ed70d8a396e8902e3efe3`. The Phase 4 remote branch and draft PR #8 remain unchanged.
- Audited remote baseline: `99a3658bef7eb678df7beed157bd01ed92aaa62b`.
- Uploaded correction code revision: `9dfb1e0bada56768e1a7429ed5f9eec24c130f3b` (M1–M6). Build supplied for final owner review: `a0a8e299d3be4b35ce74f710a1f8fc32f00e8939`, validated by [CI #188](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35388167995). Acceptance closure updates application metadata to 0.4.0 and acceptance state only; no Phase 5 code is included.
- Validated correction snapshot: `fb4dcab447ddbb94924df46576ab9f52f64e6c22`. [Release Acceptance Gates #186](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35387031277) — SUCCESS, including six browser tests and Docker/production-source gates. Baseline #184 is historical evidence only.
- Upload explicitly authorized by the owner on 2026-09-18 and completed with a non-force branch update. PR #8 remains open/draft/unmerged; no release or tag was created.
- Phase 4: **ACCEPTED BY OWNER on 2026-09-18**; all owner manual checks reported PASS. Accepted application version: **v0.4.0**. Acceptance source: `docs/PHASE_4_ACCEPTANCE.md`.
- Current evidence: `docs/PHASE_4_CORRECTIONS_TEST_REPORT.md`. Canonical future scope: `docs/ROADMAP_CURRENT.md`.
- Phase 5: **STARTED by explicit owner instruction on 2026-09-19: «ابدأ المرحله الخامسة»**. The previous hold is lifted for Phase 5 implementation. P5.1 is the first slice; see `PHASE_5_PLAN.md` and `PHASE_5_P5_1_REPORT.md`. Phase 4 remains accepted; Phase 5 is not accepted.

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
- Manual checks that are not performed are `NOT RUN`. Use `WAIVED BY OWNER` only when the owner explicitly waives that particular check; never infer a waiver or PASS.
- Phase 4 is accepted. The explicit 2026-09-19 instruction starts Phase 5; continue one slice at a time. It does not authorize Phase 6, PR merges, tags or releases.

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
**ACCEPTED BY OWNER — P4.1–P4.7 and corrections M1–M6 complete. Automated gates PASS; the owner reported all corrected-build manual checks PASS and explicitly accepted Phase 4 on 2026-09-18. Application version: v0.4.0.**

## Owner approval — 2026-09-18

The owner approved all eight audit proposals: «نعم موافق، وموافق على المقترحات».
This authorizes M1–M6 implementation, M7 roadmap reconciliation and M8 future backlog planning. It does not constitute Phase 4 acceptance, release/merge authorization or permission to start Phase 5.

The owner subsequently answered «نعم اسمح» to the specific request to upload the seven commits to this repository/branch and run CI without merge or release. This upload is complete. See the correction report for the original/uploaded commit mapping and exact CI evidence.

See `docs/APPROVED_CORRECTIONS_2026-09-18.md` for scope, progress and validation. Previous manual PASS records below refer to the historical implementation, not to the corrected revision.

### Historical Phase 4 acceptance and Phase 5 hold (superseded by explicit start)

The owner subsequently stated:

> قمت بالاختبار ونجحت كل الاختبارات، يمكنك اعتماد المرحلة الرابعة، وتوثيق ذلك، ولا تبدأ بالمرحلة الخامسة حتى اخبرك

This is explicit Phase 4 acceptance after owner-reported successful testing. Record manual results as **PASS — REPORTED BY OWNER**; device/browser details were not supplied. The authoritative record is `docs/PHASE_4_ACCEPTANCE.md`. Phase 5 was **NOT STARTED / ON HOLD** at acceptance; the owner explicitly lifted this hold on 2026-09-19: «ابدأ المرحله الخامسة». No merge, tag or GitHub Release is implied by this acceptance.

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

Historical P4.5 used backend WGS84 geodesic inverse. Approved M2 adds an independent GeographicLib JS offline engine, tested against backend PROJ; it is not a spherical approximation.

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

Historical P4.7 cache namespace: `gleason-shell-v0.4.0-rc1`.
Approved M2 replaces it with `gleason-shell-v{accepted app version}-{content hash}` and precaches compiled assets.

Final interaction request from owner:
- horizontal globe drag direction was inverted.
- New behavior:
  - drag pointer right → globe moves left,
  - drag pointer left → globe moves right.
- Vertical behavior unchanged.
- Click-to-select preserved.
- Automated regression test added.
- Owner manual test: PASS.

Historical P4.7 closure CI:
- run #177
- final conclusion: SUCCESS
- initial attempt failed only because Docker Hub token/image metadata requests reset/EOF; retry succeeded.
- frontend/backend/security/build checks were already green before the transient Docker failure.

## Current acceptance state

Historical slice state (new correction evidence is separate):
- P4.1 COMPLETE ✅
- P4.2 COMPLETE ✅
- P4.3 COMPLETE ✅
- P4.4 COMPLETE ✅
- P4.5 COMPLETE ✅
- P4.6 COMPLETE ✅
- P4.7 COMPLETE ✅

Overall:
- Phase 4: **COMPLETE AND ACCEPTED BY OWNER**, including M1–M6 corrections; manual checklist **PASS — REPORTED BY OWNER**.
- Accepted application version: **v0.4.0**. This is version metadata, not a claim that a GitHub Release/tag exists.
- Phase 5: **IN PROGRESS — P5.1 shared geographic state**, authorized 2026-09-19; no Phase 5 owner acceptance yet.

## Required next steps

1. Follow `PHASE_5_PLAN.md`, implementing and verifying one slice at a time. P5.1 establishes a single typed geographic selection; its evidence and owner checklist are in `PHASE_5_P5_1_REPORT.md`.
2. Next planned slice: P5.2 independent adapters with explicit units/domains. Cross-model display synchronization remains unavailable until its own slice.
3. Preserve Phase 4 acceptance and its successful CI #190 on `1e46b8c38a5834f56d3ed70d8a396e8902e3efe3`: https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35412122803. This historical CI does not validate Phase 5 changes.
4. Owner explicitly authorized Phase 5 upload and CI: «نعم اسمح بذلك». Implementation `e64d2234246d876c208c4d1cda87672a6945d4be` passed CI #192 (run `35414383012`), including all seven Chromium scenarios and Docker/source gates. PR #9 remains draft/open/unmerged. Owner reported all three delivered P5.1 checks PASS, and reported missing Arabic city search; see `ARABIC_CITY_SEARCH_FIX.md`; merge/tag/release remain unauthorized.
5. Accepted application version remains 0.4.0; current changes are unreleased Phase 5 development. Capabilities distinguish implementation phase 5 from accepted phase 4.

## Phase 5 boundary / future agreed direction

Current Phase 5 slices, the Phase 5/6 measurement boundary, all phases through 22 and M8 backlog are in `docs/ROADMAP_CURRENT.md`. ADR-014 records the current WebGL2 renderer instead of the originally planned Cesium choice.

Phase 5 is the current synchronization/comparison phase; the owner has explicitly authorized its start.

Synchronization must:
- use canonical WGS84 geographic coordinates as shared state,
- never synchronize by pixel position,
- keep Gleason Historical, AE Visualization, and WGS84 Reference engines independent,
- preserve source/provenance semantics,
- never normalize outputs merely to make models agree,
- make model differences visible rather than hiding them.

Phase 4 acceptance is complete. The 2026-09-19 start instruction now authorizes Phase 5, but not Phase 6.

## Local Windows / Git Bash workflow

The following commands retrieve the Phase 5 development branch, including for a checkout previously configured to fetch only Phase 4:

```bash
git remote set-branches --add origin feat/phase5-shared-state
git fetch origin
git switch feat/phase5-shared-state
git pull --ff-only origin feat/phase5-shared-state
docker compose up --build -d
docker compose ps
```

Open:
`http://127.0.0.1:8080`

Let the online build install its service-worker update, close all existing app tabs/windows, then reopen. The worker intentionally waits for old clients to close; a hard refresh alone does not guarantee activation. Complete installation before the offline checklist.

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
