# Gleason-platform — FUTURE PHASES EXECUTION REFERENCE
Last reconciled: 2026-09-23

## Purpose

This file expands the approved roadmap into an execution-oriented future plan.

Important distinction:
- The **phase scopes** below come from the approved roadmap/current architecture.
- The detailed sub-slice numbering proposed below is an **operational execution
  breakdown for continuity**, not a claim that every sub-slice has already been
  separately approved or started.
- At the start of each future phase, confirm the exact slice boundaries with the owner
  before implementation.

## A. Remaining Phase 6 sequence

### P6.C3 — Calibration & Fixture Laboratory
Current status: IN PROGRESS.

#### P6.C3-R1 — Fix current proxy identity regression
- correct rendered `data-p6c3-visual-reference`;
- keep current 1361×2048 proxy identity;
- do not change CRS/exact-pairing gates;
- run focused local/core checks.

#### P6.C3-R2 — Full automated regression
- complete Release Acceptance Gates;
- browser/offline/mobile/Arabic/English;
- backend/frontend parity;
- Docker/PostGIS/Redis/source gates;
- no targeted owner test until full CI is green.

#### P6.C3-R3 — Targeted owner retest
Verify only the affected refinement:
- current proxy identity/hash/dimensions;
- historical ruler identities;
- JGW affine metre presentation;
- statute-mile/nautical-mile explicit conversions;
- Figure-43 generic mile remains unresolved;
- CRS and exact pixel pairing remain gated.

#### P6.C3-R4 — Closure
- owner result recorded exactly;
- closure-state docs;
- full closure CI;
- separate merge authorization;
- merge PR #39;
- reconcile new main baseline.

### P6.C4 — Ellipsoidal Elevation Provider
Approved scope: NOT STARTED.

Operational breakdown proposal:

#### P6.C4.1 — Elevation contract
Define versioned `ElevationProvider` fields:
- latitude/longitude;
- orthometric height;
- geoid undulation;
- ellipsoidal height;
- vertical datum;
- dataset/provider/version;
- resolution/uncertainty;
- retrieval timestamp;
- availability/failure state.

#### P6.C4.2 — Provider evaluation
- evaluate at least one real provider;
- document license/rate limits/coverage/resolution;
- determine online/offline/cache capability;
- no provider becomes default without explicit provenance.

#### P6.C4.3 — WGS84 ECEF integration
- convert only when ellipsoidal height is available or explicitly derived from
  orthometric height + geoid undulation;
- do not silently use `h=0`;
- show height source in inspector.

#### P6.C4.4 — Cache/failure semantics
- cache key/version/time;
- stale data policy;
- offline behavior;
- provider-unavailable fail-closed behavior.

#### P6.C4.5 — UI + parity + tests
- bilingual provenance display;
- known benchmark points;
- backend/browser contract tests;
- manual checklist;
- closure CI and separate merge authorization.

### P6.C5 — Map-First Comparison Workspace
Approved scope: NOT STARTED.

#### P6.C5.1 — Workspace state contract
Preserve:
- canonical selection;
- ordered route;
- selected computation identity;
- model/view identity;
- independent cameras.

#### P6.C5.2 — Desktop single-map mode
- one dominant large map;
- collapsible inspector/results;
- minimal obstruction of map.

#### P6.C5.3 — Desktop 50/50 comparison
- two maps side-by-side;
- choose model pair;
- shared geographic selection, independent projections/cameras;
- no fake zoom equivalence.

#### P6.C5.4 — Mobile layout
- map tabs;
- collapsible bottom/side inspector;
- touch/keyboard accessibility.

#### P6.C5.5 — Laboratory integration
- route/measurement cards;
- Gleason calibration/profile controls;
- explicit source/method/limitations;
- preserve computation identity when viewed on another model.

#### P6.C5.6 — Regression/owner acceptance
- desktop/mobile;
- Arabic/English;
- offline;
- WebGL fallback;
- route/selection persistence boundaries;
- closure CI and explicit owner merge authorization.

### P6.7B — RouteProvider & Turn-by-Turn
Paused until P6.C1–P6.C5 are closed.

#### P6.7B.1 — RouteProvider contract
Separate navigation route from measurement polyline.

Fields:
- provider/version;
- travel mode;
- canonical geometry;
- waypoints;
- legs;
- maneuvers;
- provider distance;
- duration/ETA;
- provenance;
- capability/error state.

#### P6.7B.2 — Provider evaluation
Valhalla is a candidate to evaluate, not a pre-committed dependency.
Evaluate:
- routing modes;
- local deployment;
- licensing;
- offline/regional support;
- language/instruction support;
- performance.

#### P6.7B.3 — Route rendering
Render the same provider geometry independently on:
- Gleason;
- AE;
- WGS84.

Provider distance remains provider distance.

