# Phase 6 — P6.6 Polygon / Perimeter / Area Closure Report

Date: 2026-09-21  
Status: **CLOSED / VERIFIED / MERGED — corrected contract owner manual 6/6 PASS; final closure #784 SUCCESS; PR #31 merged**  
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

Historical closure boundary: PR #31 remained unmerged at that point until separate explicit owner merge authorization. That authorization was later given and the PR was merged.

The closure-state head later passed the complete Release Acceptance Gates as #784 and became the verified merge candidate. PR #31 was subsequently merged. The owner later explicitly requested a documentation/state reconciliation before starting the next functional slice.


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


## Scale/raster correction package — owner approved

The owner approved the final scale/raster formulation before new manual
testing. The amended contract:

- keeps GH normalized geometry;
- makes `gleason-fig43-circle-derived` the preferred historical scale;
- demotes `10800 NM/NRU` to `gleason-radial-60nm-legacy`;
- adds Walter configurable scale as external comparison;
- adds same-latitude Figure 43 arc/chord separation;
- registers the high-resolution restored map and provisional pixel
  georeferencing;
- registers all five uploaded videos with evidence roles.

This paragraph records the reopened period historically. Fresh CI and targeted owner verification later passed on the corrected contract.


## Corrected-contract owner verification and closure — 2026-09-21

Corrected-contract baseline tested by the owner:

`e96712975fc9f54f2615e235bb6976136efe8a2d`

Release Acceptance Gates before owner manual verification:

**#783 — SUCCESS**

Owner manual result for the corrected contract:

**6/6 PASS — REPORTED BY OWNER**

The six targeted checks verified:

1. preferred historical scale `gleason-fig43-circle-derived` is the default,
   with native NRU and legacy radial-60 comparison kept separate;
2. Figure 43 scale is latitude-dependent and fails closed for an arbitrary
   cross-latitude segment instead of applying a global `delta-longitude * 60`
   shortcut;
3. Figure 37–38 longitude/time conversion preserves
   `1 degree = 4 minutes` and reverses sign when A/B are reversed without
   becoming a route-distance method;
4. restored-raster identity and provisional georeferencing are visible without
   fabricated city control points or pixel/geographic-unit substitution;
5. polygon output keeps NRU/NRU² native values while Figure 43-derived planar
   perimeter/area and legacy comparison remain separately labeled;
6. regression check confirms search, ordered-route editing/direct-map add,
   WGS84, AE, Gleason, zoom/pan and stale-result clearing remain intact.

This closed the corrected P6.6 contract subject to one final Release Acceptance
Gates run on the closure-state head.

## Final closure verification and merge — 2026-09-21

- exact final closure head: `1d84ba85ba21d320a0de0ed16d87006c5ef80c84`;
- Release Acceptance Gates: **#784 — SUCCESS**;
- owner-tested corrected-contract baseline: `e96712975fc9f54f2615e235bb6976136efe8a2d`;
- pre-manual Release Acceptance Gates: **#783 — SUCCESS**;
- owner manual verification: **6/6 PASS — REPORTED BY OWNER**;
- separate owner merge authorization: given;
- PR #31: **MERGED / CLOSED**;
- merge commit / current integration baseline:
  `6a2666112e56514051ea62fbe1c25f5a8016f1ae`;
- no independent post-merge push CI is claimed;
- P6.7A remains **NOT STARTED**;
- accepted phase remains **5** and accepted application version remains **v0.5.0**;
- no tag, GitHub Release or deployment is authorized.

On 2026-09-22 the owner explicitly requested a full GitHub documentation/state
reconciliation before starting the next functional slice.
