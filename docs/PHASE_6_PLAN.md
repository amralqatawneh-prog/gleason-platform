# Phase 6 — Measurement, Routes and Historical Navigation Laboratories

Started: 2026-09-20 by explicit owner instruction: **«ابدأ بتنفيذ Phase 6»**.

Baseline:
- `main` commit: `3e5afcd9b95766bd18af59df88c9154f51567e8c`
- Release Acceptance Gates #517: **SUCCESS**
- Accepted application version remains **v0.5.0**
- Accepted phase remains **5**
- Implementation phase becomes **6 / in_progress**
- No tag, GitHub Release or deployment is implied.

## Governing rules

1. Execute one Phase 6 slice at a time.
2. A measurement endpoint is explicit geography, never a screen pixel.
3. A country name/record alone is not a unique point-to-point endpoint.
4. Calculation identity and visualization identity are separate.
5. Rendering a WGS84 geodesic on Gleason or AE does not change it into a Gleason/AE measurement.
6. Equal unit names do not imply equal method semantics: AE projected metres are not automatically WGS84 geodesic distance.
7. Gleason native normalized units must not become metres/kilometres without a documented scale basis or a separately labeled assumption.
8. No road route, flight route or provider-derived path is claimed without a dedicated provider and provenance.
9. Missing source/method/scale information remains unavailable rather than inferred.
10. Phase 17 owns durable saved experiments/routes; Phase 6 may introduce transient route state required for measurement usability.
11. Phase 18 owns final presentation/export polish, not the core usability of measurement tools.
12. Historical-source claims remain distinct from DERIVED computational reconstructions.
13. Future turn-by-turn navigation uses a dedicated `RouteProvider`; provider route distance/time never becomes a native model distance merely because the route is drawn on that model.
14. Every future slice that changes user-visible behavior, numerical semantics, provider contracts or persistence must update the relevant living Developer/User/Calculation guides.

## P6.1 — Measurement Semantics Contract

Status: **CLOSED — CI #519/#520 SUCCESS; OWNER MANUAL PASS 5/5 REPORTED**.

Deliver:
- versioned measurement contract;
- explicit endpoint contract derived only from canonical geographic selection;
- place vs free-point identity and provenance preservation;
- country-record ambiguity rejection for point-to-point endpoints;
- method identities:
  - `wgs84-geodesic`
  - `ae-projected-plane`
  - `gleason-native-normalized`;
- quantity identity for distance/perimeter/area;
- explicit calculation model, calculation space, semantic type, units and scale basis;
- visualization identity that preserves the original computation method when rendered on another model;
- fail-closed route service remains unavailable;
- capability metadata says semantics contract exists while measurement/route/area engines remain unavailable;
- automated contract tests.

P6.1 does **not** deliver numeric route/ruler/area calculations or interactive drawing.

Acceptance gates:
- country record cannot silently stand for a centroid/boundary endpoint;
- unknown WGS84 height remains unknown;
- no screen/projected coordinate enters endpoint interchange;
- WGS84 and AE remain distinct despite sharing metre units;
- Gleason has normalized units only;
- cross-model rendering preserves computation identity;
- route service has no available operations;
- full regression gates green;
- owner manual checklist result recorded separately.

## P6.2 — Ordered Route State

Status: **CLOSED — CI #532/#546 SUCCESS; OWNER MANUAL PASS 6/6 + REFINEMENT PASS REPORTED**.

Deliver transient ordered route state A → B → C → … with:
- add/remove/reorder;
- clear/undo;
- explicit point IDs;
- segment identity;
- explicit direct-map add mode for short picks on Gleason / AE / WGS84;
- support for more than three points, with a temporary P6.2 cap of 50 points;
- normal map selection behavior preserved while direct-map add mode is off;
- no automatic country centroid/boundary choice;
- no durable Phase 17 experiment persistence yet.

## P6.3 — WGS84 Ruler / Distance

