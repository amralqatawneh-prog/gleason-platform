# Phase 6 — P6.7A Same Route, Three Renderings

Date started: 2026-09-22  
Status: **IN PROGRESS**  
Owner instruction: **«ابدأ P6.7A»**  
Branch: `feat/p6.7a-same-route-three-renderings`  
PR: **#34 — draft / open**

## Baseline

P6.7A starts from:

`main @ 1825852da81c04cee8e5b9f73dba28b55068c000`

That commit is the separately authorized PR #33 merge. PR #33 exact final head
`a72249b35250e3aeee1c3dbfac9c59dd89a7edfb` passed Release Acceptance Gates
**#803 — SUCCESS** before merge. No independent post-merge push CI is claimed.

Accepted phase remains **5** and accepted application version remains **v0.5.0**.
Phase 6 remains **IN PROGRESS**.

## Core invariant

P6.7A reuses exactly one transient P6.2 `OrderedRouteState`.

The user selects one computation identity:

- `wgs84-geodesic`;
- `ae-projected-plane`;
- `gleason-native-normalized`.

That selected computation creates one route-rendering geometry. The same
geometry is then visualized independently on:

- Gleason;
- AE;
- WGS84.

Rendering on a different model does not change:

- method id;
- calculation model;
- quantity;
- unit;
- scale basis;
- semantic type.

Every visualization carries:

`interpretationRule = preserve-computation-identity`.

Therefore a WGS84 geodesic rendered on Gleason remains **WGS84 geodesic
visualized on Gleason**, never a Gleason distance. The same rule applies to AE
and Gleason computation identities.

## Rendering geometry contract

### WGS84

The browser uses `geographiclib-geodesic 2.2.0` / WGS84 ellipsoidal geodesic
inverse+direct calculations. Each adjacent canonical route segment is sampled
along that ellipsoidal geodesic.

Geometry id:

`wgs84-ellipsoidal-geodesic`.

### AE

The two canonical geographic endpoints are projected into the existing
north-polar AE plane. One straight projected chord is defined there. Samples
along that chord are inverse-projected back into canonical geographic
coordinates for cross-view rendering.

Geometry id:

`ae-straight-projected-chord`.

This does not relabel AE projected-plane distance as WGS84 geodesic distance.

### Gleason

The two canonical geographic endpoints are projected through GH-0.2.0 into the
derived normalized-radius plane. One straight chord is defined there. Samples
along that chord are inverse-projected back into canonical geographic
coordinates for cross-view rendering.

Geometry id:

`gleason-straight-projected-chord`.

This remains a project DERIVED computational geometry. It is not claimed as a
formula printed by Gleason.

## View contract

All three view components receive the same `SameRouteRenderingPlan`.

Each view exposes inspectable state including:

- canonical route id;
- route revision;
- selected computation method/model/unit;
- computation geometry id;
- rendered-on model;
- `preserve-computation-identity`.

Gleason and AE independently project the shared geographic samples into their
own plane. WGS84 independently places those same samples on the reference
ellipsoid.

The A/B/C/... markers always represent the canonical P6.2 route vertices, not
additional sampled path points.

## Boundaries

P6.7A does **not**:

- create a second route state;
- create a road route;
- create a flight route;
- implement turn-by-turn directions;
- select a RouteProvider;
- expose provider distance/duration;
- persist routes as Phase 17 experiments;
- change the accepted version or accepted phase;
- create a tag, GitHub Release or deployment.

P6.7B remains **NOT STARTED** and owns RouteProvider/turn-by-turn work.

## Automated coverage

Targeted core coverage includes:

- one canonical route and three visualization identities;
- WGS84 ellipsoidal geodesic sampling;
- AE straight-chord sampling with inverse geographic interchange;
- Gleason straight-chord sampling with inverse geographic interchange;
- antimeridian and polar routes;
- route reorder/revision freshness;
- fewer-than-two-point fail-closed rendering;
- repeated-coordinate stability;
- no provider-route semantics.

Browser acceptance includes:

- default WGS84 computation identity across all three views;
- switching to AE and Gleason identities;
- identical route id/revision across all three views;
- reorder/live refresh;
- Arabic;
- mobile layout.

Full repository regression remains mandatory.

## Owner manual checklist

Manual verification is **NOT RUN** until automated gates are green.

1. **Two-point WGS84 identity** — add two route points; verify all three views
   show the route and all identify the computation as `wgs84-geodesic`.
2. **Switch computation identity** — switch to AE, then Gleason; verify all
   three views change together while each view still states its own
   rendered-on model.
3. **Multi-point live edits** — add at least three points, reorder/remove/undo,
   and verify every view updates to the same route revision without stale
   geometry.
4. **Antimeridian / polar case** — create a route near the antimeridian and a
   high-latitude route; verify finite continuous rendering and normal pan/zoom.
5. **Arabic + mobile** — switch to Arabic and a narrow/mobile viewport; verify
   the identity panel remains readable and no horizontal overflow appears.
6. **Backend unavailable** — with the frontend already loaded, stop the backend
   and change route points/computation identity; P6.7A rendering must continue
   because its rendering geometry is browser-local. Do not infer road/flight
   routing from this fallback.

Record owner results only as **PASS — REPORTED BY OWNER** after the owner
actually reports each test result.
