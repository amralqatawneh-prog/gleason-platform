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

Status: **CLOSED — OWNER MANUAL 6/6 PASS — REPORTED BY OWNER**.

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

Status: **IN PROGRESS**.

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

Status: **NOT STARTED**.

Render the same ordered geographic path across Gleason, AE and WGS84 while
preserving the selected computation identity.

Example invariant:
- WGS84 geodesic rendered on Gleason = **WGS84 geodesic visualized on Gleason**,
  never “Gleason distance.”

Acceptance:
- one canonical ordered route identity drives all three renderings;
- each view projects/render independently;
- computation identity and visualization identity remain inspectable.

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

P6.1 is closed and merged through PR #15. P6.2 — Ordered Route State is
**CLOSED + MERGED** through PR #16.

PR #16 merged at
`c1d72e1d1536cf1aba9376e4ada76b7fc31056f5` with post-merge CI #554 SUCCESS.
The subsequent documentation synchronization PR #18 merged to
`main @ 645a27c5ea92febd78c3bdd823281ff496a742b3`, and post-merge Release
Acceptance Gates **#561 — SUCCESS**.

The owner then explicitly instructed **«ابدأ في الخطوة P6.3»**. P6.3 was
implemented, manually verified, closed, and then separately authorized for merge.

P6.3 final evidence:
- base owner manual verification: **6/6 PASS — REPORTED BY OWNER**;
- route-guide refinement: **5/5 PASS — REPORTED BY OWNER**;
- straight-line refinement: **4/4 PASS — REPORTED BY OWNER**;
- Pan/Great Circle refinement: **6/6 PASS — REPORTED BY OWNER**;
- final closure head `c775aac8a97a6782915782ed2118c3018cfe5a1a`;
- final pre-merge Release Acceptance Gates **#642 — SUCCESS**;
- PR #19 merge commit on `main`: `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`;
- post-merge Release Acceptance Gates **#643 — SUCCESS**.

The owner subsequently gave the explicit instruction **«أبدأ P6.4»**. P6.4 was
implemented from the verified post-PR20 baseline
`35fda15508973340669220a20ee1c5bf6bbaa39a` / CI **#651 SUCCESS**.

P6.4 implementation head `bd73fa0f6aa4cfd9c1d415c915f0ad35bd4c3476`
passed Release Acceptance Gates **#653 — SUCCESS**. The current documentation
head `59d19a96c6a7af443429d8ba7585386d4f491dee` passed **#661 — SUCCESS**,
after which the owner reported all six manual tests **6/6 PASS**.

P6.4 is **CLOSED + MERGED** through PR #21. Post-PR21 reconciliation PR #22 was
subsequently merged to `main @ ba44ae59410e02ae748b235ed9792c8d4ee31b02`;
its exact final PR head `a76fcff0ac7ad366143645ad722ff5d91183561e`
passed Release Acceptance Gates **#671 — SUCCESS** before merge.

On 2026-09-21 the owner approved the expanded roadmap documented in
`docs/ROADMAP_ARCHITECTURE_AMENDMENT_2026-09-21.md`. That documentation/
architecture amendment is **CLOSED + MERGED**. Initial verification head
`cb4b4681bd359e29b08542856b7bff144a239796` passed Release Acceptance Gates
**#673 — SUCCESS**; exact final head `c73ca4cdd41b2e3cd745df5412be30a44d2bda9c`
passed **#676 — SUCCESS**; PR #23 merged at
`de2cf9b0a8a48a788323373eb2b9c72622c288f8` by explicit owner authorization.
Post-PR23 documentation reconciliation is **CLOSED + MERGED** through PR #24.
Its exact final head `2c3b12ceabdf374d587c96f49f23d097de8d8d1d` passed Release Acceptance Gates
**#684 — SUCCESS** and merged to `main @ fc42af3cd97706ddc3f92b44f7e784ba86fc7536`.
The owner then explicitly instructed **«ابدأ P6.5»**. P6.5 is now **CLOSED** after exact tested head `a733f81d922963a385357becf69dafd8b6d576be` passed Release Acceptance Gates **#691 — SUCCESS** and the owner reported **6/6 manual PASS**. PR #25 was subsequently merged into `main @ bdff76e765c78108e96fd0e644df850be22f8eed` by separate explicit owner authorization. The separately approved future astronomy addendum is documented in `docs/ROADMAP_ASTRONOMY_ARCHITECTURE_AMENDMENT_2026-09-21.md`; it is **CLOSED / VERIFIED + MERGED** through PR #27 after exact final head `8d84c2e83a148a359fd0d75da7e5f3b21570ac22` passed Release Acceptance Gates **#726 — SUCCESS**. Post-PR27 reconciliation was then **CLOSED + MERGED** through PR #28: initial verification `018e6a7984dcf682e94f36668333ea00ccbaf085` / #738 SUCCESS, final head `8f6b69c90148e0c5e9200ebab2dfab88ed0f5789` / **#744 SUCCESS**, merge baseline `main @ a96f47b95c542c2eafb21771bc7c53e7ab40d170`. The post-PR28 reconciliation is **CLOSED + MERGED** through PR #29: initial head `3e23d2074a65ce6422e378b7a62211627157c968` passed Release Acceptance Gates **#753 — SUCCESS**; exact final head `7751e76c1d3fe3e8c129436717042a49040ead4b` passed **#754 — SUCCESS**; merge baseline is `main @ 8ac38042050f24c0ec30e30b32d37cd1900abf92`. The post-PR29 reconciliation is **CLOSED + MERGED** through PR #30. Its initial verification head `0ccd24dbbc665c81dfa8cddec82ffde4ca9ef448` passed Release Acceptance Gates **#758 — SUCCESS**; exact final head `14c69a8cb1aaae2b375803e6400efe24aa83fd03` passed **#759 — SUCCESS** and merged to `main @ 1c64285b92c093365b74f3256aa9557b9a48268e`. The owner then instructed **«ادمج PR #30 وابدأ P6.6»**. P6.6 is therefore **IN PROGRESS** on `feat/p6.6-polygon-perimeter-area`; P6.7A and P6.7B remain **NOT STARTED**. No astronomy/observer/aviation/high-detail-map implementation, tag, GitHub Release or deployment is implied.