Status: **CLOSED — base manual 6/6 PASS; route-guide 5/5 PASS; straight-line 4/4 PASS; pan/great-circle 6/6 PASS**.

Start baseline:
- `main @ 645a27c5ea92febd78c3bdd823281ff496a742b3`
- Release Acceptance Gates #561: **SUCCESS**
- branch: `feat/phase6-p6-3-wgs84-distance`
- final implementation head: `06f2397f63648d879d6271064f3297608a59c333`
- Release Acceptance Gates #565: **SUCCESS**
- browser acceptance: **20/20 PASS**
- owner manual verification: **6/6 PASS — REPORTED BY OWNER**
- backend-stop browser-local fallback: **PASS — REPORTED BY OWNER**
- pre-refinement documentation CI #572: **SUCCESS**
- owner-requested refinement: visual-only route line + A/B/C markers on WGS84/Gleason/AE
- route-guide refinement head: `483b123277f62e219937298b4fb7ca104809d420`
- route-guide Release Acceptance Gates #587: **SUCCESS**
- targeted route-guide owner retest: **5/5 PASS — REPORTED BY OWNER**
- backend-stop line/fallback retest: **PASS — REPORTED BY OWNER**
- pre-retest CI #595: **SUCCESS**
- current refinement: exact straight projected route segments on Gleason/AE, no intermediate samples
- straight-line implementation head: `f837f8af9c56309156540f28cdf5e60456642b69`
- straight-line Release Acceptance Gates #607: **SUCCESS**
- targeted straight-line owner retest: **4/4 PASS — REPORTED BY OWNER**
- Pan/Great Circle implementation head: `f67a69c78547330f273fc65bf3de4bb7379a09bf`
- Pan/Great Circle Release Acceptance Gates #627: **SUCCESS**
- targeted Pan/Great Circle owner retest: **6/6 PASS — REPORTED BY OWNER**
- final closure head: `c775aac8a97a6782915782ed2118c3018cfe5a1a`
- final closure Release Acceptance Gates #642: **SUCCESS**
- PR #19 merge commit: `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`
- post-merge Release Acceptance Gates #643: **SUCCESS**
- P6.7 remains NOT STARTED

Deliver:
- WGS84 geodesic segment and open-polyline distance;
- segment and total values;
- documented numerical authority;
- client/backend parity;
- antimeridian/polar/reference cases;
- explicit method/provenance labels.

## P6.4 — AE Native Measurement

Status: **CLOSED + MERGED — OWNER MANUAL 6/6 PASS — REPORTED BY OWNER**.

Start / automated evidence:
- owner instruction: **«أبدأ P6.4»**;
- baseline: `main @ 35fda15508973340669220a20ee1c5bf6bbaa39a`;
- post-PR20 Release Acceptance Gates **#651 — SUCCESS**;
- branch: `feat/phase6-p6-4-ae-native-measurement`;
- implementation head: `bd73fa0f6aa4cfd9c1d415c915f0ad35bd4c3476`;
- Release Acceptance Gates **#653 — SUCCESS**;
- owner manual verification: **6/6 PASS — REPORTED BY OWNER**;
- owner-tested head: `59d19a96c6a7af443429d8ba7585386d4f491dee`;
- pre-manual Release Acceptance Gates **#661 — SUCCESS**;
- final closure head: `ced5649c3c2d6e1c8e1d96af35fb0775637719a3`;
- final pre-merge Release Acceptance Gates **#668 — SUCCESS**;
- PR #21 merge commit on `main`: `11b571f08f72732b509f049f1a2ab1be92292938`;
- post-merge Release Acceptance Gates **#669 — SUCCESS**.

Deliver:
- projected-plane segment/polyline measurement;
- explicit projected-plane labeling;
- distortion/method limitations;
- no relabeling as WGS84 geodesic distance;
- optional side-by-side reference quantity only when semantics stay separate.

## P6.5 — Gleason Native Measurement

