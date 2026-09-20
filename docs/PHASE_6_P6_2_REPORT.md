# Phase 6 / P6.2 Report — Ordered Route State

Date: 2026-09-20  
Status: **TECHNICALLY GREEN — AWAITING OWNER MANUAL VERIFICATION**

## Authorization and baseline

Owner continuation instruction: **«اكمل»**.

Baseline:
- `main @ 143532248f707380b980e787051e7decc3c91086`
- PR #15: MERGED
- Release Acceptance Gates #530: **SUCCESS**
- accepted application version remains **v0.5.0**
- accepted phase remains **5**
- implementation phase remains **6 / in_progress**

Working branch:
`feat/phase6-p6-2-ordered-route-state`

## Delivered P6.2 scope

### Ordered geographic points

P6.2 adds a versioned transient route reducer:
`frontend/src/measurement/routeState.ts`.

The route is an ordered list A → B → C → … of explicit P6.1 measurement
endpoints. It stores geographic endpoint identity, never screen pixels.

The transient P6.2 limit is **50 points**. A/B/C are examples of the first
positions, not a three-point restriction.

Each point receives a monotonic in-session ID such as:
- `route-point-1`
- `route-point-2`

Point IDs are not reused after undo.

### Segment identity

Segments are derived only from adjacent point identity, for example:

`route-segment:route-point-1->route-point-2`

A P6.2 segment contains no distance/value/unit field. Numeric measurement is
deliberately excluded.

### Editing operations

Implemented:
- add current selected point;
- **direct map-add mode**: when explicitly enabled, a short pick on Gleason,
  AE or WGS84 selects that geography and appends it directly to the route;
- remove point;
- move point up/down;
- undo;
- clear route;
- explicit error dismissal.

Normal map picking remains selection-only while direct map-add mode is off, so
P6.2 does not silently change the established Phase 5 selection interaction.

No-op boundary moves and unknown removals do not create fake revisions/history.

### Country ambiguity remains fail-closed

The P6.1 endpoint rule remains active. A country record cannot silently become:
- a centroid;
- its capital;
- a nearest boundary point;
- a boundary-to-boundary measurement endpoint.

The UI reports that an explicit geographic point must be selected.

### Transient persistence boundary

P6.2 route state is session-only.

It is intentionally **not** added to the P5.8 IndexedDB key
`phase5-shared-state-v1`. Reloading the application clears the P6.2 route while
the separately supported canonical selection may still restore normally.

Durable saved routes/experiments remain Phase 17 scope.

### Bilingual UI

Added:
`frontend/src/measurement/OrderedRoutePanel.tsx`.

It exposes:
- current-point add;
- A/B/C ordered cards;
- coordinates and point/source identity;
- reorder/remove controls;
- undo/clear;
- segment identity;
- explicit “no numeric distance in P6.2” boundary;
- Arabic/English and responsive mobile behavior.

### Capability boundary

Backend capability metadata distinguishes:
- `measurement_semantics_contract = true`
- `ordered_route_state = true`
- `ordered_route_persistence = false`
- `measurement_engine = false`
- `route_engine = false`
- `area_engine = false`

The historical P5.7 route service remains fail-closed. P6.2 state does not
pretend that a provider/numeric route engine exists.

## Explicitly outside P6.2

- route line/path rendering on the three models;
- WGS84 multi-segment numeric distance;
- AE projected-plane measurement;
- Gleason normalized native measurement;
- perimeter/area;
- road/flight route providers;
- durable saved route persistence;
- Phase 6 whole-phase acceptance/version promotion.

## Automated coverage added

Core tests cover:
- A→B→C order and explicit identities;
- geographic-only endpoint data;
- unknown height remains unknown;
- country rejection without state mutation;
- remove/reorder segment rebuilding;
- no numeric quantity leakage;
- undo/clear;
- monotonic point IDs;
- no-op editing behavior.

Browser coverage exercises:
- add Doha/Amman;
- direct map-add picks from Gleason, AE and WGS84;
- more than three ordered points and explicit 50-point UI capacity;
- ordered segment identity;
- reorder + undo;
- remove + undo;
- clear + undo;
- Arabic/mobile layout;
- reload confirms route state is transient.

## Manual checklist after automated gates are green

Owner progress before the direct-map refinement:
- test 1: **PASS — REPORTED BY OWNER**;
- test 2: **PASS — REPORTED BY OWNER**;
- test 3: **PASS — REPORTED BY OWNER**.

Owner then requested direct map-point addition and explicit support for more
than three points. Those refinements are now implemented and require a targeted
retest before proceeding with the remaining checklist.

1. Confirm `/api/v1/capabilities` reports
   `ordered_route_state=true`, `ordered_route_persistence=false`, while
   `measurement_engine=false`, `route_engine=false`, `area_engine=false`.
2. Add two selected places to the Ordered Route panel; confirm A and B plus
   exactly one A→B segment and no numeric route distance.
3. Add a third point, reorder points, then remove one; confirm identities/order
   update without calculating a distance.
4. Verify Undo restores reorder/remove/clear operations and Clear empties the route.
5. Switch Arabic/English and test at mobile width; controls/order remain usable.
6. Build a route, reload the application, and confirm the route is empty after
   reload while normal Phase 5 selection persistence remains independent.

Owner results must be recorded explicitly; no manual PASS is inferred.

## Automated verification

### CI #531 — FAILED, diagnosed and corrected

The first PR run reached the browser suite after all earlier gates passed.
The new P6.2 browser scenario itself passed. One historical P5.7 assertion
failed because the updated explanatory copy contained `Phase 6` rather than
the exact historical lowercase substring `phase 6`.

Correction:
- preserve the new P6.2 explanation;
- restore the historical literal `phase 6` wording expected by P5.7;
- do not weaken or remove the old regression assertion.

### CI #532 — SUCCESS

Exact implementation head:
`9acd10b6ccbc0ae4f3565200169ff2b2ec8f38fa`

Release Acceptance Gates #532: **SUCCESS**.

Passed:
- repository/source policy;
- Phase 5/Phase 6 machine-state checker;
- locked source hashes;
- backend tests;
- dependency security gate;
- frontend core tests including all P6.2 route-state tests;
- WGS84 browser/backend parity;
- production build and PWA;
- Chromium acceptance including P6.2 add/reorder/remove/undo/clear/reload;
- Docker Compose/runtime;
- Phase 2/Phase 4 API regression;
- PostGIS schema and locked production import;
- online/offline/Arabic search;
- Redis and frontend Docker HTTP.

## Current status

P6.2 remains **IN PROGRESS** while the owner-requested direct-map refinement is
reverified. Tests 1–3 were reported PASS before the refinement; tests 4–6 remain
pending, and the new direct-map/more-than-three-points behavior requires a
targeted owner retest after the final green CI.

P6.3 remains **NOT STARTED**.