#### P6.7B.4 — Maneuver UX
- turn-by-turn list;
- legs;
- waypoint reordering;
- rerouting;
- unsupported-mode errors.

#### P6.7B.5 — Acceptance
- navigation route never silently substitutes for measurement polyline;
- provider distance/time identity visible;
- attribution visible;
- failure states explicit;
- automated + owner manual closure.

### P6.8 — Navigation / Longitude Laboratory
Approved future scope.

Suggested execution breakdown:
- P6.8.1 source registry + historical claims;
- P6.8.2 longitude/time relationships;
- P6.8.3 modern reference calculations;
- P6.8.4 side-by-side comparison without hidden conversions;
- P6.8.5 reproducible fixtures and export;
- P6.8.6 acceptance.

### P6.9 — Gleason Original Mode
Approved future scope.

Required source-grounded components:
- 24-hour dial;
- radiating arms;
- historical longitude/time representation;
- explicit page/figure citation per historical element;
- modern helper values labeled DERIVED;
- no fabricated scan control points.

Suggested execution:
- P6.9.1 source transcription registry;
- P6.9.2 historical overlay geometry;
- P6.9.3 24-hour dial;
- P6.9.4 longitude/time calculator;
- P6.9.5 source inspector;
- P6.9.6 regression/manual acceptance.

### P6.10 — Phase 6 Regression & Acceptance Package
Must cover:
- browser;
- offline;
- Arabic/English;
- mobile;
- poles;
- antimeridian;
- route edits;
- model-specific units;
- quantity/method provenance;
- same-route identity;
- RouteProvider vs measurement identity;
- missing/ambiguous inputs;
- historical source visibility;
- persistence boundaries.

Whole Phase 6 acceptance requires a separate explicit owner decision.

---

## B. Separate research lane — 12,720.6-km azimuthal test profile
Status: RESEARCH ONLY / NOT RUNTIME.

Current formula:
`r_km = 12720.6 × (90 - latitude) / 180`

Plan for disciplined research:

### R-AZ.1 — Freeze experiment identity
Proposed research id:
`gleason-azimuthal-test-12720_6km-v1`

Record:
- formula;
- exact scale;
- coordinate conventions;
- chord method;
- city coordinates;
- comparison sphere definition;
- timestamp/source snapshot.

### R-AZ.2 — Build standardized test matrix
Include:
- same-meridian north/north;
- same-meridian south/south;
- east/west at several latitudes;
- north↔south mixed routes;
- southern long-haul routes;
- northern long-haul routes;
- near-antimeridian routes;
- near-polar routes;
- multi-leg routes.

### R-AZ.3 — Record both quantities separately
For every fixture:
- test-projection chord;
- WGS84/spherical reference quantity;
- absolute difference;
- percentage difference;
- never normalize one to match the other.

### R-AZ.4 — Visual route evidence
Plot endpoints and segment on the experimental map and keep an exportable fixture
record.

### R-AZ.5 — Evaluate historical relation
Compare observed test behavior with:
- Figure 43 local longitude scale;
- Chapter XVII 6075-ft interpretation;
- Figure 37 ratio;
- Chapter XIX 6070-ft interpretation;
- map ruler observations.

### R-AZ.6 — Promotion decision
Do not replace the current runtime Gleason engine automatically.
If the owner later approves promotion:
- add as a separately named profile;
- preserve the old profile for regression;
- write a migration/semantics amendment;
- run full parity/fixtures/manual acceptance.

---

## C. Phase 7 — Reference Lines, Grid, Compass, Azimuth

Approved roadmap scope:
equator, tropics, grid, compass and azimuth.

Operational breakdown proposal:

### P7.1 — Geographic reference layers
- Equator;
- Tropic of Cancer;
- Tropic of Capricorn;
- Arctic/Antarctic circles if included by the approved reference-line scope;
- explicit source/definition.

### P7.2 — Latitude/longitude grid
- configurable interval;
- labels;
- antimeridian/pole behavior;
- independent projection per model.

### P7.3 — Compass/reference-north semantics
Distinguish:
- true north;
- magnetic north when a magnetic provider exists;
- screen/map north.

Never conflate them.

### P7.4 — Azimuth/bearing tools
- explicit start/end points;
- method identity;
- WGS84 reference vs projected/model-native direction;
- units and wrap conventions.

### P7.5 — Acceptance
- local/offline deterministic layers;
- poles/antimeridian;
- bilingual/mobile;
- clear north semantics.

---

## D. Phase 8 — Qibla Direction Engine

Approved roadmap scope:
Qibla engine + comparison lines.

Suggested breakdown:

### P8.1 — Reference target/source
- versioned Kaaba reference coordinates;
- source/provenance.

### P8.2 — WGS84 reference method
- geodesic initial bearing;
- distance;
- reference implementation/tests.

