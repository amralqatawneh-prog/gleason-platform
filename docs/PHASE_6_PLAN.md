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

Status: **IN PROGRESS**.

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

Status: **NOT STARTED**.

Deliver transient ordered route state A → B → C → … with:
- add/remove/reorder;
- clear/undo;
- explicit point IDs;
- segment identity;
- no automatic country centroid/boundary choice;
- no durable Phase 17 experiment persistence yet.

## P6.3 — WGS84 Ruler / Distance

Status: **NOT STARTED**.

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

Complete P6.1 automated gates, provide the P6.1 manual checklist, record the
owner-reported result, and close P6.1 before starting P6.2.
