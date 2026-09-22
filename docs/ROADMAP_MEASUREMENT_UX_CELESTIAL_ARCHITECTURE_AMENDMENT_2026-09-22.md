# Roadmap & Architecture Amendment — Gleason Measurement, Map-First Comparison, Elevation, Observer Dome & Optics — 2026-09-22

Status: **CLOSED / VERIFIED — #832 SUCCESS — AWAITING SEPARATE MERGE AUTHORIZATION**

Owner approval:
**«انا اعتمد هذه الخارطة، أبدأ أولًا بإنشاء وثيقة Architecture Amendment رسمية على GitHub تجمع هذه القرارات والمعادلات ومصادرها، ثم نبدأ P6.C1 منها.»**

Baseline:
- `main @ cd78f560c5070d3f525ddaf124c5fb5ec4d25c52`;
- PR #34 / P6.7A is merged at that commit;
- exact owner-tested P6.7A head:
  `a11f7263cf42880ce0309c49f79ba45c29d78323`;
- P6.7A pre-manual Release Acceptance Gates: **#821 — SUCCESS**;
- owner manual verification: **6/6 PASS — REPORTED BY OWNER**;
- P6.7A closure head:
  `8b60cac42431947b52950c9e8b9d920ca46ebd5b`;
- P6.7A closure Release Acceptance Gates: **#829 — SUCCESS**;
- PR #34 merge commit:
  `cd78f560c5070d3f525ddaf124c5fb5ec4d25c52`;
- no independent post-merge push CI is claimed;
- accepted phase remains **Phase 5**;
- accepted application version remains **v0.5.0**;
- implementation phase remains **Phase 6 / IN PROGRESS**;
- P6.7B is deliberately **PAUSED / NOT STARTED** until the corrective slices below are completed.

This amendment changes roadmap, numerical semantics, source hierarchy and future
provider contracts. It does **not** itself change a production numerical engine,
implement a DEM/elevation service, change the user interface, implement astronomy,
or start P6.7B.

## 1. Why this amendment exists

Owner review of the current application exposed two coupled problems:

1. Gleason measurement outputs are technically traceable but not sufficiently
   useful to a user who needs metres/kilometres and an explicit explanation of
   how those values relate to the historical map/book/video evidence.
2. The application gives long result panels too much screen priority and does not
   yet provide the requested map-first one/two-model comparison workspace.

A third requirement is added at the same boundary:

3. WGS84 ECEF inspection must obtain a real ellipsoidal height from a named
   elevation/geoid source when possible instead of silently inventing `h=0`.

The owner additionally required the project to study Walter Bislin's open web
material for reusable equations/algorithms involving flat-plane distance,
projection mappings, flight planning, observer-dome rendering and optical
refraction. Walter is registered here as an **external comparative/open
algorithm source**, not as Gleason's historical authority and not as sole
validation truth.

## 2. Non-negotiable identity rules

The existing **No Hidden Normalization** and
**computation identity != visualization identity** rules remain.

This amendment adds:

### 2.1 Four source classes for measurement work

- **GLEASON_PRIMARY_HISTORICAL** — Gleason book/map evidence.
- **OWNER_SECONDARY_OBSERVED** — owner-supplied measurement videos and audited
  map/raster observations.
- **EXTERNAL_COMPARATIVE_MODEL** — Walter Bislin formulas/apps and similar
  external comparison implementations.
- **REFERENCE_SOURCE** — WGS84/PROJ/GeographicLib/DEM/geoid providers and other
  modern reference systems.

A value must expose which class produced or justified it.

### 2.2 Model result vs SI presentation

A method-native quantity may have an SI presentation only when the conversion
basis is explicit and versioned.

Example:
- `gleason-native-normalized` may remain NRU;
- a separate profile may present an SI estimate;
- displaying kilometres must not silently relabel the computation as WGS84 or AE.

### 2.3 Source-derived vs assumption-derived

