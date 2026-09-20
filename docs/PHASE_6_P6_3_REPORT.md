# Phase 6 / P6.3 — WGS84 Ruler / Distance Report

Date: 2026-09-20

Status: **CLOSED — OWNER VERIFIED + FINAL CLOSURE GATES PENDING ON THIS HEAD**

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

## Automated verification

Final implementation head:
`06f2397f63648d879d6271064f3297608a59c333`

Release Acceptance Gates **#565 — SUCCESS** on that exact head.

Successful gate coverage includes:
- repository/source-policy consistency;
- accepted-package consistency;
- locked-source verification;
- backend tests including P6.3 API/reference cases;
- frontend dependency security;
- frontend core tests;
- independent browser/backend WGS84 parity including multi-point routes;
- production build/PWA checks;
- **20/20 Chromium acceptance tests** including the P6.3 live ruler;
- Docker runtime and the new route-distance API smoke test;
- Phase 2/4 regression;
- PostGIS locked-source import/coverage;
- online/offline/Arabic search;
- Redis and frontend HTTP checks.

Earlier CI #562 and #564 exposed stale browser text expectations inherited from
the P5.7/P6.2 UI wording. The numeric P6.3 backend/core/parity checks were already
green; those stale expectations were corrected, and #565 then passed the full
workflow.

## Owner manual verification

Status: **PASS — REPORTED BY OWNER (6/6)**

The owner reported all six P6.3 manual checks successful:

1. two-point WGS84 segment and positive total;
2. third-point / two-segment open-polyline total;
3. route reorder with recomputation;
4. repeated coordinates produce exactly 0 m;
5. WGS84/provenance identity remains explicit and is not relabeled AE/Gleason/road/flight;
6. Arabic/English, mobile layout and transient-route behavior.

The owner additionally stopped the backend and confirmed that a two-point
measurement succeeded through the browser-local `geographiclib-geodesic`
fallback, then restarted the backend successfully.

The tested documentation head before this refinement was:
`a65ca1af84c5bed1e7b0584da2b38cd3c8cbdad9`, with Release Acceptance Gates
**#572 — SUCCESS**.

## Owner-requested visual route-guide refinement

After the 6/6 manual PASS, the owner requested a visible line between the added
route points for clarity.

This refinement stays inside P6.3 as **display-only route guidance**:

- render the ordered A → B → C … connector on WGS84, Gleason and AE;
- show A/B/C route-point markers;
- use the same canonical ordered geographic points already owned by P6.2;
- keep the numeric result unchanged as `wgs84-geodesic`;
- do not call the visual line a road route, flight route, provider route,
  AE-native distance or Gleason-native distance;
- do not start P6.7; that later slice still owns the fuller same-route rendering
  laboratory/identity work.

The line is explicitly labeled **visual-only** in the UI and data attributes.
A targeted owner retest is required after the refinement passes CI.

### Route-guide automated verification

Refinement head:
`483b123277f62e219937298b4fb7ca104809d420`

Release Acceptance Gates **#587 — SUCCESS** on that exact head.

The successful workflow includes frontend core coverage for the display-only
route-guide geometry, the existing WGS84 parity gates, production build,
**20/20 Chromium acceptance tests**, Docker runtime, source/data regression,
PostGIS/search checks and the existing P6.3 route-distance API smoke test.

Current route-guide refinement result: **PASS — REPORTED BY OWNER (5/5)**.

The owner also repeated the backend-stop test and confirmed that:
- the route line remained visible with the backend stopped;
- two-point browser-local measurement remained operational;
- the backend was restarted afterward.

The retested head was
`df9227a831e4b90940cea70dde902f64684a0bf4`, after Release Acceptance Gates
**#595 — SUCCESS**.

### Second owner-requested refinement — exact straight line on flat models

After the successful route-guide retest, the owner requested that the drawn
route on the two flat views (Gleason Historical and AE) be **perfectly straight**
rather than visually curved.

Implementation rule:
- for each adjacent A → B pair, project A and B into the target flat model;
- create one OpenLayers `LineString` containing **exactly those two projected
  endpoints**;
- insert no intermediate geographic samples;
- therefore each displayed segment is an exact straight chord in that projected
  plane;
- WGS84 WebGL/fallback visualization remains unchanged;
- numeric distance remains `wgs84-geodesic`;
- this remains visual-only and does not start P6.7.

Straight-line refinement result: **4/4 PASS — REPORTED BY OWNER**.

Straight-line implementation head:
`f837f8af9c56309156540f28cdf5e60456642b69`

