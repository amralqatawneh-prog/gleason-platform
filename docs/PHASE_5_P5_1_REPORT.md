# P5.1 — shared geographic selection

Date: 2026-09-19. Owner start instruction: **«ابدأ المرحله الخامسة»**.
Branch: `feat/phase5-shared-state`, based on accepted Phase 4 `1e46b8c`.
Status: implementation and automated verification COMPLETE. Owner manual checks remain NOT RUN. Phase 5 is not accepted.

Uploaded implementation: `e64d2234246d876c208c4d1cda87672a6945d4be`, identical tree `a421e855bd64751164b33198a72ae9ae312c24d5` to local `224746cadb7add21ca38848c6484074e6afb6c86`. Owner explicitly authorized upload and CI on 2026-09-19: «نعم اسمح بذلك».

[CI #192](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35414383012) — SUCCESS on that implementation snapshot; job `105819999431`. [PR #9](https://github.com/amralqatawneh-prog/gleason-platform/pull/9) is draft/open/unmerged. Its diff includes the unmerged Phase 4 baseline (PR #8); no merge or release was performed. Later documentation commits have their own checks; this run is evidence for the exact implementation SHA above.

## Implemented behavior

The application previously stored a geographic point and a searched place in
separate React states. A Gleason/AE pick could replace the point while leaving
the old place's provenance visible. P5.1 replaces these with one immutable,
versioned `GeographicSelection` discriminated union.

Search preserves canonical identity, Arabic/English names, source record/version,
license/URL, coordinate classification and online/offline origin. Free selection
from any model has `place: null`, including at coincident coordinates. Missing
legacy provenance remains unknown. Optional height is explicitly ellipsoidal
metres, never assumed zero. The contract rejects invalid/nonfinite coordinates;
it does not silently wrap longitude or convert screen coordinates.

WGS84 search focus previously called the same callback as a user click. Applying
focus now updates only the local globe view; the parent already owns the search
selection. This avoids relabeling a searched place as a free point. Independent
projection maps still do not share markers/cameras; that is P5.3/P5.6.

## Changed files and functions

| File | Change |
|---|---|
| `frontend/src/comparison/geographicSelection.ts` | Typed contract; `selectPlace`, `selectFreePoint`, coordinate validation and immutable copies |
| `frontend/src/App.tsx` | Single selection state; derived place metadata; search/map handlers; current Phase 5 footer |
| `frontend/src/reference/ReferenceGlobe.tsx` | Remove callback echo from parent focus effect |
| `frontend/src/map2d/ProjectionMap.tsx` | Reject out-of-domain inverse selections before delivery |
| `frontend/tests/geographic-selection.test.mjs` | Seven contract tests with explicitly synthetic source fixtures |
| `frontend/tests/e2e/acceptance.spec.ts` | Search-to-free-selection regression across three models and language switch |
| `frontend/tsconfig.core.json` | Compile the new contract for core tests |
| `backend/app/version.py`, `backend/tests/test_api.py` | Implementation phase 5, accepted phase 4, in_progress; synchronization remains false |
| `.github/workflows/release-gates.yml` | Include the Phase 5 branch in existing push gates; update job description |
| `docs/PHASE_5_PLAN.md`, current handoff/roadmap, README, CHANGELOG | Record explicit start, supersede historical hold, scope the slice and next work |

## Verification

| Check | Actual result |
|---|---|
| Backend pytest | PASS — 49 tests |
| Frontend core | PASS — 47 tests (40 existing + 7 new) |
| TypeScript and production build | PASS |
| Production PWA tests | PASS — 2 tests |
| Service worker syntax | PASS |
| Release metadata consistency | PASS — package metadata remains accepted 0.4.0 |
| Chromium browser suite | PASS in CI #192 — all 7 scenarios, 33.7 seconds. Local execution remains unavailable after Chromium CDN timeouts; remote execution resolves the verification blocker |
| Owner manual checks | NOT RUN on this revision |
| Remote CI / Docker production-source gates | PASS in CI #192 — Docker stack, projection/reference APIs, PostGIS catalog, locked real imports, search, API/CLI offline packs, Redis and frontend HTTP |
| Independent WGS84 numerical parity / npm security | PASS in CI #192; npm reported zero vulnerabilities |

Existing warnings: large JS bundle (793.16 kB, 251.36 kB gzip), FastAPI/httpx
and anyio deprecations. No third-party dependency or lockfile changes.

## Reproduction and owner checklist

The new branch is available on GitHub. Use an explicit fetch refspec, including
in checkouts originally configured to fetch only the Phase 4 branch:

```bash
git remote set-branches --add origin feat/phase5-shared-state
git fetch origin
git switch feat/phase5-shared-state
git pull --ff-only origin feat/phase5-shared-state
docker compose up --build -d
docker compose ps
```

Open `http://127.0.0.1:8080`. Let the online PWA update install, close all old app
tabs/windows, then reopen. Do not remove Docker volumes.

Manual results below are **NOT RUN**, and are not inherited from Phase 4:

1. Search an imported place. Check its name, ID, source/version, classification
   and coordinate values remain visible after WGS84 focuses it.
2. Click a free point on Gleason, then repeat from a fresh search on AE and WGS84.
   Confirm the inspector updates and removes the previous place provenance and
   search highlight. A free pick must not claim to be the named place.
3. Switch Arabic/English; confirm selection and source identity stay coherent.
4. With an installed search pack, repeat without network. Unknown legacy source
   fields must stay unknown; new packs retain their recorded provenance.
5. Confirm WGS84 A/B distance calculation and globe interaction still work;
   projection picks do not silently become WGS84 geodesic captures in this slice.
6. Verify phone layout and WebGL-disabled fallback. Phase 5 synchronization of
   all markers is not expected yet.

Automated reproduction:

```bash
cd backend
.venv/bin/python -m pytest -q
cd ../frontend
npm run test:core
npm run build
npm run test:pwa
npm run check:sw
npx playwright install chromium
npm run test:e2e
```

## Completion and next boundary

P5.1 coding scope and automated gates: 100% complete. Owner manual acceptance is
separate and remains NOT RUN; no Phase 5 acceptance is inferred. Eight subsequent
slices remain pending; no overall project effort percentage is inferred.
Next planned slice: P5.2 independent model adapters with explicit units and domains.
No P5.2 code is included in this upload. Persistence belongs to P5.8; current selection
is in memory and is intentionally not restored on reload yet.

No new historical source interpretation, production data, measurement engine,
astronomy engine, release/tag or PR merge is included.