The UI and data contract must distinguish:
- `DOCUMENTED`;
- `DERIVED_FROM_DOCUMENTED`;
- `SECONDARY_OBSERVED`;
- `EXTERNAL_COMPARATIVE`;
- `ASSUMPTION_PROFILE`;
- `REFERENCE_RESULT`.

### 2.4 Unknown historical unit identity fails closed

Figure 43 says "longitude in miles" and gives 60 at the Equator, but the figure
itself does not independently state that every such "mile" is the same unit as
the nautical/sea/Solar mile defined elsewhere in Chapter XVII.

Therefore P6.C1 must audit the contextual unit identity before a Fig.43 mile is
automatically converted to SI. If the unit identity cannot be demonstrated, the
SI conversion is exposed only as an explicitly named assumption profile.

## 3. Verified Gleason historical basis relevant to P6.C1

Primary registry:
`data/sources/gleason-book.yaml`.

### 3.1 Figures 37–38 — miles, longitude and time

The registered book text states:
- 208 English miles correspond to 180 nautical/sea/geographical miles;
- 15° longitude correspond to 1 hour;
- 1° longitude corresponds to 4 minutes;
- 1 minute of arc corresponds to one mile in the table context;
- English/statute mile: 5280 feet;
- nautical/sea/Solar mile: 6075 feet;
- the circular map has a 24-hour time dial and radiating arms.

This is historical source evidence. A modern SI conversion using the
international foot is a **derived presentation conversion**, not text printed by
Gleason.

### 3.2 Figure 43 — latitude-dependent longitude scale

Figure 43 is registered as a source for longitude-mile spacing by latitude. The
project's current reconstruction is:

`historical_longitude_miles_per_degree(latitude_deg) = 60 - (2/3)*latitude_deg`

with south latitude represented by negative latitude, which increases the value
south of the Equator.

This is a **local longitude-scale rule**. It is not automatically a general
arbitrary-slanted-segment distance law.

### 3.3 Current circle-derived profile is demoted

The current profile:

`gleason-fig43-circle-derived`

uses the derived relation:

`1 NRU = 21600/pi ≈ 6875.493541569879 historical Fig.43 miles`.

This profile is retained for diagnostics and regression but is no longer the
preferred universal Gleason route-distance presentation.

New classification:

`gleason-fig43-circle-derived-diagnostic`

Evidence:
`DERIVED_FROM_DOCUMENTED`.

It must not be used as the only basis for a user-facing "real distance" claim.

### 3.4 Existing radial-60 profile

`gleason-radial-60nm-legacy` remains comparison-only.

It may be used as one fixture/profile in P6.C1/P6.C3 because it preserves the
historically important radial 60-per-degree idea, but its exact source identity
must remain explicit.

## 4. Walter Bislin comparative model audit adopted by this amendment

Planning registry:
`data/sources/walter-bislin-comparative-models.yaml`.

Walter's pages are used as open comparative algorithm sources. His conclusions
or model judgments are not adopted as project conclusions.

### 4.1 Flat-plane distance profile

From "Distances on Globe and Flat Earth":

`r_i = (1 - latitude_i/90°) * E`

with default:

`E = 10008 km`

then:

`x_i = r_i * cos(longitude_i)`

`y_i = r_i * sin(longitude_i)`

and straight-plane distance:

`L = sqrt((x2-x1)^2 + (y2-y1)^2)`.

Equivalent law-of-cosines form is retained in the source registry.

For the project's normalized Gleason radial rule:

`rho = (90 - latitude_deg)/180`

the Walter default implies the presentation scale:

`1 NRU = 2E = 20016 km`.

This becomes a distinct external profile:

`walter-flat-plane-eq-10008`

classification:
`EXTERNAL_COMPARATIVE`.

It must never be relabeled as a Gleason book rule.

### 4.2 Local east/west stretch diagnostic

Walter's GPS math page gives:

`k(latitude) = (pi/2 - latitude_rad) / cos(latitude_rad)`.

This is registered as an external comparative local-distortion diagnostic. P6.C3
may expose it beside radial/tangential scale analysis.

### 4.3 Globe/flat domain mapping

Walter's transformation page explicitly distinguishes:
- coordinate transformation inside one geometry/domain;
- projection/mapping between geometrically different domains.

The project adopts that architectural distinction.

Reserved `CoordinateDomain` values:

- `WGS84_ELLIPSOID`;
- `AE_PLANE`;
- `GLEASON_NORMALIZED_PLANE`;
- `WALTER_SI_FLAT_PLANE`;
- `GLEASON_RASTER_PIXEL`;
- `OBSERVER_DOME`;
- `CELESTIAL_REFERENCE`.

No vector length/direction is assumed preserved across a domain projection.

### 4.4 Comparative flight-planner concepts

Walter's flight-plan app separates:
- waypoint line;
- navigation path from courses/leg distances;
- globe Great Circle reference.

Useful fields registered for future Phase 15:
- WP;
- CRS;
- LegDist;
- DTG;
- TTA;
- TAS;
- FF;
- FOB.

These are design inputs only. The project's future flight tool remains a
comparative/research laboratory and must not be represented as operational
flight navigation.

## 5. New Gleason measurement profile architecture

P6.C1 must define a versioned profile contract.

Minimum fields:

```text
profile_id
profile_version
calculation_space
source_class
evidence_level
native_unit
si_conversion_status
si_unit
scale_rule
direction_dependency
latitude_dependency
provenance[]
limitations[]
fixture_set_version
```

Required initial profiles:

### 5.1 `gleason-book-historical`

Goal:
preserve book/map historical quantities and convert to SI only where the unit
identity is documented.

Outputs may include:
- historical source quantity;
- metres;
- kilometres;
- nautical miles;
- conversion basis;
- evidence classification.

If Fig.43 mile identity remains unresolved, the source quantity remains primary
and SI conversion must be an explicitly labeled assumption profile.

### 5.2 `walter-flat-plane-eq-10008`

External comparison:
- north-pole-to-equator = 10008 km;
- Euclidean chord in Walter's flat-plane geometry;
- metres/kilometres available directly;
- never labeled Gleason historical.

### 5.3 `gleason-video-ruler-calibrated`

Uses the five registered video fixtures and any later owner-approved ruler
fixtures.

It is empirical/secondary and must expose:
- fixture IDs;
- fitted parameters;
- residuals;
- validity region;
- uncertainty.

### 5.4 `gleason-raster-calibrated`

Uses the historical raster/map itself.

Exact-pixel calibration is gated by:
- original unresampled high-resolution raster bytes;
- exact hash/dimensions;
- verified JGW pairing or an independently documented calibration;
- circle/grid/ruler residual report.

PR #35 is an independent source-ingestion effort. P6.C1 may define this profile
before PR #35 merges, but runtime promotion must fail closed until its required
source evidence is present on `main`.

### 5.5 Diagnostic legacy profiles

Retain, visibly labeled:
- `gleason-fig43-circle-derived-diagnostic`;
- `gleason-radial-60nm-legacy`.

They are useful for regression and comparison but are not the sole preferred
user-facing route-distance result.

## 6. New user-facing measurement contract

A Gleason result card should prioritize a concrete value only when its profile
supports that unit.

Preferred presentation:

```text
Gleason — <profile name>
Distance: <km>
Distance: <m>
Historical/native quantity: <value + native unit>
Source/evidence: <class>
Scale rule: <rule>
Residual/uncertainty: <when available>
```

NRU and diagnostic details remain available under technical details.

The application must never display a kilometre value without displaying or
linking the scale/conversion profile that produced it.

## 7. Calibration & fixture laboratory

A new `GleasonCalibrationLaboratory` is approved.

It will compare, fixture by fixture:

- Gleason book examples;
- five registered owner videos;
- Walter formulas;
- owner historical map/raster measurements;
- selected modern reference pairs for residual analysis.

Each fixture records:

```text
fixture_id
endpoints
source_distance
source_unit
source_class
profile_prediction
prediction_unit
residual_absolute
residual_percent
latitude_context
direction_context
notes
```

The laboratory must not pick an overall political/scientific "winner". It
reports profile behavior and residuals.

## 8. Ellipsoidal-height architecture for WGS84

The existing fail-closed WGS84 behavior is correct: ECEF must not silently assume
`h=0`.

Reserve:

### `ElevationProvider`

Returns, where available:

```text
latitude
longitude
orthometric_height_m
geoid_undulation_m
ellipsoidal_height_m
vertical_datum
dataset
resolution_m
provider
timestamp/version
uncertainty/status
```

Relation when the source contract supports it:

`ellipsoidal_height h = orthometric_height H + geoid_undulation N`.

Candidate providers to verify at implementation time:
- Copernicus DEM / Sentinel Hub;
- OpenTopography point elevation datasets with ellipsoidal variants;
- local DEM + PROJ geoid grids for offline/regional mode.

Provider API keys must stay server-side.

No provider is production-pinned by this architecture amendment alone.

## 9. Map-first comparison workspace

Approved interaction contract:

### Desktop / wide screens

Top model selector:
- Gleason Historical;
- Azimuthal Equidistant;
- WGS84 Reference.

Modes:
- `single`;
- `compare-two`.

Single:
- selected map fills the comparison workspace.

Compare-two:
- two selected models share the viewport 50/50 with a vertical divider;
- both remain large enough for direct visual comparison;
- canonical geographic selection and route state remain shared;
- camera/zoom synchronization is opt-in, not silently forced across unlike
  projections.

### Mobile

- one active map at a time;
- tabs switch between the selected comparison models;
- no unusable two-column squeeze.

### Inspector

Long numerical panels move into a collapsible bottom/side inspector. The map is
the primary visual object.

This work is P6.C5, not final Phase 18 polish.

## 10. Observer dome and optics architecture amendment

The prior astronomy roadmap remains valid but is refined.

### 10.1 Provider split

Reserve:

- `CelestialEphemerisProvider`;
- `DomeProjectionProvider`;
- `ObserverOpticsProvider`;
- `ObserverViewRenderer`.

Pipeline:

```text
CelestialEphemerisProvider
  -> CelestialReferenceState
  -> DomeProjectionProvider
  -> ObserverOpticsProvider
  -> ObserverViewRenderer
```

### 10.2 Observer dome != physical heavens model

`ObserverDome` is an observer-centered visualization/projection contract.

It must remain separate from any future `PhysicalHeavensModel` claim.

### 10.3 Physical refraction vs synthetic ray mapping

Walter's terrestrial-refraction pages and Walter's FE-Dome Bezier light bending
must not be merged into one provider.

Reserve:

- `TerrestrialRefractionProvider`;
- `AstronomicalRefractionProvider`;
- `SyntheticObserverRayMapping`.

Walter explicitly states that his terrestrial refraction calculator is not for
astronomical refraction, and his FE-Dome page describes adjustable Bezier light
paths. These remain separate evidence/method classes.

### 10.4 Future celestial rendering

Reference celestial state may later provide:
- Sun;
- Moon;
- planets;
- stars;
- reference frames/time;
- topocentric azimuth/elevation.

A dome projection may render that state without relabeling it as a native
Gleason astronomy calculation.

## 11. Revised Phase 6 execution order

P6.7B is paused.

New corrective sequence:

### P6.C1 — Gleason Measurement Re-evaluation

Deliver:
- versioned measurement-profile contract;
- source/evidence hierarchy;
- demote circle-derived profile to diagnostic;
- add Walter external SI profile specification;
- audit Fig.43 mile unit identity;
- define book/video/raster profile semantics;
- define SI-conversion fail-closed rules;
- fixtures and tests for formulas/contracts;
- no UI redesign yet.