Status: **CLOSED + MERGED — final head `03a04679cfa4955340fa91f5f9d75aeeb268b0d7` · CI #699 SUCCESS · owner manual 6/6 PASS — REPORTED BY OWNER**.

Start baseline:
- `main @ fc42af3cd97706ddc3f92b44f7e784ba86fc7536` (PR #24 merge);
- PR #24 exact final head `2c3b12ceabdf374d587c96f49f23d097de8d8d1d` passed Release Acceptance Gates **#684 — SUCCESS** before merge;
- branch: `feat/phase6-p6-5-gleason-native-measurement`;
- accepted phase remains **5** and accepted application version remains **v0.5.0**;
- owner manual verification: **NOT RUN**.

Deliver:
- native normalized-radius plane distance/polyline quantity;
- normalized units only by default;
- no automatic km conversion;
- scale basis and historical/derived provenance shown explicitly;
- adjacent segment values and open-polyline total using the P6.2 ordered route;
- backend/browser or otherwise independently testable parity where the implementation architecture supports both.

Acceptance:
- method identity is `gleason-native-normalized`;
- distance unit is `normalized-radius-unit` and scale basis is `gleason-normalized-model-radius`;
- repeated/reversed/polar/antimeridian/model-center cases are deterministic;
- no WGS84/AE result is silently substituted;
- no normalized-unit → metre/km conversion exists without a separately documented scale rule;
- relevant living Developer/User/Calculation guides are updated.

## P6.6 — Polygon / Perimeter / Area

Status: **CLOSED / VERIFIED / MERGED — corrected contract owner manual 6/6 PASS; final closure CI #784 SUCCESS; PR #31 merged**.

Prior closure report (superseded): `docs/PHASE_6_P6_6_REPORT.md`.
Source audit: `docs/GLEASON_MEASUREMENT_VIDEO_BOOK_AUDIT_2026-09-21.md`.
Owner amendment approval: **«موافق على جميع مقترحاتك، تستطيع البدء»**.
Prior owner-tested head (superseded contract): `4cb8c04b40fbea35745f4091a4bf5e849c34b299` with #769 SUCCESS.
Corrected-contract owner-tested head: `e96712975fc9f54f2615e235bb6976136efe8a2d`.
Corrected-contract pre-manual Release Acceptance Gates: **#783 — SUCCESS**.
Corrected-contract owner manual verification: **6/6 PASS — REPORTED BY OWNER**.

Start authorization: owner instruction **«ادمج PR #30 وابدأ P6.6»**. Start baseline:
`main @ 1c64285b92c093365b74f3256aa9557b9a48268e`. The polygon semantics contract
is `docs/PHASE_6_P6_6_POLYGON_SEMANTICS.md`.

Define and implement:
- closed ordered points;
- minimum valid vertices;
- repeated/degenerate points;
- collinearity;
- self-intersection policy;
- interior/complement semantics;
- antimeridian behavior;
- polar behavior;
- orientation/sign semantics;
- model-specific perimeter/area identity and units.

Acceptance:
- invalid or degenerate geometry fails closed;
- WGS84/AE/Gleason quantities expose their own method/unit/scale identity;
- no cross-model area normalization is introduced;
- relevant living Developer/User/Calculation guides are updated.

## P6.7A — Same Route, Three Renderings

Status: **CLOSED / VERIFIED / MERGED — owner manual 6/6 PASS; final closure #829 SUCCESS; PR #34 merged**.

Automated evidence: earlier implementation head `02dad46db4f692709ded3f0471097aa3c4683fb7` passed Release Acceptance Gates **#816 — SUCCESS**. The exact owner-tested head `a11f7263cf42880ce0309c49f79ba45c29d78323` passed Release Acceptance Gates **#821 — SUCCESS** immediately before manual verification.

Start authorization: owner instruction **«ابدأ P6.7A»**.

Start baseline: `main @ 1825852da81c04cee8e5b9f73dba28b55068c000` after PR #33 merged. PR #33 exact final head `a72249b35250e3aeee1c3dbfac9c59dd89a7edfb` passed Release Acceptance Gates **#803 — SUCCESS** before merge; no independent post-merge push CI is claimed.

Implementation branch: `feat/p6.7a-same-route-three-renderings`; PR #34 **MERGED** at `main @ cd78f560c5070d3f525ddaf124c5fb5ec4d25c52` after exact closure head `8b60cac42431947b52950c9e8b9d920ca46ebd5b` passed Release Acceptance Gates **#829 — SUCCESS**.

Owner manual evidence: exact tested head `a11f7263cf42880ce0309c49f79ba45c29d78323`; pre-manual Release Acceptance Gates **#821 — SUCCESS**; result **6/6 PASS — REPORTED BY OWNER**. Final closure head `8b60cac42431947b52950c9e8b9d920ca46ebd5b` passed **#829 — SUCCESS** and PR #34 was separately authorized and merged.

Detailed contract: `docs/PHASE_6_P6_7A_SAME_ROUTE_THREE_RENDERINGS.md`.

Render the same ordered geographic path across Gleason, AE and WGS84 while
preserving the selected computation identity.

Example invariant:
- WGS84 geodesic rendered on Gleason = **WGS84 geodesic visualized on Gleason**,
  never “Gleason distance.”

Acceptance:
- one canonical ordered route identity drives all three renderings;
- each view projects/render independently;
- computation identity and visualization identity remain inspectable.

## Corrective measurement sequence — owner approved 2026-09-22

Governing architecture:
`docs/ROADMAP_MEASUREMENT_UX_CELESTIAL_ARCHITECTURE_AMENDMENT_2026-09-22.md`.

P6.7B is intentionally paused until P6.C1–P6.C5 close.

### P6.C1 — Gleason Measurement Re-evaluation
Status: **IN PROGRESS — STACKED PR #37 ON VERIFIED ARCHITECTURE PR #36**.

Deliver:
- versioned Gleason measurement-profile contract;
- source/evidence hierarchy;
- demote `gleason-fig43-circle-derived` from preferred universal route scale to diagnostic;
- register Walter SI flat-plane profile as external comparative, not Gleason historical;
- audit Figure 43 mile unit identity before automatic SI conversion;
- define book/video/raster profile semantics and fail-closed conversion rules;
- tests/fixtures for formulas and profile metadata;
- no Map-First UI redesign yet.

### P6.C2 — Gleason SI Measurement Engine
Status: **NOT STARTED**.

Implement approved profiles with metre/km/NM outputs where justified, explicit
profile provenance, browser/backend parity and no hidden normalization.

### P6.C3 — Calibration & Fixture Laboratory
Status: **NOT STARTED**.

Compare book/video/Walter/raster/reference fixtures, report residuals and local
scale/distortion diagnostics, and expose research profile selection.

### P6.C4 — Ellipsoidal Elevation Provider
Status: **NOT STARTED**.

Define `ElevationProvider`; verify at least one online provider; preserve vertical
datum/provenance; compute ellipsoidal height for WGS84 ECEF without inventing
`h=0`; define cache/offline/failure behavior.

### P6.C5 — Map-First Comparison Workspace
Status: **NOT STARTED**.

Implement single large map, two-map 50/50 desktop comparison, mobile tabs and a
collapsible inspector while preserving canonical selection/route/computation
identity.

## P6.7B — Route Provider & Turn-by-Turn Directions

Status: **NOT STARTED**.

Introduce the future `RouteProvider` contract from
`docs/SHARED_CONTEXT_PROVIDER_CONTRACTS.md`.

Deliver:
- explicit navigation-route object distinct from the P6.2 measurement polyline;
- provider/version/travel-mode/provenance;
- canonical geographic route geometry;
- legs and maneuvers/turn-by-turn instructions;
- provider distance and duration/ETA when supplied;
- same provider geometry rendered independently on Gleason, AE and WGS84;
- provider/offline/regional-routing capability and error states;
- Valhalla as the first implementation candidate to evaluate, not a pre-committed
  dependency.

Acceptance:
- navigation route and measurement polyline cannot be silently interchanged;
- provider distance/time retains provider identity;
- rendering on a model never relabels provider distance as native model distance;
- unsupported modes/providers fail closed;
- rerouting/waypoint ordering/error cases have automated coverage;
- attribution/licensing/provenance is visible;
- relevant living Developer/User/Calculation guides are updated.

## P6.8 — Navigation / Longitude Laboratory

Status: **NOT STARTED**.

Develop the agreed comparison laboratory for longitude/navigation claims with
explicit source/method separation and no hidden conversion between historical
claims and modern reference calculations.

## P6.9 — Gleason Original Mode

Status: **NOT STARTED**.

Source-grounded historical presentation using the registered primary source:
- 24-hour dial;
- radiating latitude arms;
- historical longitude/time calculator representation;
- every historical element linked to source page/figure;
- modern helper calculations labeled DERIVED where applicable.

Primary source locators already registered:
- PDF pp. 376–377 / printed pp. 349–350;
- PDF p. 429 / printed p. 402, Fig. 43;
- PDF pp. 360–361 / printed pp. 333–334, Fig. 30.

No standalone scan control points may be fabricated.

## P6.10 — Phase 6 Regression and Acceptance Package

Status: **NOT STARTED**.

Regression:
- browser;
- offline;
- Arabic/English;
- mobile;
- poles;
- antimeridian;
- route edits;
- quantity/method provenance;
- model-specific units;
- same-route rendering identity;
- RouteProvider vs measurement-polyline identity and turn-by-turn provenance when P6.7B is implemented;
- missing/ambiguous input behavior;
- persistence boundaries;
- historical source visibility.

Whole Phase 6 acceptance remains a separate explicit owner decision.

## Current next action

The owner approved the corrective measurement/UX/celestial architecture roadmap
on 2026-09-22.

Architecture branch:
`docs/measurement-ux-celestial-architecture-amendment-2026-09-22`.

Baseline:
`main @ cd78f560c5070d3f525ddaf124c5fb5ec4d25c52`.

P6.7A is **CLOSED / VERIFIED / MERGED**:
- owner-tested head `a11f7263cf42880ce0309c49f79ba45c29d78323`;
- pre-manual CI **#821 — SUCCESS**;
- owner manual **6/6 PASS — REPORTED BY OWNER**;
- closure head `8b60cac42431947b52950c9e8b9d920ca46ebd5b`;
- closure CI **#829 — SUCCESS**;
- PR #34 merge `cd78f560c5070d3f525ddaf124c5fb5ec4d25c52`.

Current task:
1. Architecture Amendment exact closure head `06b9d4ad2b8c13fabed90fdd76d1e50faed2c2d1` passed **#837 — SUCCESS**; PR #36 remains unmerged pending separate owner authorization.
2. **P6.C1 is now IN PROGRESS** on `feat/p6.c1-gleason-measurement-reevaluation`, stacked draft PR #37 based exactly on that verified head.
3. P6.C1 contract/source audit demotes the circle-derived profile to diagnostic, fails closed on unresolved Figure 43 SI conversion, registers Walter direct-SI external comparison, and gates video/raster calibration profiles.
4. P6.C2 remains NOT STARTED and P6.7B remains **PAUSED / NOT STARTED** until P6.C1–P6.C5 close.

### P6.6 source-audit correction package — 2026-09-21

Owner approved the final formulation. Current target contract uses
`gleason-fig43-circle-derived` as the preferred historical scale,
`gleason-radial-60nm-legacy` as comparison only, and
`walter-eq-configurable` as external comparison. The restored map is registered
with provisional raster georeferencing. Fresh CI and targeted manual tests were completed before P6.6 was re-closed. Corrected-contract owner verification passed 6/6, final closure CI #784 succeeded, and PR #31 was merged.