### P8.3 — Model rendering/comparison
- render reference direction on WGS84/Gleason/AE;
- preserve computation identity.

### P8.4 — Optional model-native comparison
Only if separately defined and sourced.

### P8.5 — Offline + acceptance
- deterministic/offline;
- polar/antimeridian edge cases;
- source/method visible.

---

## E. Phase 9 — Astronomy / Time / Observer Foundations

Approved scope:
source registry, ObserverContext, TimeContext, provider architecture.

Suggested breakdown:

### P9.1 — TimeContext
- UTC/local time;
- timezone identity;
- time scale;
- selected date/time;
- reproducibility.

### P9.2 — ObserverContext
- selected geographic observer;
- current-location/pin workflows where available;
- elevation provenance;
- observer identity separate from map camera.

### P9.3 — Celestial source registry
Register:
- modern reference providers;
- historical recurrence sources;
- Shane Personal Celestial Sphere;
- Walter comparative algorithms;
- model-native future methods.

### P9.4 — `CelestialComputationProvider`
Capabilities, frame, epoch/time scale, observer inputs, output semantics.

### P9.5 — `EclipsePredictionProvider`
Separate modern prediction from historical recurrence/comparative methods.

### P9.6 — Validation fixtures
Known celestial events/positions and provider capability matrix.

---

## F. Phase 10 — Celestial Motion, Day/Night, Twilight, Analemmas

Approved scope:
Sun/Moon/planet motion, day/night, twilight, sunrise/sunset, analemmas,
comparative astronomy overlays.

Suggested breakdown:

- P10.1 Sun apparent position
- P10.2 Moon apparent position
- P10.3 planets/zodiac definition and source choice
- P10.4 day/night/twilight boundaries
- P10.5 sunrise/sunset/event times
- P10.6 solar analemma
- P10.7 lunar analemma if defined by approved provider
- P10.8 comparative overlays
- P10.9 regression/acceptance

Rule:
same time + same observer + same quantity before numerical comparison.

---

## G. Phase 11 — Observer Dome / Observation Laboratory

Approved scope:
`ObserverCelestialSphere`, observer dome, Personal Celestial Sphere comparison.

Suggested breakdown:

- P11.1 local Alt/Az frame
- P11.2 observer dome renderer
- P11.3 horizon/cardinal directions
- P11.4 celestial object tracks
- P11.5 Shane comparative adapter
- P11.6 Walter comparative adapter
- P11.7 separation from `PhysicalHeavensModel`
- P11.8 mobile/interaction/acceptance

The mathematical/visual observer dome must not be presented as a physical-heavens
measurement claim.

---

## H. Phase 12 — Eclipse Laboratory

Approved scope:
modern reference + historical 223-month/Saros + Shane/Walter comparative +
future model-native methods.

Suggested breakdown:

- P12.1 modern eclipse reference provider
- P12.2 Saros-series metadata
- P12.3 Babylonian 223-month historical recurrence context
- P12.4 top/global view
- P12.5 observer-local visibility view
- P12.6 comparative provider panel
- P12.7 path/time/classification differences
- P12.8 validation matrix

Historical recurrence must not be relabeled as a precise modern local eclipse path.

---

## I. Phase 13 — Rivers, Elevation, Terrain

Approved scope:
river geometry, flow direction, elevation profiles, terrain.

Suggested breakdown:

- P13.1 real river geometry source
- P13.2 flow-direction semantics
- P13.3 terrain/DEM provider
- P13.4 elevation profile along route/river
- P13.5 datum/provenance
- P13.6 offline/cache strategy
- P13.7 acceptance

Current point datasets must not be misrepresented as river paths.

---

## J. Phase 14 — Submarine Cables

Approved scope:
cables, landing stations and analysis.

Suggested breakdown:
- P14.1 source/license audit
- P14.2 landing-station catalog
- P14.3 cable geometry
- P14.4 route/length semantics
- P14.5 comparison/export
- P14.6 acceptance

Approximate planning geometry must remain distinct from verified measured cable route.

---

## K. Phase 15 — Aviation Laboratory

Approved scope:
live/historical/scheduled aviation + metadata + receiver provenance + MSL/AGL.

Suggested breakdown:

### P15.1 — Provider contracts
Live/historical/scheduled states explicitly separated.

### P15.2 — Aircraft/flight metadata
Callsign, aircraft, origin/destination where sourced.

### P15.3 — Track geometry
Observed track stays observed; do not fabricate missing trajectory.

### P15.4 — Altitude semantics
MSL vs AGL vs pressure/barometric altitude when available.

### P15.5 — Receiver/source provenance
Receiver/source does not automatically equal ATC tower.

### P15.6 — Comparative flight planning
Reuse only explicitly sourced waypoint/course/leg fields.

### P15.7 — Acceptance
Freshness, source, errors, offline limitations, mobile performance.

---

