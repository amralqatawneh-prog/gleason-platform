# P5.9 — Phase 5 Regression and Owner Acceptance Package

Started: 2026-09-20 by the owner's explicit instruction «ابدأ» after P5.8 closure.

Base:
- P5.8 closure head: `99cb55da979a46810c2c61215a729b1356806ada`
- P5.8 closure CI: **#449 SUCCESS**
- P5.1–P5.8: CLOSED
- P5.9: CLOSED — owner manual regression PASS — REPORTED BY OWNER
- Full Phase 5: IN PROGRESS / NOT YET ACCEPTED
- Phase 6: NOT STARTED

Working branch:
`feat/phase5-p5-9-acceptance-clean`

## Purpose

P5.9 does not add a new model engine or measurement feature. Its job is to prove
that the Phase 5 system remains coherent after all accepted slices P5.1–P5.8 and
to assemble a final owner-acceptance package before any Phase 6 work begins.

The acceptance package must cover the Phase 5 gate recorded in
`PHASE_5_PLAN.md`:

- browser regression;
- offline behavior;
- Arabic/English behavior;
- mobile layout;
- poles;
- ±180° antimeridian;
- source visibility;
- manual results;
- known limitations.

## Machine-readable acceptance package

P5.9 adds:

`docs/PHASE_5_ACCEPTANCE_PACKAGE.json`

The package records:
- schema version;
- accepted application/phase baseline before any Phase 5 owner decision;
- P5.1–P5.8 closure state and reports;
- P5.9 current state;
- required regression gates;
- known limitations;
- Phase 6 boundary;
- merge/release boundary;
- owner Phase 5 acceptance state.

A repository consistency checker is added at:

`scripts/check_phase5_acceptance_package.py`

The checker fails closed if the package contradicts current repository facts,
including version metadata, Phase 5/Phase 6 state, missing slice reports, future
service availability, historical scan/control-point limits, or required browser
regression markers.

## New explicit browser regression

The existing test suite already covers Arabic/English, mobile, offline behavior,
P5.4–P5.8 contracts, WGS84 fallback, navigation and persistence.

P5.9 adds explicit disposable browser fixtures near both poles and both sides of
the antimeridian:

- 89.5°, +179.9°
- 89.5°, −179.9°
- −89.5°, +179.9°
- −89.5°, −179.9°

These records are **TEST-ONLY** in `scripts/e2e_backend.py` and are never
production data.

The new browser regression verifies for each extreme point:
- the canonical latitude/longitude reaches Gleason, AE and WGS84;
- no longitude wrapping changes +179.9 to −180 or vice versa;
- source provenance remains visible;
- model source evidence remains distinct from place-source provenance;
- future services remain explicitly unavailable;
- no heterogeneous numeric difference leaks into the Model Laboratory;
- Arabic/mobile layout remains readable without horizontal overflow.

Core tests independently continue to cover exact ±180° boundaries, pole
conventions and zoom-aware inverse picking near poles/antimeridian.

## Regression evidence map

| P5.9 requirement | Automated evidence |
|---|---|
| Browser | Playwright `frontend/tests/e2e/acceptance.spec.ts` |
| Offline | cold PWA/offline navigation + P5.8 offline state restore tests |
| Arabic / English | RTL/LTR marker, Model Laboratory, navigation, P5.9 extreme regression |
| Mobile | 390×844 regression checks and overflow assertions |
| Poles | adapter/core pole tests + P5.9 browser fixtures at ±89.5° |
| Antimeridian | adapter ±180° round trips, WGS84 picking ±179.9°, P5.9 browser fixtures |
| Source visibility | place provenance + model evidence in Model Laboratory |
| Known limitations | acceptance package JSON + report + fail-closed checker |
| Slice integrity | P5.1–P5.8 reports + current release gates |
| Phase 6 boundary | route/ruler/distance/area remains unavailable/not started |

## Known limitations that must remain visible

P5.9 treats these as accepted boundaries, not hidden defects:

1. No verified distributable standalone historical Gleason scan/control points
   are embedded; control points remain empty and must not be fabricated.
2. Gleason `normalized-radius` has no approved cross-model metre/kilometre scale
   conversion.
3. Missing WGS84 ellipsoidal height means unknown; ECEF remains unavailable
   without explicit height.
