# Phase 6 / P6.4 — AE Native Measurement Report

Status: **CLOSED — OWNER MANUAL 6/6 PASS — REPORTED BY OWNER**

Date: 2026-09-20

Owner start instruction: **«أبدأ P6.4»**

## Verified start baseline

- `main @ 35fda15508973340669220a20ee1c5bf6bbaa39a`
- PR #20: **MERGED**
- post-merge Release Acceptance Gates **#651 — SUCCESS**
- accepted phase remains **5**
- accepted application version remains **v0.5.0**
- Phase 6 remains **IN PROGRESS**
- P6.3 remains **CLOSED**
- P6.5 remains **NOT STARTED**
- P6.7 remains **NOT STARTED**
- no tag, GitHub Release or deployment

Implementation branch:
`feat/phase6-p6-4-ae-native-measurement`

## Scope

P6.4 implements numeric **AE projected-plane distance only** for the ordered
P6.2 route:

- project every canonical geographic route point into the existing independent
  north-polar Azimuthal Equidistant model;
- compute one Euclidean straight-line distance for every adjacent projected
  point pair;
- sum adjacent segments as an **open polyline**;
- expose segment and total values in metres;
- preserve method identity `ae-projected-plane`;
- preserve scale basis `ae-projected-plane-si-metre`;
- preserve semantic type `REFERENCE_RESULT`;
- expose projection/method provenance and distortion limitations;
- provide backend and independent browser/offline implementations.

## Projection definition

P6.4 reuses the existing independent AE provider already present since Phase 2:

```text
+proj=aeqd +lat_0=90 +lon_0=0 +datum=WGS84 +units=m +no_defs
```

Backend numerical implementation:
- pyproj / PROJ;
- canonical WGS84 geographic input;
- north-polar AE forward projection;
- Euclidean distance in projected x/y metres.

Browser/offline implementation:
- proj4 2.22.0;
- the same declared AE projection definition;
- Euclidean distance in projected x/y metres.

## Critical semantic boundary

AE projected-plane metres are **not** relabeled as WGS84 geodesic distance even
though both methods use SI metres.

The north-polar Azimuthal Equidistant projection preserves radial distance from
its center at the north pole. It does not preserve every arbitrary pairwise
surface distance.

Therefore:

- `ae-projected-plane` and `wgs84-geodesic` remain separate computation identities;
- a difference between their numeric results is not silently normalized away;
- the existing straight route guide on AE is compatible with the P6.4 projected
  segment geometry, but rendering never changes the computation identity;
- no road or flight route is implied.

## Implemented code in this slice

Backend:
- `backend/app/domain/measurement.py`
- `backend/app/services/measurement.py`
- `backend/app/api/measurement_routes.py`
- `backend/app/api/router.py`
- `backend/app/services/capabilities.py`
- `backend/tests/test_phase6_ae_route_distance.py`

Frontend:
- `frontend/src/measurement/aeRouteDistance.ts`
- `frontend/src/measurement/AERouteDistancePanel.tsx`
- `frontend/src/measurement/contracts.ts`
- `frontend/src/api.ts`
- `frontend/src/App.tsx`
- `frontend/src/styles.css`
- `frontend/tests/ae-route-distance.test.mjs`
- `frontend/tests/e2e/acceptance.spec.ts`

## Explicit exclusions

P6.4 does **not** implement:

- Gleason native numeric measurement — P6.5;
- polygon/perimeter/area semantics — P6.6;
- provider-backed road/flight routing;
- P6.7 same-route computation/rendering laboratory;
- route persistence;
- astronomy;
- tags, GitHub Release or deployment.

## Automated verification

Implementation head:
`bd73fa0f6aa4cfd9c1d415c915f0ad35bd4c3476`

Release Acceptance Gates **#653 — SUCCESS**.

The complete workflow verified:
- backend route-distance/API tests;
- frontend local AE math tests;
- browser live-panel identity and route-edit behavior;
- online/backend and offline/browser fallback behavior;
- repeated coordinates and reverse route;
- antimeridian projected-chord case;
- north-pole/radial reference case;
- invalid-input rejection;
- WGS84 P6.3 regression;
- production build/PWA;
- Docker runtime, PostGIS, locked-source and search regressions.

CI #652 failed before implementation tests because the acceptance-package checker
still contained a historical assertion that the current Phase 6 slice must remain
P6.3. That checker was corrected so historical P6.3 closure evidence stays
historical while the current slice is P6.4.

## Current state

## Owner manual verification

The owner reported all six P6.4 manual checks successful on 2026-09-21:

- **6/6 PASS — REPORTED BY OWNER**;
- tested branch head: `59d19a96c6a7af443429d8ba7585386d4f491dee`;
- pre-manual Release Acceptance Gates **#661 — SUCCESS** on that exact head.

P6.4 was therefore marked **CLOSED**. That closure did not itself authorize merging
PR #21, starting P6.5 or P6.7, creating a tag/GitHub Release, or deployment.

The owner subsequently gave separate merge authorization. PR #21 was **MERGED**
into `main` at `11b571f08f72732b509f049f1a2ab1be92292938`; its final head
`ced5649c3c2d6e1c8e1d96af35fb0775637719a3` had passed Release Acceptance Gates
**#668 — SUCCESS**, and the post-merge `main` baseline passed Release Acceptance
Gates **#669 — SUCCESS**. P6.5 and P6.7 remain **NOT STARTED**.
