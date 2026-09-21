# Phase 6 — P6.6 Polygon / Perimeter / Area Closure Report

Date: 2026-09-21  
Status: **PRIOR CLOSURE SUPERSEDED — REOPENED IN PROGRESS AFTER OWNER-APPROVED SOURCE AUDIT**  
PR: **#31 — P6.6 Polygon / Perimeter / Area**  
Branch: `feat/p6.6-polygon-perimeter-area`  
Start baseline: `main @ 1c64285b92c093365b74f3256aa9557b9a48268e`  
Owner start instruction: **«ادمج PR #30 وابدأ P6.6»**

## Scope delivered

P6.6 implements one canonical ordered geographic polygon with independent
measurement identities in all three engines:

- WGS84: closed geodesic perimeter + signed/absolute ellipsoidal area;
- AE: closed Euclidean projected-plane perimeter + signed/absolute shoelace area;
- Gleason: closed Euclidean normalized-plane perimeter + signed/absolute
  shoelace area in native normalized units.

The same ordered geographic vertices are reused, but computation spaces, units,
scale bases and provenance remain independent.

## Polygon semantics

The contract is recorded in
`docs/PHASE_6_P6_6_POLYGON_SEMANTICS.md`.

Key closure rules:

- 3–50 explicit ordered vertices;
- closure is implicit from last vertex to first;
- explicit repeated geographic coordinates are rejected;
- zero/degenerate method-native area fails closed;
- self-intersection uses algebraic signed-area semantics;
- positive signed area = counterclockwise; negative = clockwise;
- primary area is the absolute signed area;
- no cross-model area normalization;
- no Gleason normalized-unit → SI conversion without a separate documented scale rule.

## Automated evidence before owner manual verification

Owner-tested head:

`4cb8c04b40fbea35745f4091a4bf5e849c34b299`

Release Acceptance Gates:

**#769 — SUCCESS**

The complete gates included:

- permanent repository/source-policy checks;
- Phase 5 machine-readable regression checker;
- backend tests;
- frontend core tests;
- browser WGS84 parity;
- browser/backend Gleason distance parity;
- P6.6 three-engine polygon parity;
- service worker validation;
- production build and PWA/offline pack;
- Chromium browser acceptance;
- Docker Compose/runtime;
- WGS84/AE/Gleason polygon API checks;
- PostGIS/source/search/Redis regressions.

P6.6 polygon parity covered **104 deterministic polygon cases**, including
antimeridian and polar fixtures. The browser acceptance suite passed **23/23**
tests, including the P6.6 three-engine polygon UI scenario. Frontend core passed
**129/129** tests.

## Owner manual checklist

All results below are **PASS — REPORTED BY OWNER**.

1. **Basic three-vertex polygon**
   - new polygon panel visible;
   - implicit last→first closure;
   - numeric WGS84, AE and Gleason results;
   - independent units preserved.

2. **Reverse vertex order**
   - perimeter invariant;
   - primary area invariant;
   - signed area sign flips;
   - clockwise/counterclockwise orientation flips.

3. **Live add/reorder/remove**
   - adding a fourth vertex recalculates immediately;
   - reordering recalculates according to the new ring;
   - removing it returns to the three-vertex result;
   - no page reload required.

4. **Explicit repeated closure rejected**
   - A → B → C is valid;
   - adding the first coordinate again as a fourth explicit vertex fails closed;
   - removing the duplicate restores the valid result.

5. **Backend-stop browser fallback**
   - WGS84, AE and Gleason polygon calculations continue locally;
   - method/unit identities remain unchanged;
   - normal operation resumes after backend restart.

6. **Minimum-vertex / stale-result handling**
   - dropping from three vertices to two immediately removes numeric polygon results;
   - no stale perimeter/area values remain;
   - adding a valid third vertex recalculates;
   - clearing the route returns to the empty state.

Manual result: **6/6 PASS — REPORTED BY OWNER**.

## Closure boundaries

P6.6 is closed as a Phase 6 slice. This does **not**:

- accept Phase 6 as a whole;
- start P6.7A or P6.7B;
- create a tag or GitHub Release;
- deploy the application;
- introduce RouteProvider navigation;
- introduce runtime astronomy/Saros/eclipse features.

PR #31 remains unmerged until separate explicit owner merge authorization.

The closure-state head must pass the complete Release Acceptance Gates before
PR #31 can be considered a verified merge candidate. That final workflow
evidence is recorded on the PR without creating a separate reconciliation PR.


## Post-closure source audit amendment — 2026-09-21

After the closure above, the owner supplied two videos demonstrating Gleason
map-ruler and frame usage and requested a second-by-second comparison against
the primary book. The owner then approved all proposed corrections:

**«موافق على جميع مقترحاتك، تستطيع البدء»**

The earlier 6/6 manual result and #771 verification remain valid evidence for
the previous contract, but they no longer close the amended Gleason measurement
semantics.

P6.6 is therefore reopened on the same PR #31. The amendment separates
`gleason-map-ruler-derived`, `gleason-historical-longitude-scale` and
`gleason-frame-time-calculator`.

Audit:
`docs/GLEASON_MEASUREMENT_VIDEO_BOOK_AUDIT_2026-09-21.md`.

A new automated run and targeted owner manual verification are required before
P6.6 can close again.
