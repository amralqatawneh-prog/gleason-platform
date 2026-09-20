# P5.9 — Phase 5 Regression and Owner Acceptance Package

Started: 2026-09-20 by the owner's explicit instruction «ابدأ» after P5.8 closure.

Base:
- P5.8 closure head: `99cb55da979a46810c2c61215a729b1356806ada`
- P5.8 closure CI: **#449 SUCCESS**
- P5.1–P5.8: CLOSED
- P5.9: ACTIVE
- Full Phase 5: IN PROGRESS / NOT YET ACCEPTED
- Phase 6: NOT STARTED

Working branch:
`feat/phase5-p5-9-acceptance`

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

## Status

**CLOSED — PASS REPORTED BY OWNER.**

Full Phase 5 is ACCEPTED BY OWNER. Phase 6 remains NOT STARTED.
P5.8 PR #11 remains unmerged. No tag, GitHub Release or deployment is authorized.


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


## P5.9 and Phase 5 acceptance closure — 2026-09-20

The owner reported:

> نجحت جميع اختبارات P5.9 وأعتمد المرحلة الخامسة

Record:
- P5.9 manual regression: **PASS — REPORTED BY OWNER**;
- P5.9: **CLOSED**;
- Phase 5: **ACCEPTED BY OWNER**.

Final pre-acceptance automated evidence:
- `802a46ac3a1adce95fa9730e135ec5e377567631` — CI #451 SUCCESS;
- `cf1f3ad45b6a8da1cf7f608d8da94f275641c676` — CI #455 SUCCESS.

CI #450 remains historical failed-development evidence and is superseded by the
corrected #451/#455 runs.

Acceptance metadata is moved to application version **v0.5.0** with
`implementation_phase=5`, `accepted_phase=5` and `phase_status=accepted`.
Independent model versions remain unchanged.

Canonical acceptance record:
`docs/PHASE_5_ACCEPTANCE.md`.

Phase 6 remains **NOT STARTED** and requires an explicit owner start instruction.
PR #11 and PR #12 remain unmerged. No tag, GitHub Release or deployment has been
authorized by the acceptance decision.


## Final acceptance-metadata CI — #481

The accepted v0.5.0 metadata head
`e011857b05aed18dbf2ece679ae97bd152e95f74` passed Release Acceptance Gates
#481 in full.

Evidence includes 0 npm vulnerabilities, 86 frontend core tests, 2 PWA tests,
17 Chromium scenarios, VERSION/package/lock consistency, Phase 5 acceptance
package validation, build/parity/Docker/PostGIS/Redis/source/search gates.

P5.9 remains CLOSED and Phase 5 remains ACCEPTED BY OWNER.