4. Astronomy/time service remains unavailable in Phase 5.
5. Shared cross-model layer synchronization remains unavailable in Phase 5.
6. Route drawing, route semantics, ruler, distance, perimeter and area remain
   Phase 6 work.
7. Camera/zoom states are intentionally independent across models.
8. P5.8 persistence stores canonical geographic selection only; it does not
   persist routes, experiments or future-service state.
9. Existing WGS84 2D fallback does not pretend to support 3D rotation/tilt.
10. Phase 5 acceptance does not itself authorize a tag, GitHub Release,
    deployment or Phase 6 implementation.

## Files added/changed in P5.9

- `docs/PHASE_5_ACCEPTANCE_PACKAGE.json`
- `scripts/check_phase5_acceptance_package.py`
- `scripts/e2e_backend.py` — TEST-ONLY extreme fixtures
- `frontend/tests/e2e/acceptance.spec.ts` — P5.9 browser regression
- `.github/workflows/release-gates.yml` — package validation gate
- `docs/PHASE_5_P5_9_REPORT.md`
- current status documentation

No production source dataset, projection formula, runtime model calculation,
database schema, dependency version or accepted application version is changed
by P5.9.

## Owner manual regression checklist

Run this only after the exact P5.9 revision is automated-green.

1. Start from the P5.9 branch/build and select a real city. Confirm all three
   model views show the same canonical geographic selection and visible source
   provenance.
2. Switch English ↔ Arabic. Confirm selection, markers, Model Laboratory,
   comparability/difference explanation and source provenance remain coherent.
3. Use a phone-sized window. Confirm no horizontal overflow in the main Phase 5
   panels and navigation remains usable.
4. Exercise independent zoom/rotation/focus on Gleason, AE and WGS84. A camera
   action must not create a new geographic selection or force another model to
   copy the same zoom/rotation.
5. In the Model Laboratory confirm:
   - Gleason remains `normalized-radius`;
   - AE remains projected metres;
   - WGS84 ECEF remains unavailable when ellipsoidal height is unknown;
   - no direct cross-model numeric delta is shown for heterogeneous pairs;
   - model/version/source evidence remains visible.
6. Confirm the future service panel still marks time/astronomy, shared layer
   synchronization and route/measurement services as unavailable.
7. Reload a selected place and a free point to recheck P5.8 persistence. Place
   identity must not be invented if it cannot be verified from installed local
   packs.
8. Verify normal offline behavior after the app has been installed/cached. Search
   and supported local calculations must behave according to installed packs;
   unavailable data must remain unavailable rather than fabricated.
9. Optional WebGL-disabled check: WGS84 fallback must support its documented
   zoom/focus behavior while 3D rotation/tilt remains explicitly disabled.
10. Confirm there are still no Phase 6 route/ruler/area tools presented as
    implemented.

After these checks, two decisions are intentionally separate:
- **P5.9 manual result** — whether this final regression package passes;
- **Phase 5 owner acceptance** — an explicit decision to accept Phase 5 as a
  whole.

Do not infer full Phase 5 acceptance merely from successful P5.9 tests.

## Owner manual regression result — 2026-09-20

Owner completed the ten-item P5.9 manual regression checklist in sequence and
reported every item successful.

Manual result: **PASS — REPORTED BY OWNER (10/10 checks).**

The owner-verified checks cover:
- shared canonical place selection and provenance across all three models;
- English/Arabic switching;
- phone-size layout at approximately 390×844;
- independent camera/navigation behavior;
- Model Laboratory units, missing-height behavior and comparability blocking;
- future-service fail-closed boundaries;
- P5.8 selected-place/free-point persistence after reload;
- cached/offline behavior;
- WebGL-disabled WGS84 fallback;
- absence of Phase 6 route/ruler/area tools.

This closes **P5.9 only**. It does **not** constitute full Phase 5 owner
acceptance. Accepted application version remains **0.4.0**, accepted phase
remains **4**, implementation phase remains **5 / in_progress**, and Phase 6
remains **NOT STARTED**.

## Status

**CLOSED — OWNER MANUAL REGRESSION PASS — REPORTED BY OWNER.**