Release Acceptance Gates **#607 — SUCCESS** on that exact head.

The successful workflow includes:
- frontend core tests proving each flat-model route segment has exactly two projected endpoints;
- browser acceptance asserting both flat projection cards expose
  `data-route-guide-geometry="straight-projected-segments"`;
- existing WGS84 distance/parity regression;
- production build/PWA;
- Chromium acceptance;
- Docker runtime;
- locked-source/PostGIS/search regression.

The owner subsequently reported the straight-line targeted retest **4/4 PASS**.
The previous 5/5 route-guide retest and offline fallback PASS remain recorded.

## Closure criteria

All P6.3 closure criteria are complete:

- complete Release Acceptance Gates on the implementation lineage — **DONE**;
- original owner manual checklist — **6/6 PASS — REPORTED BY OWNER**;
- route-guide refinement retest — **5/5 PASS — REPORTED BY OWNER**;
- straight-line refinement retest — **4/4 PASS — REPORTED BY OWNER**;
- Pan/Great Circle refinement retest — **6/6 PASS — REPORTED BY OWNER**;
- final closure head `c775aac8a97a6782915782ed2118c3018cfe5a1a` — **CI #642 SUCCESS**.

P6.3 is therefore **CLOSED**. Closure did not itself authorize P6.4, tag,
GitHub Release or deployment. Merge authorization was granted separately and is
recorded in the post-merge section below.


## Third owner-requested refinement — flat-map pan + WGS84 Great Circle

After reporting the straight-line targeted retest **4/4 PASS**, the owner requested:

1. free panning of both flat models in all directions with mouse drag or touch;
2. a WGS84 globe route curve that follows a **Great Circle reference**.

Implementation:
- Gleason and AE use an explicit OpenLayers `DragPan` interaction;
- pan accepts mouse and touch pointer input;
- area-zoom temporarily disables pan so the drag gesture has one meaning;
- zoom, rotation, fit-full and focus-selected remain independent;
- WGS84 visual route now samples a spherical great-circle arc using vector
  spherical interpolation;
- the visual great-circle is mapped onto the WGS84 ellipsoid renderer;
- numeric distance remains the separate `wgs84-geodesic` ellipsoidal result;
- the visual curve is **not** labeled as an observed/live flight track;
- actual flight tracks may differ because of airways, winds and ATC;
- P6.7 remains NOT STARTED.

Automated verification for this refinement is complete.

Implementation/documentation head:
`f67a69c78547330f273fc65bf3de4bb7379a09bf`

Release Acceptance Gates **#627 — SUCCESS** on that exact head.

Verified automatically:
- explicit mouse drag panning changes the independent center state of Gleason and AE;
- pan remains camera-local and does not change canonical geographic selection;
- both flat views advertise mouse + touch pan support;
- Great Circle interpolation handles equatorial, antimeridian, repeated and antipodal inputs without NaN;
- WGS84 globe route identity is `great-circle-reference`;
- the route is explicitly marked `data-flight-track="false"`;
- numeric P6.3 distance parity remains unchanged;
- production build, Chromium acceptance, Docker, PostGIS and search regressions are green.

Pan/Great Circle refinement result: **6/6 PASS — REPORTED BY OWNER**.


## Final owner verification and closure

The owner reported the final Pan/Great Circle targeted checklist **6/6 PASS**.

Verified manually by the owner:
- mouse pan on both flat models;
- touch pan on both flat models;
- area-zoom correctly takes over the drag gesture and pan resumes afterward;
- WGS84 Great Circle visualization;
- multi-point Great Circle behavior while Gleason/AE remain straight;
- numeric `wgs84-geodesic` distance remains unchanged.

The retest was performed after Release Acceptance Gates **#635 — SUCCESS** on
head `746e71b261747132bec49f33348cd42870092643`.

P6.3 was marked **CLOSED** in the acceptance package. The final closure head
`c775aac8a97a6782915782ed2118c3018cfe5a1a` passed Release Acceptance Gates
**#642 — SUCCESS**.

## Merge result

The owner separately authorized **PR #19** to merge into `main`.

- final PR head: `c775aac8a97a6782915782ed2118c3018cfe5a1a`;
- pre-merge Release Acceptance Gates: **#642 — SUCCESS**;
- merge commit: `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`;
- post-merge Release Acceptance Gates: **#643 — SUCCESS**.

Current boundaries:
- P6.3 remains **CLOSED**;
- P6.4 remains **NOT STARTED**;
- P6.7 remains **NOT STARTED**;
- no tag, GitHub Release or deployment has been authorized.
