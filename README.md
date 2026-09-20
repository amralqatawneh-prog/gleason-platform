# Gleason Comparison Platform — v0.5.0

Offline-first bilingual geospatial comparison platform with three independent
model engines:

- **Gleason Historical** — source-grounded historical reconstruction with
  explicit evidence classifications.
- **AE Visualization** — independent north-polar Azimuthal Equidistant model.
- **WGS84 Reference** — modern geodetic reference globe/2D fallback with
  authoritative backend reference calculations.

> **Current acceptance status — 2026-09-20**
>
> Phase 5 is **COMPLETE AND ACCEPTED BY OWNER** at **v0.5.0**. All slices
> **P5.1–P5.9 are CLOSED** after automated gates and owner-reported manual PASS.
> Phase 6 measurement/routing is **NOT STARTED** and requires a separate owner
> start instruction.

## Current verified acceptance baseline

- Acceptance branch: `feat/phase5-p5-9-acceptance`
- P5.8 PR **#11**: open/draft/unmerged
- P5.9 PR **#12**: open/draft/unmerged
- Final pre-acceptance implementation/documentation head:
  `cf1f3ad45b6a8da1cf7f608d8da94f275641c676`
- Release Acceptance Gates **#455 — SUCCESS**
- Earlier corrected implementation run **#451 — SUCCESS**
- CI #451/#455 cover the Phase 5 acceptance-package gate, 0 npm vulnerabilities,
  86 frontend core tests, 2 PWA tests, 17 Chromium scenarios, production build,
  WGS84 parity, Docker/PostGIS/Redis, locked-source import and online/offline/
  Arabic search gates.
- Accepted application version: **0.5.0**
- Implementation phase: **5**
- Accepted phase: **5**
- Phase status: **accepted**
- PR #9 remains historically merged into `main`; the later P5.8/P5.9 branches
  are not merged by the acceptance decision.
- No tag, GitHub Release or deployment has been authorized.

Acceptance record: `docs/PHASE_5_ACCEPTANCE.md`.

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
| P5.9 | CLOSED ✅ | Phase 5 regression and owner acceptance package |
| Phase 6 | NOT STARTED ⏳ | Routes, ruler, distance, perimeter and area |

Phase 5 as a whole is **ACCEPTED BY OWNER at v0.5.0**. Historical reports retain the status
that was true when each report was written; current status is defined by this
README, `docs/PROJECT_HANDOFF_CURRENT.md`, and `docs/PHASE_5_PLAN.md`.

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

### P5.9 current scope

P5.9 is the final Phase 5 regression and owner-acceptance package. It adds no
new model engine. It verifies browser/offline/bilingual/mobile/extreme-coordinate
behavior, source visibility and known limitations, and packages the evidence in
`docs/PHASE_5_ACCEPTANCE_PACKAGE.json`.

P5.9 is CLOSED and Phase 5 is ACCEPTED BY OWNER.

## Phase 5 acceptance — 2026-09-20

The owner reported «نجحت جميع اختبارات P5.9 وأعتمد المرحلة الخامسة».

P5.1–P5.9 are CLOSED and Phase 5 is accepted at **v0.5.0**. Final pre-acceptance
automated evidence is CI #451 and CI #455, both SUCCESS. See
`docs/PHASE_5_ACCEPTANCE.md`.

Phase 6 remains **NOT STARTED** and requires a separate explicit start.

## Explicitly not implemented yet

- Phase 6 route drawing, multi-stop state, ruler, distance, perimeter or area.
- Road/flight routing without a dedicated data provider.
- Astronomy/time engine or timeline.
- Shared cross-model layer-state service.
- Automatic conversion of Gleason `normalized-radius` to metres/kilometres.
- Verified distributable standalone historical Gleason scan/control points.

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
- `docs/PHASE_5_P5_7_REPORT.md` — latest closed Phase 5 slice.
- `docs/NAVIGATION_MEASUREMENT_REQUIREMENTS.md` — P5.6/Phase 6 boundary.
- `docs/GITHUB_SYNC_AUDIT_2026-09-19.md` — GitHub/documentation/data audit.
- `CHANGELOG.md` — chronological implementation/acceptance history.

Historical phase reports under `docs/` are evidence artifacts and are
intentionally not rewritten to pretend they were authored at the current state.

## Historical scan limitation

The affine/georeferencing engine is implemented, but no verified distributable
standalone historical map scan is embedded and `control_points` remains empty.
Do not fabricate control points or claim that the source printed the modern
analytic reconstruction used by the software.

## Release / merge boundary

PR #9 was explicitly authorized by the owner and has been **merged into `main`**.
This merge does **not** authorize a tag, GitHub Release, deployment, Phase 5 final
acceptance, or starting P5.8. Those remain separate project steps.
