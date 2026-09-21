# Phase 6 / P6.5 — Gleason Native Measurement Report

Status: **IN PROGRESS — AUTOMATED VERIFICATION PENDING / OWNER MANUAL NOT RUN**

Date: 2026-09-21

Owner start instruction: **«ابدأ P6.5»**

## Verified start baseline

- Repository: `amralqatawneh-prog/gleason-platform`
- Start baseline: `main @ fc42af3cd97706ddc3f92b44f7e784ba86fc7536`
- PR #24: **MERGED**
- PR #24 exact final head:
  `2c3b12ceabdf374d587c96f49f23d097de8d8d1d`
- Release Acceptance Gates **#684 — SUCCESS** on that exact pre-merge head
- Working branch:
  `feat/phase6-p6-5-gleason-native-measurement`
- Accepted application version remains **v0.5.0**
- Accepted phase remains **5**
- Phase 6 remains **IN PROGRESS**
- P6.1–P6.4 remain **CLOSED**
- P6.6 remains **NOT STARTED**
- No tag, GitHub Release or deployment

## Slice objective

P6.5 implements numeric **Gleason native normalized distance** for the transient
ordered route created in P6.2.

For ordered points A → B → C → …:

- each canonical WGS84 point is projected independently with the existing
  `GH-0.2.0` derived Gleason reconstruction;
- each adjacent pair becomes one straight Euclidean chord in that normalized
  projected plane;
- each segment exposes its own value in `normalized-radius-unit`;
- the route total is the sum of adjacent segments;
- the route remains an open polyline;
- repeated geographic coordinates are valid and contribute zero;
- no WGS84 or AE result is substituted.

## Explicit computation identity

- method: `gleason-native-normalized`
- quantity: `distance`
- calculation model: `gleason`
- semantic type: `COMPUTED_RESULT`
- unit: `normalized-radius-unit`
- scale basis: `gleason-normalized-model-radius`
- path semantics: `open-polyline`
- segment geometry: `straight-projected-chord`

There is **no automatic metre/kilometre conversion** in P6.5.

## Projection basis

P6.5 reuses the already registered Phase 2 Gleason provider:

```text
r = (90 - latitude_deg) / 180
theta = normalized_longitude_deg in radians
x = r * sin(theta)
y = -r * cos(theta)
```

Provider identity:
- model: `gleason-historical`
- model version: `GH-0.2.0`
- projected coordinate unit: `normalized-radius`

This is a project **DERIVED reconstruction** grounded in the registered
historical source record. The historical book is not claimed to print this
modern analytic formula verbatim.

## Implemented backend work

- `backend/app/domain/measurement.py`
- `backend/app/services/measurement.py`
- `backend/app/api/measurement_routes.py`
- `backend/app/services/capabilities.py`
- `backend/tests/test_api.py`
- `backend/tests/test_phase6_gleason_route_distance.py`

Endpoint:

`POST /api/v1/measurement/gleason/route-distance`

The backend returns:
- method/quantity/unit/scale identity;
- segment count;
- projected endpoints in normalized-radius coordinates;
- each adjacent normalized segment length;
- open-polyline total;
- `COMPUTED_RESULT` provenance.

## Implemented frontend work

- `frontend/src/measurement/gleasonRouteDistance.ts`
- `frontend/src/measurement/GleasonRouteDistancePanel.tsx`
- `frontend/src/api.ts`
- `frontend/src/App.tsx`
- `frontend/src/measurement/contracts.ts`
- `frontend/src/measurement/OrderedRoutePanel.tsx`
- `frontend/src/comparison/futureServices.ts`
- `frontend/tests/gleason-route-distance.test.mjs`
- `frontend/tests/measurement-contract.test.mjs`
- `frontend/tests/p5-7-contracts.test.mjs`
- `frontend/tests/e2e/acceptance.spec.ts`

The UI:
- updates live from the P6.2 ordered route;
- displays each segment and total;
- shows method, unit, scale basis, path semantics and provenance;
- explicitly warns that the unit is not metre/km;
- uses the backend when available;
- falls back to the independent browser implementation when offline or the
  backend is unavailable.

## Backend/browser parity

Added:
- `scripts/check_gleason_measurement_parity.py`

The parity gate uses deterministic synthetic routes including:
- model center / north pole;
- south boundary;
- ±180° cases;
- antimeridian-adjacent points;
- repeated coordinates;
- random multi-point routes.

Backend and browser projected coordinates, segment distances and totals must agree
within the declared numerical tolerance.

## Explicit boundaries

P6.5 does **not** implement:
- metre/km scale conversion for Gleason normalized units;
- polygon/perimeter/area — P6.6;
- RouteProvider / turn-by-turn routing — P6.7B;
- road or flight route providers;
- durable route persistence;
- astronomy;
- historical scan control points;
- tag, GitHub Release or deployment.

## Verification state

Automated Release Acceptance Gates: **PENDING on the active branch / PR**.

Owner manual verification: **NOT RUN**.

P6.5 must not be marked CLOSED until:
1. the complete automated gates pass on an exact implementation/documentation head;
2. the owner performs and reports the manual checklist, or explicitly waives named items;
3. a final closure-state head passes the complete gates.

P6.6 must not start before P6.5 closure.
