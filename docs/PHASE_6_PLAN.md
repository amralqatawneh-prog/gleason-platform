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

Status: **AWAITING STRAIGHT-LINE OWNER RETEST — base manual 6/6 PASS; first route-guide retest 5/5 PASS; CI #607 SUCCESS**.

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
- targeted straight-line owner retest: **NOT RUN**
- P6.7 remains NOT STARTED

Deliver:
- WGS84 geodesic segment and open-polyline distance;
- segment and total values;
- documented numerical authority;
- client/backend parity;
- antimeridian/polar/reference cases;
- explicit method/provenance labels.

## P6.4 — AE Native Measurement

Status: **NOT STARTED**.

Deliver:
- projected-plane segment/polyline measurement;
- explicit projected-plane labeling;
- distortion/method limitations;
- no relabeling as WGS84 geodesic distance;
- optional side-by-side reference quantity only when semantics stay separate.

## P6.5 — Gleason Native Measurement

Status: **NOT STARTED**.

Deliver:
- native normalized-radius plane distance/polyline quantity;
- normalized units only by default;
- no automatic km conversion;
- scale basis and historical/derived provenance shown explicitly.

## P6.6 — Polygon / Perimeter / Area

Status: **NOT STARTED**.

Define and implement:
- closed ordered points;
- minimum valid vertices;
- repeated/degenerate points;
- collinearity;
- self-intersection policy;
- interior/complement semantics;
- antimeridian behavior;
- polar behavior;
- model-specific perimeter/area identity and units.

## P6.7 — Same Route, Three Renderings

Status: **NOT STARTED**.

Render the same ordered geographic path across Gleason, AE and WGS84 while
preserving the selected computation identity.

Example invariant:
- WGS84 geodesic rendered on Gleason = **WGS84 geodesic visualized on Gleason**,
  never “Gleason distance.”

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
- missing/ambiguous input behavior;
- persistence boundaries;
- historical source visibility.

Whole Phase 6 acceptance remains a separate explicit owner decision.

## Current next action

P6.1 is closed and merged through PR #15. P6.2 — Ordered Route State is
**CLOSED + MERGED** through PR #16.

PR #16 merged at
`c1d72e1d1536cf1aba9376e4ada76b7fc31056f5` with post-merge CI #554 SUCCESS.
The subsequent documentation synchronization PR #18 merged to
`main @ 645a27c5ea92febd78c3bdd823281ff496a742b3`, and post-merge Release
Acceptance Gates **#561 — SUCCESS**.

The owner then explicitly instructed **«ابدأ في الخطوة P6.3»**. P6.3 is now
**IN PROGRESS** on `feat/phase6-p6-3-wgs84-distance`. P6.4 remains
**NOT STARTED** and does not start automatically from P6.3 implementation.