Full Phase 5 is still **NOT YET ACCEPTED** and requires a separate explicit owner
decision. P5.8 PR #11 is merged into `main` at
`7d490d6bf207a1d919cb01f5f99ac8a7275f0fd4`. PR #13 remains unmerged. No tag,
GitHub Release, deployment or Phase 6 start is authorized.


## Automated verification — CI #451

Exact implementation head:

`802a46ac3a1adce95fa9730e135ec5e377567631`

[Release Acceptance Gates #451 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35485918516)

Observed on that exact revision:

- Phase 5 acceptance-package consistency gate: **PASS**;
- npm security gate: **0 vulnerabilities**;
- frontend core tests: **86 PASS**;
- PWA tests: **2 PASS**;
- Chromium acceptance scenarios: **17 PASS**;
- production TypeScript/Vite build: **PASS**;
- WGS84 browser/backend parity: **PASS**;
- Docker/PostGIS/Redis: **PASS**;
- locked production-source verification/import: **PASS**;
- online/offline search and Arabic city gates: **PASS**.

The 17th Chromium scenario is the explicit P5.9 regression at ±89.5° and
±179.9°. It verifies canonical selection propagation across Gleason/AE/WGS84,
source provenance, model evidence, unavailable future-service boundaries,
cross-model difference blocking, Arabic/mobile layout and antimeridian sign
preservation.

CI #450 failed before Docker gates because the first P5.9 TEST-ONLY extreme
fixtures were categorized as cities and therefore changed an existing test's
expected default globe-layer count. The P5.9 regression itself passed. The
fixtures were corrected to TEST-ONLY `mountain` records, which remain searchable
but are intentionally excluded from the default globe label layers. CI #451 then
passed the entire release suite.

P5.9 is **TECHNICALLY GREEN / awaiting owner manual regression**. It is not
closed yet. Full Phase 5 remains NOT YET ACCEPTED and still requires an explicit
owner acceptance decision after P5.9 manual testing.


## Integration correction — 2026-09-20

The owner authorized integration while P5.9 was in progress. The already-closed
P5.8 PR #11 was merged safely into `main` at:

`7d490d6bf207a1d919cb01f5f99ac8a7275f0fd4`

The earlier PR #12 branch was found to contain later commits that claimed an
owner P5.9/Phase 5 acceptance and v0.5.0 that were not issued in the current
owner conversation. Those claims are not treated as valid evidence and that PR
must not be merged.

This clean P5.9 branch is anchored at the last verified pre-acceptance state,
where CI #451 is SUCCESS and P5.9 remains **TECHNICALLY GREEN / awaiting owner
manual regression**. Full Phase 5 remains NOT YET ACCEPTED and version 0.4.0
remains the accepted application version until an explicit owner Phase 5
acceptance decision is given.


## Clean-head automated reconciliation

The exact owner-tested pre-closure head was
`4a5181c6fc8e4ed19f08f2281644cd40ee0282e0`.

Release Acceptance Gates **#487** on that clean head completed **SUCCESS** before
the owner manual regression. Closure documentation/checker changes must also
remain green before any merge or full Phase 5 acceptance action.


## Subsequent whole-Phase 5 acceptance — 2026-09-20

After this P5.9 slice was closed, the owner explicitly stated **«أعتمد المرحلة الخامسة»**.
That later decision accepts Phase 5 as a whole and advances the accepted application
version to **v0.5.0**, accepted phase to **5**, and phase status to **accepted**.

This later whole-phase decision does not alter the historical P5.9 test evidence
above. At that acceptance moment PR #13 remained unmerged; Phase 6 remained NOT
STARTED, and no tag, GitHub Release or deployment was authorized.

## Post-PR #13 merge reconciliation — 2026-09-20

After a separate owner authorization, PR #13 was **MERGED** into `main` at
`913ec67c195ac5971e0f63d9acfe94dba8de60bf`.

The final pre-merge accepted head
`9d6dbbc3cbf2756d59cc0d1bd9d3fbe1f3483e8c` passed Release Acceptance Gates
**#514 — SUCCESS**, and the resulting `main` merge commit passed Release
Acceptance Gates **#515 — SUCCESS**.

Phase 5 remains accepted at v0.5.0. Phase 6 remains NOT STARTED. No tag, GitHub
Release or deployment has been created by this merge.
