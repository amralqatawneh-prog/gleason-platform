# Phase 6 / P6.1 Report — Measurement Semantics Contract

Date: 2026-09-20  
Status: **CLOSED — OWNER MANUAL PASS 5/5 REPORTED**

## Authorization and baseline

Owner instruction: **«ابدأ بتنفيذ Phase 6»**.

Baseline:
- `main @ 3e5afcd9b95766bd18af59df88c9154f51567e8c`
- Release Acceptance Gates #517: **SUCCESS**
- accepted application version: **v0.5.0**
- accepted phase: **5**
- implementation phase: **6 / in_progress**

Working branch:
`feat/phase6-p6-1-measurement-semantics`

Draft PR:
**#15 — Phase 6 / P6.1: measurement semantics contract**

## Delivered P6.1 scope

### 1. Explicit measurement endpoint contract

Added `frontend/src/measurement/contracts.ts`.

A measurement endpoint contains only:
- versioned contract identity;
- explicit endpoint ID;
- WGS84 geographic reference frame;
- degrees;
- canonical geographic point;
- place/free-point identity;
- source model of the user selection;
- place identity/provenance when applicable.

Screen pixels, map X/Y and projected coordinates cannot enter the endpoint
contract through the constructor.

Unknown ellipsoidal height stays absent; it is not changed to zero.

### 2. Country ambiguity is fail-closed

A Phase 3 `country` place record is rejected as an implicit point-to-point
measurement endpoint.

P6.1 does not guess:
- country centroid;
- capital;
- boundary nearest point;
- boundary-to-boundary distance.

Those require an explicit later operation/selection.

### 3. Versioned measurement methods

Defined three distinct method contracts:

- `wgs84-geodesic`
  - calculation model: WGS84
  - reference semantics
  - metre / square-metre
  - scale basis: WGS84 ellipsoid

- `ae-projected-plane`
  - calculation model: independent AE visualization
  - projected-plane semantics
  - metre / square-metre
  - scale basis: AE projected plane

- `gleason-native-normalized`
  - calculation model: Gleason derived reconstruction
  - computed-result semantics
  - normalized-radius-unit / normalized-radius-unit-squared
  - scale basis: normalized model radius

All three remain `contract-only` in P6.1. No numeric result is fabricated.

### 4. Same unit does not mean same method

The contract explicitly preserves the difference between:
- WGS84 geodesic metres; and
- AE projected-plane metres.

Their calculation spaces and scale bases remain different even though both use
the SI metre unit.

### 5. No undocumented Gleason km conversion

The Gleason native contract exposes normalized units only.

It explicitly prohibits silent conversion to metres/kilometres or square SI
units without a documented scale basis or a separately labeled assumption.

### 6. Calculation identity is separate from rendering identity

Added a visualization identity contract with invariant:

> Rendering does not change who calculated the quantity or what the units mean.

Example:
a `wgs84-geodesic` computation rendered on the Gleason view remains a
**WGS84 geodesic visualized on Gleason**, not a Gleason-native measurement.

### 7. Route service remains fail-closed

The existing P5.7 route future-service contract remains:
- planned phase: `6`;
- status: `unavailable`;
- available operations: empty.

Its current boundary now states that P6.1 defines semantics only and that route
state/drawing/distance/ruler/perimeter/area remain later Phase 6 work.

### 8. Platform capability metadata

Backend capability metadata now distinguishes:
- `measurement_semantics_contract = true`
- `measurement_engine = false`
- `route_engine = false`
- `area_engine = false`

Implementation phase is 6/in_progress while accepted phase remains 5.

### 9. Phase 5 acceptance history preserved

`docs/PHASE_5_ACCEPTANCE_PACKAGE.json` now records both:
- Phase 6 was NOT STARTED at the Phase 5 acceptance moment; and
- Phase 6 is currently IN PROGRESS after explicit owner authorization.

The Phase 5 acceptance checker was updated accordingly instead of rewriting
historical acceptance evidence.

## Files added

- `frontend/src/measurement/contracts.ts`
- `frontend/tests/measurement-contract.test.mjs`
- `docs/PHASE_6_PLAN.md`
- `docs/PHASE_6_P6_1_REPORT.md`

## Files updated