### P6.C2 — Gleason SI Measurement Engine

Deliver:
- executable profiles approved by P6.C1;
- metre/km/NM output where justified;
- profile provenance in API/browser result;
- browser/backend parity;
- no hidden normalization.

### P6.C3 — Calibration & Fixture Laboratory

Deliver:
- book/video/Walter/raster/reference fixtures;
- residual/error reports;
- local scale/distortion diagnostics;
- profile-selection UI for research.

### P6.C4 — Ellipsoidal Elevation Provider

Deliver:
- provider contract;
- at least one verified online implementation;
- explicit vertical datum;
- WGS84 ellipsoidal height;
- ECEF integration;
- cache/offline/failure semantics.

### P6.C5 — Map-First Comparison Workspace

Deliver:
- single full workspace map;
- two-map 50/50 comparison;
- model selector;
- mobile tabs;
- inspector drawer;
- no loss of selection/route/computation identity.

After P6.C1–P6.C5 close:
- resume P6.7B RouteProvider / turn-by-turn;
- continue P6.8–P6.10.

## 12. Revised future phase notes

### Phases 9–10

Strengthen provider separation:
- reference ephemeris;
- time/observer context;
- celestial state;
- projected-reference day/night;
- model-native rules only when separately defined.

### Phase 11

Observer Dome / Observation Laboratory now explicitly uses the provider split in
Section 10.

### Phase 12

Eclipse Laboratory preserves event provider identity and observer optics identity.

### Phase 15

Aviation Laboratory adds a comparative waypoint/flight-plan mode inspired by the
registered Walter app concepts, clearly separated from operational navigation
and from observed ADS-B tracks.

### Phases 17–18

Advanced comparison/export polish builds on the P6.C5 workspace rather than
replacing it.

## 13. Source registry rules

New registry:

`data/sources/walter-bislin-comparative-models.yaml`.

It records:
- exact URLs;
- accessed date;
- formula summaries;
- intended project use;
- source classification;
- explicit non-authority boundaries.

Existing registries remain authoritative for their own source classes:
- `data/sources/gleason-book.yaml`;
- `data/sources/gleason-video-measurement-audit.yaml`;
- `data/sources/gleason-restored-map.yaml`;
- `data/sources/astronomy-comparative-sources.yaml`.

## 14. Governance and acceptance

This amendment is documentation/architecture/governance only.

It must:
1. pass complete Release Acceptance Gates;
2. be merged only by separate owner authorization;
3. leave Phase 5 accepted at v0.5.0;
4. leave Phase 6 in progress;
5. not create a tag, GitHub Release or deployment.

P6.C1 may be developed as a stacked branch from the verified amendment head, but
must not be merged into `main` before this amendment is merged.

## 14.1 Verification evidence

Initial exact verification head:
`20a203fad5b86409c64e9129806dd07169d3cddf`.

Release Acceptance Gates:
**#832 — SUCCESS**.

The complete gate set passed, including repository/source policy, machine-readable
state validation, backend/frontend tests, WGS84/Gleason/P6.6 parity, production
build/PWA/offline, browser acceptance, Docker runtime, P6.5/P6.6 APIs,
PostGIS/source/search, Arabic/offline search and Redis.

This document now records #832, so the resulting closure-state head must itself
pass the complete Release Acceptance Gates once more. That final run is recorded
on PR #36 without changing the verified head afterward.

PR #36 remains draft/open/unmerged. Merge requires separate explicit owner
authorization.

## 15. Immediate next action

1. verify this amendment and source registry by CI;
2. create P6.C1 from the verified amendment head;
3. P6.C1 starts with contract/tests/documentation and only then modifies
   production measurement code;
4. keep P6.7B NOT STARTED until P6.C1–P6.C5 close.
