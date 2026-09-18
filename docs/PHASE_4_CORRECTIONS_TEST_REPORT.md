# Phase 4 approved corrections — verification report

Date: 2026-09-18. Code revision: `59ace6b` (M1–M6). Subsequent roadmap/handoff commits are documentation only.

**Status: implemented and locally verified; new remote browser/Docker gates pending explicit push permission. Phase 4 is not accepted.**

## Approval and scope

The owner approved M1–M8. M1–M6 are implemented locally, M7 reconciles the roadmap, M8 is scheduled future work. No Phase 5 implementation, v0.4.0 release, merge or tag was performed. See `APPROVED_CORRECTIONS_2026-09-18.md` for the per-slice change record and `ROADMAP_CURRENT.md` for all future phases.

## Results actually obtained

Environment: Python **3.12.14**, Node **24.19.0**, uv **0.12.15**. New CI is configured for Python **3.13** and Node **22**; those combinations still require the new run. Frontend and backend installs used their committed dependency locks.

| Check | Result | Evidence/limit |
|---|---|---|
| Backend unit/API/regression | PASS, 49 tests | `uv run --project backend --locked --extra dev pytest backend/tests -q` |
| Frontend core/regression | PASS, 40 tests | `npm run test:core`; includes offline WGS84, picking and provenance |
| Off-center picking | PASS | >900 visible-point round trips across rotations/aspect ratios; independent PROJ anchor and old outer-ring regression |
| WGS84 browser/backend parity | PASS | 1,082 geodesics and 27 geodetic/ECEF round trips |
| Generated production PWA | PASS, 2 tests | Real emitted asset manifest; synthetic cache/network worker harness, **not browser execution** |
| Production build / worker syntax | PASS | TypeScript, Vite, `check:sw` |
| Release metadata | PASS | VERSION, backend/frontend packages and npm lock agree at 0.3.0; API consistency covered |
| Dependency security | PASS | `npm audit --audit-level=high`: 0 vulnerabilities at execution time |
| New E2E suite discovery/types | PASS | 6 tests discovered and TypeScript checked; does not establish runtime PASS |
| Live HTTP smoke | PASS | Actual FastAPI + disposable TEST-ONLY SQLite server; health, source metadata, packs and geodesic |
| New browser runtime | NOT RUN | Prepared Chromium CI suite; push blocked before workflow could run |
| New Docker/PostGIS/Redis/import/CLI gates | NOT RUN | No local Docker runtime; CI pending push |
| Owner/physical-device visual checks | NOT RUN | Historical owner PASS is not claimed for this revision |

Parity maxima measured by `scripts/check_reference_parity.py`:

- distance difference: `3.725290298461914e-09` metres;
- bearing difference: `2.5011104298755527e-12` degrees;
- forward ECEF difference: `0.0` metres;
- inverse latitude difference: `7.986500349943526e-12` degrees;
- inverse ellipsoidal height difference: `8.903443813323975e-07` metres.

These are agreement measurements for the specified cases, not claims of real-world coordinate accuracy. The live HTTP check used `(25.285447, 51.531040)` to `(31.9454, 35.9284)` and obtained **1,692,601.7350098162 m**. TEST-ONLY catalog records were never imported into a production database.

## What the pending CI will prove

The six browser scenarios cover: first production install and a new offline page with both test servers stopped; off-center marker picking/rotation/back visibility; phone controls and keyboard/persisted settings; immediate globe refresh after installing a region; rejection of stale A/B responses; and WebGL-disabled fallback.

The server uses real application routes with a disposable synthetic SQLite catalog. The delayed-response test intercepts timing but forwards the real backend result. The separate production-data job imports locked Natural Earth/OurAirports sources into PostGIS, checks counts/provenance, and compares API/CLI pack entries exactly.

CI #184 at baseline `99a3658bef7eb678df7beed157bd01ed92aaa62b` previously passed, but **does not validate these changes**: [baseline run](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35321527854).

## Push block and next action

Automatic approval review rejected `git push origin feat/phase4-wgs84-reference`, stating that it would send private repository code/tests/docs to GitHub without explicit permission for that destination. The action was not retried or bypassed. Read-only PR inspection confirmed that remote PR #8 still has head `99a3658bef7eb678df7beed157bd01ed92aaa62b` and is open/draft/unmerged.

The concrete pending action is a normal non-force push of the local correction/documentation commits to **amralqatawneh-prog/gleason-platform**, branch **feat/phase4-wgs84-reference**. It does not merge or publish a release. After permission, run the new workflow, fix any actual failures and record its exact head/run before Phase 4 acceptance.

## Manual checklist after the corrected build is available

1. Search for a known place, select it, rotate the globe and verify that its marker moves with geography and hides on the back. Select several off-center points and verify coordinates. Retain right-drag → left-rotation behaviour.
2. At phone width, expand/collapse the layer panel; toggle cities/airports with touch and keyboard; confirm readable labels and persisted settings after reopening.
3. Save a country pack while the globe is open; enable airports and confirm new features appear without a reload. Compare source ID, record ID, version/classification in online and offline selections.
4. Finish one successful production install, close old tabs to activate an update, then disable the network and stop the backend. Reopen the app and calculate A→B and A→A; A→A has zero distance and undefined/null bearings.
5. Capture a different A or B while a previous calculation is pending; the old result must not reappear. Verify Arabic/English and the WebGL-disabled fallback.
6. Record actual PASS/FAIL or NOT RUN per browser/device. An unperformed check is not an owner waiver.

## Remaining limits

- The production JavaScript chunk remains about **792 kB** before gzip (**251 kB** compressed); Vite warns above 500 kB. M8 tracks measured splitting/performance, GPU resource reuse and context recovery. No FPS claims were made.
- Backend test tooling emits upstream deprecation warnings (Starlette/httpx and AnyIO). They did not fail this run; dependency locks now make the environment reproducible.
- Local ECEF inverse rejects inputs within 1 m of the geocentre as undefined. Regional content requires a previously saved pack; offline computation does not supply missing place/astronomy data.
- No full browser/device matrix or native mobile release is claimed. Current charts/geometry remain the implemented Phase 4 baseline, not a Cesium terrain/3D Tiles engine.

Sources: changed repository source/tests at the local code revision above; pinned package sources; [GeographicLib JS](https://github.com/geographiclib/geographiclib-js), [PROJ Cartesian conversion](https://proj.org/en/stable/operations/conversions/cart.html), [uv lock/sync](https://docs.astral.sh/uv/concepts/projects/sync/). Historical project requirements are mapped in `ROADMAP_CURRENT.md`.
