# Phase 4 approved corrections — verification report

Date: 2026-09-18. Uploaded code revision: `9dfb1e0bada56768e1a7429ed5f9eec24c130f3b` (M1–M6). Validated snapshot: `fb4dcab447ddbb94924df46576ab9f52f64e6c22`, which adds M7/M8 documentation. Subsequent evidence/handoff changes are documentation only.

**Status: implemented, uploaded and automatically verified. Release Acceptance Gates #186 passed, including all six browser tests and Docker/production-source gates. Owner/device review remains NOT RUN; Phase 4 is not accepted.**

## Approval and scope

The owner approved M1–M8 and subsequently explicitly authorized uploading the seven commits to `amralqatawneh-prog/gleason-platform`, branch `feat/phase4-wgs84-reference`, and running CI without merge or release. M1–M6 are implemented, M7 reconciles the roadmap, M8 is scheduled future work. No Phase 5 implementation, v0.4.0 release, merge or tag was performed. See `APPROVED_CORRECTIONS_2026-09-18.md` for the per-slice change record and `ROADMAP_CURRENT.md` for all future phases.

## Results actually obtained

Local environment: Python **3.12.14**, Node **24.19.0**, uv **0.12.15**. CI #186 actually used Python **3.13.15**, Node **22.23.2**, npm **10.9.8**, uv **0.12.15**, and Chromium **153.0.8010.12** on Ubuntu **24.04.5**. Frontend and backend installs used their committed dependency locks. CI reran the unit, parity, build and PWA checks successfully.

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
| New E2E suite discovery/types | PASS | 6 tests discovered and TypeScript checked; runtime evidence is separate below |
| Live HTTP smoke | PASS | Actual FastAPI + disposable TEST-ONLY SQLite server; health, source metadata, packs and geodesic |
| New browser runtime | PASS, 6 tests | Chromium, real FastAPI routes, production frontend; 27.8 s in CI #186 |
| New Docker/PostGIS/Redis/import/CLI gates | PASS | Compose build/runtime, real locked sources, search, provenance and exact API/CLI pack-entry comparison in CI #186 |
| Owner/physical-device visual checks | NOT RUN | Historical owner PASS is not claimed for this revision |

Parity maxima measured by `scripts/check_reference_parity.py`:

- distance difference: `3.725290298461914e-09` metres;
- bearing difference: `2.5011104298755527e-12` degrees;
- forward ECEF difference: `0.0` metres;
- inverse latitude difference: `7.986500349943526e-12` degrees;
- inverse ellipsoidal height difference: `8.903443813323975e-07` metres.

These are agreement measurements for the specified cases, not claims of real-world coordinate accuracy. The live HTTP check used `(25.285447, 51.531040)` to `(31.9454, 35.9284)` and obtained **1,692,601.7350098162 m**. TEST-ONLY catalog records were never imported into a production database.

## Remote acceptance evidence

[Release Acceptance Gates #186](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35387031277), job `105736221437`, completed with **SUCCESS** for snapshot `fb4dcab447ddbb94924df46576ab9f52f64e6c22`. All required steps succeeded; the conditional failure-log step was correctly skipped. No source-code fixes were needed after this run.

All six browser scenarios passed: first production install and a new offline page with both test servers stopped; off-center marker picking/rotation/back visibility; phone controls and keyboard/persisted settings; immediate globe refresh after installing a region; rejection of stale A/B responses; and WebGL-disabled fallback.

The browser server uses real application routes with a disposable synthetic SQLite catalog. The delayed-response test intercepts timing but forwards the real backend result. Separate production-data steps imported locked Natural Earth/OurAirports sources into PostGIS, verified source hashes and provenance, and compared API/CLI pack entries exactly. Verified counts: **177 countries, 243 cities, 16 seas, 7 oceans, 12 rivers, 632 mountains and 86,089 airports**. Core-world contained **1,087 entries**; the Qatar region pack contained **25 entries**. English/Arabic search, DOH source classification, Redis and frontend Docker HTTP checks passed.

Browser evidence artifact: `phase4-browser-evidence`, ID `10564377467`, **1,247,624 bytes**, SHA-256 `e656e22b7afb99e7d7773e87daf007da0c75952960a63f20d17855985f321860`. CI retained the Playwright report and screenshots. The local download returned HTTP 403, so **manual screenshot review was NOT RUN**. This does not replace the successful browser assertions or owner/device review. Artifacts have finite retention; their metadata and run are identified here for traceability.

CI #184 at baseline `99a3658bef7eb678df7beed157bd01ed92aaa62b` previously passed, but **does not validate these changes**: [baseline run](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35321527854).

## Upload authorization and commit traceability

An earlier automatic approval review blocked the upload for lack of explicit destination permission. The owner then answered **«نعم اسمح»** to the concrete request to upload these seven commits and run CI without merge or release. After this authorization, the normal Git push lacked CLI credentials. The connected GitHub API uploaded seven commits with **exactly matching Git trees** and advanced the existing branch with `force=false`. The original local commits remain preserved on `local/phase4-approved-preupload`; original SHAs are also recorded in uploaded commit messages. No upload occurred before this permission.

| Scope | Original local commit | Uploaded commit |
|---|---|---|
| M1 | `910c900` | `77c10ed` |
| M2 | `b03b78c` | `f01ce1b` |
| M3 | `887d388` | `596b213` |
| M4 | `074731e` | `4b3b455` |
| M5 | `888e865` | `4c1f121` |
| M6 | `59ace6b` | `9dfb1e0` |
| M7/M8 documentation | `ecb3a9e` | `fb4dcab` |

[PR #8](https://github.com/amralqatawneh-prog/gleason-platform/pull/8) remains open, draft and unmerged. The remaining gate is owner/device review of the corrected build and explicit Phase 4 acceptance. The upload permission is not phase acceptance, merge permission or release permission.

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

Sources: changed repository source/tests at the uploaded revision above, CI #186 job logs and artifact metadata, pinned package sources; [GeographicLib JS](https://github.com/geographiclib/geographiclib-js), [PROJ Cartesian conversion](https://proj.org/en/stable/operations/conversions/cart.html), [uv lock/sync](https://docs.astral.sh/uv/concepts/projects/sync/). Historical project requirements are mapped in `ROADMAP_CURRENT.md`.