## L. Phase 16 — External Layers / High-Detail Map Data

Approved scope:
streets, buildings, cities, vector tiles, external providers, offline regional packs.

Suggested breakdown:
- P16.1 `ExternalLayerProvider` contract
- P16.2 renderer benchmark/spike
- P16.3 streets
- P16.4 buildings
- P16.5 city-level labels/details
- P16.6 vector tiles
- P16.7 regional offline packs
- P16.8 attribution/license/freshness UI
- P16.9 performance regression

Canonical geographic data is stored once; each model projects independently.

---

## M. Phase 17 — Advanced Comparison & Experiment Notebook

Approved scope:
advanced comparison + durable reproducible experiments.

Suggested breakdown:

### P17.1 — Experiment schema
Persist:
- geographic selection/route;
- model versions;
- method/profile;
- source snapshot;
- observer/time/provider identities;
- relevant UI state.

### P17.2 — Experiment ID / URL
Reopen the same experiment deterministically.

### P17.3 — Research notebook
Notes, fixture results, comparisons, attachments/export metadata.

### P17.4 — Durable route/experiment persistence
This is where durable saved routes/experiments belong, not temporary P6 route state.

### P17.5 — Provider retirement behavior
Unknown/retired provider fails clearly rather than silently changing method.

### P17.6 — Research/Presentation modes
Prepare integration with Phase 18 export.

---

## N. Phase 18 — Final UX / Responsive / Presentation / Export

Approved scope:
desktop/mobile/tablet, Research/Presentation, high-resolution export and 9:16.

Suggested breakdown:
- P18.1 desktop workspace polish
- P18.2 tablet layout
- P18.3 mobile navigation/tabs
- P18.4 accessibility/keyboard/touch
- P18.5 Research mode
- P18.6 Presentation mode
- P18.7 high-resolution exports
- P18.8 9:16/TikTok-oriented export
- P18.9 bilingual/RTL visual QA

Exports must retain source/time/model/method identities.

---

## O. Phase 19 — Performance, Stability, Security, Storage

Approved scope:
budgets and graceful degradation.

Suggested breakdown:
- P19.1 bundle/load budgets
- P19.2 GPU buffer/program reuse
- P19.3 WebGL context loss/recovery
- P19.4 fallback quality levels
- P19.5 memory/frame-time benchmarks
- P19.6 vector-tile/astronomy/aviation/routing load tests
- P19.7 offline/cache/storage limits
- P19.8 security/dependency review
- P19.9 long-session stability

Budgets must be measured on documented devices/configurations.

---

## P. Phase 20 — Comprehensive Validation

Approved scope:
whole-system validation + astronomy provider matrix.

Suggested breakdown:
- P20.1 geographic/measurement regression matrix
- P20.2 route/provider regression
- P20.3 offline/bilingual/mobile matrix
- P20.4 celestial position validation
- P20.5 sunrise/sunset/day-night validation
- P20.6 eclipse validation
- P20.7 Saros replay validation
- P20.8 aviation/provider validation
- P20.9 unsupported-field matrix
- P20.10 reproducibility audit

Do not produce an overall “winner” across models/providers; report differences and
limitations.

---

## Q. Phase 21 — Final Documentation

Approved scope:
final verification/editing of:
- User Guide
- Developer Guide
- Calculation Reference
- source/license documentation
- offline behavior
- reproducibility

The guides are living documents earlier; Phase 21 finalizes them against actual
implemented behavior.

Suggested breakdown:
- P21.1 user guide audit
- P21.2 developer guide audit
- P21.3 calculation reference audit
- P21.4 provider/source/license appendix
- P21.5 offline/recovery guide
- P21.6 reproducible research guide
- P21.7 final screenshot/example refresh

---

## R. Phase 22 — v1.0 Release

Approved scope:
v1.0.0 and production release only after complete gates and explicit authorization.

Suggested breakdown:
- P22.1 release candidate freeze
- P22.2 full CI/validation rerun
- P22.3 license/source audit
- P22.4 backup/rollback plan
- P22.5 web/PWA deployment readiness
- P22.6 mobile package readiness if signing/accounts are available
- P22.7 explicit owner release authorization
- P22.8 tag/release/deployment
- P22.9 post-release smoke/monitoring

No tag, GitHub Release or deployment is implied by completing earlier phases.

---

## S. Cross-phase invariants

Every future phase must preserve:
1. canonical geographic state, not screen-pixel coupling;
2. independent model engines;
3. computation identity != visualization identity;
4. no hidden normalization;
5. explicit source/version/license/provenance;
6. fail-closed unknowns;
7. Arabic/English and RTL/LTR;
8. mobile + keyboard + touch accessibility;
9. offline semantics where supported;
10. reproducibility and versioned contracts;
11. owner manual PASS only when explicitly reported;
12. separate merge/release authorization.