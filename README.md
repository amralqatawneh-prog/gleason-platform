# Gleason Comparison Platform — v0.5.0

Offline-first bilingual geospatial comparison platform with three independent
model engines:

- **Gleason Historical** — source-grounded historical reconstruction with
  explicit evidence classifications.
- **AE Visualization** — independent north-polar Azimuthal Equidistant model.
- **WGS84 Reference** — modern geodetic reference globe/2D fallback with
  authoritative backend reference calculations.

> **Current development status — 2026-09-22**
>
> Phase 5 remains **ACCEPTED BY OWNER** at **v0.5.0**. Phase 6 remains
> **IN PROGRESS**. P6.1–P6.6 are now **CLOSED**. The corrected P6.6 contract was
> owner-tested **6/6 PASS — REPORTED BY OWNER** on `e96712975fc9f54f2615e235bb6976136efe8a2d` after
> Release Acceptance Gates **#783 — SUCCESS**. The exact P6.6 closure head
> `1d84ba85ba21d320a0de0ed16d87006c5ef80c84` passed **Release Acceptance Gates #784 — SUCCESS** and PR #31 was
> separately authorized and **MERGED** into `main @ 6a2666112e56514051ea62fbe1c25f5a8016f1ae`.
> No independent post-merge workflow run is claimed for the merge commit.
> **P6.7A — Same Route, Three Renderings remains NOT STARTED**. No Phase 6
> acceptance, tag, GitHub Release or deployment is implied.

## Current verified development baseline

- Current integration baseline: `main @ 6a2666112e56514051ea62fbe1c25f5a8016f1ae` — PR #31 merge commit.
- PR #31 final head: `1d84ba85ba21d320a0de0ed16d87006c5ef80c84`; **Release Acceptance Gates #784 — SUCCESS**.
- Corrected-contract owner-tested head: `e96712975fc9f54f2615e235bb6976136efe8a2d`; pre-manual **#783 — SUCCESS**; owner manual **6/6 PASS — REPORTED BY OWNER**.
- P6.6 status: **CLOSED / VERIFIED + MERGED**.
- P6.7A status: **NOT STARTED**.
- Accepted application version remains **0.5.0**.
- Accepted phase remains **5**.
- Implementation phase remains **6 / in_progress**.
- No independently observed post-merge CI run is claimed for `6a2666112e56514051ea62fbe1c25f5a8016f1ae`.
- No tag, GitHub Release or deployment has been created for Phase 6.
- Historical phase/reconciliation sections below retain the state that was true when they were written; this block and `docs/PROJECT_HANDOFF_CURRENT.md` define current execution state.

## Phase status