- `frontend/tsconfig.core.json`
- `frontend/src/comparison/futureServices.ts`
- `backend/app/version.py`
- `backend/app/services/capabilities.py`
- `backend/tests/test_api.py`
- `docs/PHASE_5_ACCEPTANCE_PACKAGE.json`
- `scripts/check_phase5_acceptance_package.py`
- `README.md`
- `docs/NAVIGATION_MEASUREMENT_REQUIREMENTS.md`
- `docs/PROJECT_HANDOFF_CURRENT.md`
- `docs/ROADMAP_CURRENT.md`
- `CHANGELOG.md`

## Automated tests

### CI #518 — FAILED, diagnosed and corrected

Initial run #518 failed at one historical P5.7 frontend contract assertion.

Cause:
- P6.1 temporarily changed route `plannedPhase` from `"6"` to
  `"6 / P6.2+"`.
- The P5.7 regression correctly required the historical contract value
  `plannedPhase === "6"`.

Correction:
- restored `plannedPhase: "6"`;
- retained only the new P6.1 `currentBoundary`;
- no historical contract was weakened.

### CI #519 — SUCCESS

Exact implementation head:
`bc20c15eba65bed19cda932fce2a641e6dfbd96d`

Release Acceptance Gates #519: **SUCCESS**.

Passed:
- permanent repository structure;
- source / Phase 3 policy;
- Phase 5 acceptance package checker with Phase 6 current-state reconciliation;
- locked Phase 3 source hashes;
- backend tests;
- frontend dependency security gate;
- frontend core tests including P6.1 contract tests;
- WGS84 browser/backend parity;
- service worker syntax;
- production build;
- PWA/offline pack;
- Chromium acceptance regression;
- Docker Compose/runtime;
- Phase 2 and Phase 4 APIs;
- PostGIS schema/import;
- production catalog coverage/provenance;
- online/offline search;
- Arabic city search;
- Redis;
- frontend Docker HTTP.

## Manual verification

Status: **PASS — REPORTED BY OWNER (5/5)**.

The owner executed the five P6.1 manual checks sequentially and reported each
one PASS:

1. Open `/api/v1/capabilities` and confirm:
   - phase = 6
   - accepted_phase = 5
   - phase_status = `in_progress`
   - measurement_semantics_contract = true
   - measurement_engine = false
   - route_engine = false
   - area_engine = false

2. Open the application and confirm there is **no new route/ruler/area tool**
   pretending to be implemented in P6.1.

3. In Model Laboratory / future-service display, confirm route remains clearly
   **Unavailable** and the boundary explains that P6.1 is semantics-only.

4. Confirm normal place selection, free-point selection, Arabic/English switching
   and navigation continue working as before.

5. Confirm no displayed Gleason value is newly labeled in km/metres as a result
   of P6.1.

## Known boundaries

- No ordered route state yet — P6.2.
- No numeric WGS84 route/ruler engine yet — P6.3.
- No AE native numeric measurement yet — P6.4.
- No Gleason native numeric measurement yet — P6.5.
- No polygon/perimeter/area engine yet — P6.6.
- No same-route three-model rendering yet — P6.7.
- No Phase 6 acceptance/version promotion yet.
- No tag, GitHub Release, deployment or PR merge authorization.

## Closure decision

P6.1 is **CLOSED**.

Closure evidence:
1. implementation head `bc20c15eba65bed19cda932fce2a641e6dfbd96d`
   passed Release Acceptance Gates #519;
2. report/documentation head `98bb0af1dd50b55d0b81d4168cc15a69e43cc1ae`
   passed Release Acceptance Gates #520;
3. owner manual checklist: **5/5 PASS — REPORTED BY OWNER**.

P6.2 remains **NOT STARTED**. Closing P6.1 does not authorize PR #15 merge,
a tag, GitHub Release, deployment, or Phase 6 acceptance.


## Owner manual result record — 2026-09-20

- Test 1: PASS — capabilities show Phase 6 in progress while accepted phase remains 5; measurement semantics are available and measurement/route/area engines remain unavailable.
- Test 2: PASS — no premature route/ruler/area tool is exposed.
- Test 3: PASS — route future-service remains Unavailable with the P6.1 semantics-only boundary.
- Test 4: PASS — place/free-point selection, Arabic/English switching and navigation remain operational.
- Test 5: PASS — no new Gleason metres/kilometres conversion is displayed.

Result: **5/5 PASS — REPORTED BY OWNER**.
