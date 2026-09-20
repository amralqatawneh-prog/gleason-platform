# Phase 6 / P6.2 Report — Ordered Route State

Date: 2026-09-20  
Status: **IN PROGRESS — AUTOMATED VERIFICATION PENDING**

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
- remove point;
- move point up/down;
- undo;
- clear route;
- explicit error dismissal.

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
- ordered segment identity;
- reorder + undo;
- remove + undo;
- clear + undo;
- Arabic/mobile layout;
- reload confirms route state is transient.

## Manual checklist after automated gates are green

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

## Current status

Automated verification has not yet been recorded on this report.
P6.2 remains **IN PROGRESS**. P6.3 remains **NOT STARTED**.