| Phase / slice | Status | Evidence / boundary |
|---|---|---|
| Phase 0 | ACCEPTED ✅ | Product framing, source policy, architecture |
| Phase 1 | ACCEPTED ✅ | Foundation / PWA / Docker / CI |
| Phase 2 | ACCEPTED ✅ | Gleason + independent AE foundation |
| Phase 3 | ACCEPTED ✅ | PostGIS place catalog, locked sources, online/offline search |
| Phase 4 | ACCEPTED ✅ | WGS84 reference model, accepted 2026-09-18 at v0.4.0 |
| P5.1 | CLOSED ✅ | Versioned canonical geographic selection |
| P5.2 | CLOSED ✅ | Independent Gleason / AE / WGS84 adapters |
| P5.3 | CLOSED ✅ | Shared search/pick/marker synchronization |
| P5.4 | CLOSED ✅ | Model Laboratory with readable provenance/limitations |
| P5.5 | CLOSED ✅ | Explicit comparability contract |
| P5.6 | CLOSED ✅ | Independent zoom/focus/rotation/navigation |
| P5.7 | CLOSED ✅ | Homogeneous-difference gate + unavailable future-service contracts |
| P5.8 | CLOSED ✅ | Versioned local state persistence |
| P5.9 | CLOSED ✅ | 10/10 owner manual regression checks PASS — REPORTED BY OWNER |
| Phase 5 | ACCEPTED ✅ | Owner explicitly accepted whole phase on 2026-09-20 · v0.5.0 |
| P6.1 | CLOSED ✅ | Measurement semantics contract · CI #519/#520/#529 · owner 5/5 PASS |
| P6.2 | CLOSED ✅ | Transient route state up to 50 points; direct map-add on all three models; CI #532/#546; owner 6/6 + refinement PASS |
| P6.3 | CLOSED ✅ | WGS84 geodesic distance; route guide; straight Gleason/AE segments; mouse/touch pan; WGS84 Great Circle reference; owner 6/6 + 5/5 + 4/4 + 6/6 PASS; PR #19 merged; post-merge CI #643 SUCCESS |
| P6.4 | CLOSED ✅ | AE projected-plane segment/open-polyline distance; backend pyproj + browser proj4; CI #653/#661/#668 SUCCESS; owner manual 6/6 PASS; PR #21 merged; post-merge CI #669 SUCCESS |
| Roadmap Architecture Amendment 2026-09-21 | CLOSED + MERGED ✅ | Initial verification `cb4b4681bd359e29b08542856b7bff144a239796` / CI #673; exact final head `c73ca4cdd41b2e3cd745df5412be30a44d2bda9c` / CI #676; PR #23 merged at `de2cf9b0a8a48a788323373eb2b9c72622c288f8` |
| P6.5 | CLOSED ✅ | Gleason normalized-native segment/open-polyline distance; no metre/km conversion; CI #691 SUCCESS; owner manual 6/6 PASS — REPORTED BY OWNER |
| P6.6 | CLOSED / VERIFIED + MERGED ✅ | Corrected contract owner 6/6 PASS on `e96712975fc9f54f2615e235bb6976136efe8a2d` after #783; exact closure head `1d84ba85ba21d320a0de0ed16d87006c5ef80c84` passed #784; PR #31 merged at `6a2666112e56514051ea62fbe1c25f5a8016f1ae` |
| P6.7A–P6.10 | NOT STARTED ⏳ | Same-route rendering, turn-by-turn provider slice, laboratories, regression |

Phase 5 as a whole is **ACCEPTED BY OWNER**. Historical reports retain the status
that was true when each report was written; current status is defined by this
README, `docs/PHASE_5_ACCEPTANCE.md`, `docs/PROJECT_HANDOFF_CURRENT.md`, and
`docs/PHASE_5_PLAN.md`.

## Implemented Phase 5 capabilities

- One typed canonical WGS84 geographic selection shared by all three model
  views; free-point picks never inherit stale place identity.
- Independent adapters with explicit model/version/domain/unit/provenance.
- Search/pick/marker synchronization without pixel-coordinate coupling.
- Model Laboratory explaining the same geographic point in all three systems.
- Comparability rules that reject unlike meanings/spaces/scales instead of
  forcing normalization.
- Independent cameras and navigation controls on Gleason, AE and WGS84:
  zoom, wheel/pinch support, zoom-to-area, rotation/view-direction where
  meaningful, reset, fit-full and focus-selected.
- Homogeneous numeric differences only after a valid comparability decision;
  current cross-model pairs expose no fabricated numeric delta.
- Versioned future-service contracts for time/astronomy, shared layer
  synchronization and routes; all are explicitly **Unavailable** until their
  planned phases.

### P5.8 current scope

P5.8 has implemented and closed schema-versioned IndexedDB persistence for the canonical
Phase 5 geographic selection. Saved place identity is restored only when an
unchanged matching record exists in installed offline packs; otherwise only the
valid coordinate is restored, without inventing place provenance.

P5.8 does not persist routes, experiments, astronomy state or shared future
service state.

P5.8 acceptance: owner-reported PASS after CI #439/#442 SUCCESS.

### P5.9 clean integration note

P5.8 PR #11 is now merged into `main` at
`7d490d6bf207a1d919cb01f5f99ac8a7275f0fd4`. P5.9 continues on the clean
branch `feat/phase5-p5-9-acceptance-clean`.

P5.9 is CLOSED after clean-head CI #487 SUCCESS and all ten owner manual
regression checks were reported PASS. The owner then explicitly accepted Phase 5
as a whole on 2026-09-20. Accepted application version is now **0.5.0**. A
superseded PR #12 contains unverified acceptance/version claims and must not be
merged.

