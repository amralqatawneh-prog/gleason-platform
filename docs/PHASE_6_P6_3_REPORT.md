# Phase 6 / P6.3 — WGS84 Ruler / Distance Report

Date: 2026-09-20

Status: **IN PROGRESS — AUTOMATED VERIFICATION PENDING**

Owner start instruction: **«ابدأ في الخطوة P6.3»**

## Verified start baseline

- Repository: `amralqatawneh-prog/gleason-platform`
- Start baseline: `main @ 645a27c5ea92febd78c3bdd823281ff496a742b3`
- PR #18: MERGED
- Post-merge Release Acceptance Gates #561: **SUCCESS**
- Working branch: `feat/phase6-p6-3-wgs84-distance`
- Accepted application version remains **v0.5.0**
- Accepted phase remains **5**
- Phase 6 remains **IN PROGRESS**
- Previous slice P6.2 remains **CLOSED**
- P6.4 remains **NOT STARTED**

## Slice objective

P6.3 implements numeric **WGS84 geodesic distance only** for the ordered
transient route created in P6.2.

The route is an **open polyline**. For ordered points A → B → C → …:

- every adjacent pair becomes one geodesic segment;
- every segment exposes its own distance in metres;
- the total is the sum of adjacent segment distances;
- no automatic closing segment is added;
- repeated geographic coordinates are allowed and yield a zero-length segment;
- point/source model does not change the calculation identity.

## Explicit computation identity

- method: `wgs84-geodesic`
- quantity: `distance`
- calculation model: `wgs84`
- semantic type: `REFERENCE_RESULT`
- unit: `metre`
- scale basis: `wgs84-ellipsoid`
- path semantics: `open-polyline`

A kilometre value may be shown as a display conversion only. The contract
quantity remains metres.

## Numerical authority and independent client implementation

### Backend acceptance authority

The backend continues to use the locked project dependency **pyproj 3.8.0**
with `pyproj.Geod(ellps="WGS84").inv(...)` for each adjacent route segment.

The pyproj Geod documentation defines the inverse computation as returning
forward/back azimuths and distance from the initial and terminus
latitude/longitude. Distance is in metres.

Project dependency:
- `backend/pyproject.toml`
- `backend/uv.lock`

Documentation:
- https://pyproj4.github.io/pyproj/stable/api/geod.html
- https://pyproj4.github.io/pyproj/dev/history.html

### Independent offline/browser implementation

The browser uses the already locked **geographiclib-geodesic 2.2.0** package
and `Geodesic.WGS84.Inverse(...).s12` independently of the backend.

Project dependency:
- `frontend/package.json`
- `frontend/package-lock.json`

Documentation:
- https://www.npmjs.com/package/geographiclib-geodesic
- https://geographiclib.sourceforge.io/html/js/module-geodesic_Geodesic.Geodesic.html

The browser result is parity-tested against the backend authority. One result is
not generated from the other.

## WGS84 coordinate basis

Canonical route inputs are latitude/longitude in the WGS 84 geographic frame.
P6.3 deliberately sends no fabricated ellipsoidal height into its route
distance request because surface geodesic distance uses latitude/longitude only.

Reference:
- EPSG:4979 — WGS 84 geographic 3D CRS
- https://epsg.io/4979

## Implemented backend work

### Domain/API

Added explicit P6.3 route-distance models:

- `WGS84RoutePoint`
- `WGS84RouteDistanceSegment`
- `WGS84RouteDistanceOutput`
- `WGS84RouteDistanceRequest`

Rules:
- minimum 2 points;
- maximum 50 points, matching P6.2 transient route capacity;
- finite latitude in [-90, 90];
- finite longitude in [-180, 180];
- explicit non-empty unique point IDs;
- no height field in the P6.3 route-point request.

### Provider/service/API endpoint

Added:
- backend provider `WGS84ReferenceProvider.route_distance(...)`;
- service wrapper `wgs84_route_distance(...)`;
- endpoint:
  `POST /api/v1/reference/wgs84/route-distance`.