### P5.9 closure

P5.9 is the final Phase 5 regression package and is now **CLOSED**. It added no
new model engine. The owner reported PASS on all ten manual checks covering
browser/offline/bilingual/mobile behavior, navigation independence, Model
Laboratory semantics, persistence, WebGL fallback and Phase 6 boundaries.

The machine-readable evidence remains in
`docs/PHASE_5_ACCEPTANCE_PACKAGE.json`, and the explicit whole-phase owner
decision is recorded in `docs/PHASE_5_ACCEPTANCE.md`.

## Phase 6 current scope

P6.1–P6.6 are closed. Implemented Phase 6 capabilities include the measurement
semantics contract, transient ordered route state, WGS84 geodesic distance, AE
projected-plane distance, Gleason native normalized distance, and independent
WGS84/AE/Gleason polygon perimeter/area. The corrected Gleason measurement
package keeps native NRU/NRU², the preferred `gleason-fig43-circle-derived`
historical scale, the radial-60 legacy comparison, Figure 43 same-latitude
arc/chord separation, Figure 37–38 frame/time conversion, and provisional
restored-raster georeferencing.

The next permitted functional slice is **P6.7A — Same Route, Three Renderings**,
but it has not started.

## Explicitly not implemented yet

- P6.7A same canonical route rendered across all three models with preserved computation identity.
- P6.7B RouteProvider / turn-by-turn routing; provider-backed road/flight paths remain unavailable until dedicated providers are implemented.
- P6.8 Navigation / Longitude Laboratory and P6.9 Gleason Original Mode.
- P6.10 whole-Phase-6 regression/acceptance package.
- Phase 9–12 astronomy/time/ObserverContext/virtual observer dome/analemma/eclipse engines.
- Phase 15 Aviation Laboratory live/historical/scheduled provider integrations.
- Phase 16 high-detail streets/buildings/cities and advanced external-layer providers.
- Shared cross-model layer-state service.
- Automatic conversion of Gleason native normalized units into SI distance/area without an explicit documented scale basis.
- Final authoritative historical-raster city control points; the current fit remains provisional and no control points are fabricated.

## Source and data status

Production source data remain locked; this documentation synchronization does
not replace or mutate them.

| Source | Locked version / revision | Status |
|---|---|---|
| Gleason primary source | `gleason-1893-upload-v1`, 432 PDF pages, SHA-256 `03e429285376c7fcd21659116f43a8da7d6e363169e7c7841c9b31518effbe60` | Historical source record |
| Natural Earth | 5.1.2, commit `f1890d9f152c896d250a77557a5751a93d494776` | Locked |
| OurAirports | 2026-09-17, commit `634f91708ba8830b75e4f7905afce3cd4e49144e` | Locked |

Current locked catalog expectations: **177 countries · 243 cities · 16 seas ·
7 oceans · 12 rivers · 632 mountains · 86,089 airports**.

Authoritative manifests:

- `data/sources/gleason-book.yaml`
- `data/sources/phase3-source-lock.json`
- `data/sources/phase3-place-sources.yaml`

No fabricated coordinates, scan control points or undocumented historical scale
conversion are allowed.

## Approved roadmap amendment — 2026-09-21

The owner approved the expanded roadmap covering solar/lunar analemmas, ObserverContext/current-location/pin workflows, observer sky dome, eclipse top/observer views, high-detail streets/cities, precise day/night/twilight events, an Aviation Laboratory, OSIRIS-inspired provider architecture and turn-by-turn routing.

Authoritative planning documents:
- `docs/ROADMAP_ARCHITECTURE_AMENDMENT_2026-09-21.md`
- `docs/ROADMAP_ASTRONOMY_ARCHITECTURE_AMENDMENT_2026-09-21.md`
- `data/sources/astronomy-comparative-sources.yaml`
- `docs/SHARED_CONTEXT_PROVIDER_CONTRACTS.md`
- `docs/DEVELOPER_GUIDE.md`
- `docs/USER_GUIDE.md`
- `docs/CALCULATION_REFERENCE.md`

The original amendment and the approved astronomy addendum were architecture/documentation work only and did not themselves start P6.6. P6.6 was later implemented, verified and merged through PR #31. Phase 9, a Saros engine, observer-dome rendering, and astronomy/aviation/high-detail-map runtime implementation remain unstarted.

## Architecture rules

- Shared state is **geographic**, never screen pixels.
- Gleason Historical, AE Visualization and WGS84 Reference stay numerically
  independent.
- Do not normalize outputs merely to make models agree.
- Keep `SOURCE_TEXT`, `SOURCE_CLAIM`, `COMPUTED_RESULT` and
  `REFERENCE_RESULT` distinct.
- Missing input/data stays missing; do not silently invent height, identity,
  scale or provenance.
- Backend WGS84 reference calculations remain the numerical acceptance
  authority; client-side implementations are independently parity-tested.

## Run the current main branch

### Git / Docker

```bash
git fetch origin
git switch main
git pull --ff-only origin main
docker compose up --build -d
docker compose ps
```

Open:

```text
http://127.0.0.1:8080
```

Do **not** run `docker compose down -v` unless you intentionally want to erase
local Docker volumes/data.

### Backend

```bash
cd backend
pip install uv==0.12.15
uv sync --locked --extra dev
uv run --locked --extra dev pytest -q
uv run --locked uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm ci
npm audit --audit-level=high
npm run test:core
npm run test:pwa
npm run build
npm run test:e2e
```

## Production data workflow

A normal Docker startup does not automatically replace/import the complete
locked production datasets.

```bash
python scripts/fetch_phase3_sources.py --output-dir .phase3-data
```

On Windows, when the Python launcher is the reliable interpreter:

```bash
py -3 scripts/fetch_phase3_sources.py --output-dir .phase3-data
```

Use the existing update/import scripts documented in Phase 3 and the Arabic city
correction report. Never delete Docker volumes merely to refresh source data.

## Documentation map

Current source-of-truth documents:

- `docs/PROJECT_HANDOFF_CURRENT.md` — canonical continuity handoff.
- `docs/ROADMAP_CURRENT.md` — approved phases 0–22 and boundaries.
- `docs/PHASE_5_PLAN.md` — ordered Phase 5 slice contracts/status.
- `docs/PHASE_5_P5_9_REPORT.md` — latest closed Phase 5 slice.
- `docs/PHASE_6_PLAN.md` — ordered Phase 6 slices; P6.1–P6.6 are closed and P6.7A is the next not-started slice.
- `docs/PHASE_6_P6_3_REPORT.md` — closed P6.3 implementation/verification report.
- `docs/PHASE_6_P6_4_REPORT.md` — closed P6.4 implementation/verification report.
- `docs/PHASE_6_P6_5_REPORT.md` — closed P6.5 Gleason native measurement report.
- `docs/POST_PR31_MERGE_RECONCILIATION_2026-09-22.md` — current post-PR31 documentation/state reconciliation.
- `docs/POST_PR29_MERGE_RECONCILIATION_2026-09-21.md` — historical post-PR29 reconciliation, merged through PR #30.
- `docs/POST_PR28_MERGE_RECONCILIATION_2026-09-21.md` — historical post-PR28 reconciliation, closed and merged through PR #29 after final head `7751e76c1d3fe3e8c129436717042a49040ead4b` passed Release Acceptance Gates **#754 — SUCCESS**.
- `docs/POST_PR27_MERGE_RECONCILIATION_2026-09-21.md` — historical post-PR27 documentation reconciliation.
- `docs/POST_PR25_MERGE_RECONCILIATION_2026-09-21.md` — historical post-PR25 documentation reconciliation.
- `docs/POST_PR23_MERGE_RECONCILIATION_2026-09-21.md` — historical post-PR23 documentation reconciliation.
- `docs/POST_PR19_MERGE_RECONCILIATION_2026-09-20.md` — historical post-PR19 documentation reconciliation.
- `docs/NAVIGATION_MEASUREMENT_REQUIREMENTS.md` — navigation/measurement requirements.
- `docs/GITHUB_SYNC_AUDIT_2026-09-19.md` — GitHub/documentation/data audit.
- `docs/POST_PR13_MERGE_RECONCILIATION_2026-09-20.md` — historical post-PR13 reconciliation.
- `docs/POST_PR16_MERGE_RECONCILIATION_2026-09-20.md` — closed post-PR16 reconciliation.
- `docs/POST_PR17_GITHUB_SYNC_2026-09-20.md` — current post-PR17 GitHub state sync.
- `CHANGELOG.md` — chronological implementation/acceptance history.