The backend derives stable segment IDs from the ordered route point IDs and
returns:
- method/quantity/unit/scale identity;
- segment count;
- each segment distance;
- total distance;
- provenance and implementation version.

## Implemented frontend work

Added:
- `frontend/src/measurement/wgs84RouteDistance.ts`
- `frontend/src/measurement/Wgs84RouteDistancePanel.tsx`

The distance panel:
- automatically measures when at least two P6.2 route points exist;
- invalidates/recomputes after add/remove/reorder/undo/clear;
- displays each segment and the open-polyline total;
- shows method, unit, scale basis, path semantics and engine provenance;
- uses the backend when available;
- falls back to the independent browser GeographicLib implementation offline or
  when the backend cannot be reached;
- does not persist numeric results to IndexedDB.

The P6.2 route panel remains responsible only for ordered route identity/state.

## Capability changes

Backend capability metadata now exposes:
- `measurement_engine = true`
- `wgs84_route_distance = true`

It deliberately keeps:
- `route_engine = false`
- `area_engine = false`

because P6.3 does not implement provider route drawing, road/flight routes,
polygon perimeter/area, AE distance or Gleason distance.

## Automated coverage added

Backend tests cover:
- adjacent segment values and total;
- antimeridian short geodesic;
- repeated coordinates / zero-distance segment;
- reversed-route invariance;
- minimum-point rejection;
- duplicate point-ID rejection;
- invalid geographic coordinates;
- provenance and method identity.

Frontend/core tests cover:
- browser segment/total calculation;
- antimeridian;
- repeated coordinates;
- reversed route;
- input validation;
- absence of fabricated height;
- WGS84 measurement contract status.

Parity checker now includes seeded multi-point routes, including:
- equatorial cases;
- antimeridian;
- near-polar cases;
- repeated coordinates;
- random 2–8 point routes.

The complete release workflow also verifies the route-distance API through the
Docker runtime.

Browser acceptance coverage verifies:
- idle state with fewer than two points;
- live result after A/B;
- segment count and total;
- adding a third point;
- recomputation after reorder;
- method/unit/scale/path identity;
- visible provenance;
- Arabic/mobile layout.

## Boundaries intentionally preserved

P6.3 does **not** implement:
- AE projected-plane measurement — P6.4;
- Gleason normalized-native measurement — P6.5;
- polygon/perimeter/area — P6.6;
- same-route rendering paths on all three views — P6.7;
- road routing;
- flight routing;
- route persistence;
- any metres/kilometres conversion for Gleason normalized units.

The future route-provider contract remains fail-closed for provider paths and
the later operations above. P6.3 numeric WGS84 distance is implemented through
the measurement engine, not by pretending the entire future route-provider
service is available.

## Manual verification

Status: **NOT RUN**

Owner manual PASS must not be inferred from automated tests.

Planned manual checklist after automated gates succeed:

1. Add Doha and Amman; confirm one WGS84 segment and positive total are shown.
2. Add a third point; confirm two segment values and a larger open-polyline total.
3. Reorder a point; confirm segment identities/distances recompute.
4. Add the same geographic coordinates twice; confirm that segment is exactly 0 m.
5. Verify method/provenance visibly says WGS84 geodesic and identifies pyproj or
   browser GeographicLib; confirm it is not labeled AE/Gleason/road/flight.
6. Switch Arabic/English and a mobile-width viewport; confirm the ruler remains
   readable and the route is still transient after reload.

## Closure criteria

P6.3 may be marked CLOSED only after:

- complete Release Acceptance Gates succeed on the implementation head;
- documentation is updated with the exact successful head/run;
- the owner reports the manual checklist PASS, or explicitly waives named items;
- a final closure-documentation head passes the complete gates again.

P6.3 closure does not authorize P6.4, merge, tag, GitHub Release or deployment.