Historical phase reports under `docs/` are evidence artifacts and are
intentionally not rewritten to pretend they were authored at the current state.

## Historical scan limitation

The affine/georeferencing engine is implemented, but no verified distributable
standalone historical map scan is embedded and `control_points` remains empty.
Do not fabricate control points or claim that the source printed the modern
analytic reconstruction used by the software.

## Release / merge boundary

PR #13 was separately authorized and has been **merged into `main`** at
`913ec67c195ac5971e0f63d9acfe94dba8de60bf`. The accepted PR head passed
Release Acceptance Gates **#514**, and the resulting `main` merge commit passed
Release Acceptance Gates **#515**.

PR #16 was separately authorized and merged at
`c1d72e1d1536cf1aba9376e4ada76b7fc31056f5`; post-merge CI #554 succeeded.
PR #17 was subsequently authorized and merged at
`660a7908dd9e3c2f073155a5394d5dfb60ee67e8`; post-merge CI #558 succeeded.
PR #18 then merged at `645a27c5ea92febd78c3bdd823281ff496a742b3`;
post-merge Release Acceptance Gates **#561 — SUCCESS**.
PR #19 was separately authorized and merged at
`4aac199646f3a899b45e241bf8995e8ba7c8f2a0`; its exact pre-merge head
`c775aac8a97a6782915782ed2118c3018cfe5a1a` passed Release Acceptance Gates
**#642 — SUCCESS**, and post-merge `main` passed **#643 — SUCCESS**.

No tag or GitHub Release exists and deployment remains a separate authorization.
Phase 6 remains **IN PROGRESS**; P6.1–P6.6 are CLOSED / VERIFIED, and PR #31 is merged. P6.7A remains **NOT STARTED**.

### P6.3 closure and merge
- Base manual verification: **6/6 PASS — REPORTED BY OWNER**.
- Route-guide refinement retest: **5/5 PASS — REPORTED BY OWNER**.
- Straight-line refinement retest: **4/4 PASS — REPORTED BY OWNER**.
- Pan + Great Circle refinement retest: **6/6 PASS — REPORTED BY OWNER**.
- Final closure head `c775aac8a97a6782915782ed2118c3018cfe5a1a` passed **CI #642 SUCCESS**.
- PR #19 merge commit: `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`.
- Post-merge Release Acceptance Gates: **#643 SUCCESS**.
- P6.3 and P6.4 are **CLOSED**; P6.5 remains **NOT STARTED**.


### Closed P6.4 — AE Native Measurement
- Start baseline: `main @ 35fda15508973340669220a20ee1c5bf6bbaa39a`; post-PR20 CI #651 SUCCESS.
- AE adjacent route segments are measured as straight Euclidean chords in the independent north-polar AE projected plane.
- Method identity: `ae-projected-plane`; contract unit: `metre`; scale basis: `ae-projected-plane-si-metre`.
- Backend uses pyproj/PROJ; browser/offline fallback uses proj4 2.22.0.
- AE projected metres are explicitly not relabeled as WGS84 geodesic distance.
- Implementation head `bd73fa0f6aa4cfd9c1d415c915f0ad35bd4c3476` passed Release Acceptance Gates **#653 — SUCCESS**.
- Current owner-tested head `59d19a96c6a7af443429d8ba7585386d4f491dee` passed Release Acceptance Gates **#661 — SUCCESS**.
- Owner manual verification: **6/6 PASS — REPORTED BY OWNER**.
- P6.4 is **CLOSED + MERGED** through PR #21; P6.5, P6.6, P6.7A and P6.7B remain **NOT STARTED**.
