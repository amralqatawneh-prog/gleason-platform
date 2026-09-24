# Gleason-platform — MASTER PROJECT REFERENCE
Last reconciled: 2026-09-23
Project key: `Gleason-platform`

> This document is written as a self-explanation for the assistant/model that will
> continue the project in a future conversation. It preserves the project idea,
> architecture, governance, completed phases, current exact state, source hierarchy,
> measurement semantics, experimental proposals, persistence locations, and the
> execution order that must be respected.

## 1. Project idea

Gleason-platform is not merely a Gleason map viewer. It is a multi-model geographic,
measurement, research, and comparison platform built around one canonical geographic
state (latitude/longitude and explicit provenance) that can be rendered and analyzed
through independent models without forcing those models to agree.

The three foundational model families are:

1. **Gleason Historical / derived reconstruction**
2. **Independent Azimuthal Equidistant (AE) visualization**
3. **WGS84 Reference**

The shared identity is geographic, never screen pixels. A point is selected once in
geography, then every model independently projects/renders it.

The long-term platform also includes:
- search and offline place catalogs;
- multi-point measurement routes;
- geodesic, projected-plane and model-native measurement;
- polygon perimeter/area;
- same-route rendering across models;
- calibration/fixture laboratories;
- historical Gleason mode and longitude/navigation laboratories;
- route providers / turn-by-turn navigation;
- elevation providers and ellipsoidal height;
- map-first comparison UX;
- reference lines, azimuth and compass tools;
- Qibla comparison;
- astronomy/time/observer engines;
- observer dome and comparative celestial models;
- eclipse laboratories;
- terrain/river analysis;
- submarine cable analysis;
- aviation laboratory;
- high-detail external map layers;
- reproducible experiment notebook/URL/ID;
- presentation/9:16 export;
- performance/stability/security validation;
- final documentation and v1.0 release.

## 2. Non-negotiable governance

1. Work one slice at a time.
2. Never mark owner manual PASS unless the owner explicitly reports it.
3. Never merge a PR without separate explicit owner authorization.
4. A successful CI run does not equal owner acceptance.
5. A successful owner manual test does not equal merge authorization.
6. Preserve source identity, model identity, calculation space, units, provenance,
   limitations, and assumptions.
7. No hidden normalization merely to make models agree.
8. Missing input/evidence/data remains missing / unavailable / gated.
9. Do not fabricate historical control points, scale rules, routes, heights, CRS, or
   provider data.
10. A measurement polyline is not a navigation route.
11. Rendering one method on another model does not change computation identity.
12. Experimental research profiles are not runtime changes until explicitly approved.
13. No tag, GitHub Release or deployment without explicit authorization.
14. Historical reports remain historical evidence; do not rewrite them to pretend they
    were authored at the current state.
15. Future user-visible numerical/provider/persistence changes must update the living
    Developer/User/Calculation documentation.

## 3. Source/evidence identity

Measurement/source classes:

- `GLEASON_PRIMARY_HISTORICAL`
- `OWNER_SECONDARY_OBSERVED`
- `EXTERNAL_COMPARATIVE_MODEL`
- `REFERENCE_SOURCE`

Evidence levels must remain distinct, including:
- `DOCUMENTED`
- `DERIVED_FROM_DOCUMENTED`
- `SECONDARY_OBSERVED`
- `EXTERNAL_COMPARATIVE`
- `ASSUMPTION_PROFILE`
- `REFERENCE_RESULT`

Never silently promote an assumption or secondary observation to primary historical
authority.

## 4. Technical foundation

Frontend:
- React / Vite
- Arabic + English
- RTL/LTR
- PWA
- IndexedDB/local persistence where explicitly scoped
- WebGL renderer with SVG fallback
- browser/offline acceptance testing

Backend:
- FastAPI
- PROJ / pyproj reference calculations
- PostGIS place catalog
- Redis
- Docker Compose

Reference client-side numerical tools include:
- GeographicLib JS
- proj4js

WGS84 backend/reference calculations remain the numerical acceptance authority, while
client implementations are independently parity-tested.

## 5. Phase 0–5 status

Phase 0 through Phase 5 are accepted/closed.

Accepted application version:
`0.5.0`

Accepted phase:
Phase 5

Implementation phase:
Phase 6 / IN PROGRESS

### Phase 0
Product framing, model/source policy, architecture and acceptance philosophy.

### Phase 1
FastAPI + React/Vite + bilingual UI + PWA + IndexedDB + Docker + CI foundation.

### Phase 2
Gleason derived model + independent AE model + map adapters + affine infrastructure.

### Phase 3
PostGIS place catalog, locked production sources, Arabic/English search, offline packs.

### Phase 4
Independent WGS84 reference model, geodesics, ECEF conversions, offline fallback,
browser/backend parity and reference rendering.

### Phase 5
Canonical geographic selection shared across models while preserving independent
numerical engines.

Closed slices:
- P5.1 canonical geographic selection
- P5.2 independent adapters
- P5.3 search/pick/marker synchronization
- P5.4 Model Laboratory
- P5.5 comparability contract
- P5.6 independent navigation/zoom/focus/rotation
- P5.7 homogeneous-difference gates + unavailable future-service contracts
- P5.8 versioned local state persistence
- P5.9 full regression/acceptance package

Owner explicitly accepted Phase 5 after P5.9 manual 10/10 PASS.

## 6. Approved Phase 4 audit corrections M1–M8

M1: geodetic ellipsoid rendering/picking and correct geographic marker.
M2: offline WGS84 geodesics/ECEF and production PWA precache/parity.
M3: accessible mobile controls and readable labels.
M4: consistent application/version/capability truth.
M5: provenance preservation through search/packs/selection.
M6: locked installs + meaningful browser/offline/Docker/source gates.
M7: unified roadmap through Phase 22 and precise phase boundaries.
M8: future comparison/presentation/9:16/performance/GPU/context-recovery backlog.

## 7. Phase 6 completed work

### P6.1 — Measurement Semantics Contract
CLOSED / MERGED.

Defines explicit endpoint/method/quantity/model/unit/scale/provenance semantics and
fail-closed future route behavior.

### P6.2 — Ordered Route State
CLOSED / MERGED.

Transient ordered A→B→C→… route state, direct map-add mode, reorder/delete/undo/clear,
point/segment identities, temporary cap of 50 points.

### P6.3 — WGS84 Ruler / Distance
CLOSED / MERGED.

WGS84 geodesic segment/open-polyline measurement, route guide, straight visual route
segments on flat maps, pan/touch interaction, display-only Great Circle reference,
browser/backend/local fallback.

### P6.4 — AE Native Measurement
CLOSED / MERGED.

Projected-plane distance in independent AE space. AE metres are not WGS84 geodesic
metres semantically.

### P6.5 — Gleason Native Measurement
CLOSED / MERGED.

Native normalized Gleason-plane distance using `normalized-radius-unit` and an explicit
Gleason calculation identity. No automatic historical km conversion.

### P6.6 — Polygon / Perimeter / Area
CLOSED / VERIFIED / MERGED.

Model-specific perimeter/area semantics, degenerate/self-intersection policies,
antimeridian/polar handling, source-audit corrections.

### P6.7A — Same Route, Three Renderings
CLOSED / VERIFIED / MERGED.

One canonical route identity rendered independently on Gleason, AE and WGS84.
Computation identity and visualization identity remain separate.

## 8. Why corrective slices P6.C1–P6.C5 were inserted

Owner review exposed two important issues:

1. Gleason measurement values needed useful SI presentation without silently inventing
   a historical scale.
2. The UI needed a map-first comparison workspace instead of result-heavy panels.

A third need was added:
3. WGS84 ECEF should obtain real ellipsoidal height via a named provider rather than
   silently assuming height zero.

The owner approved the corrective architecture amendment, inserting:

`P6.C1 → P6.C2 → P6.C3 → P6.C4 → P6.C5`

before resuming P6.7B.

## 9. P6.C1 — Gleason Measurement Re-evaluation

CLOSED / VERIFIED / MERGED through PR #37.

Key conclusion:
Figure 43 says longitude in miles and gives 60 miles/degree at the Equator, but the
Figure-43 passage does not independently prove that every such mile equals the
6075-foot nautical/sea/Solar mile, English/statute mile, or another named mile.

Therefore:
`historical-fig43-mile` remains unresolved for direct automatic SI conversion.

The old universal circle-derived profile was demoted to diagnostic:
`gleason-fig43-circle-derived-diagnostic`.

Walter remains an external comparative model and is never relabeled Gleason history.

## 10. P6.C2 — Gleason SI Measurement Engine

CLOSED / VERIFIED / MERGED through PR #38.

Accepted main baseline:
`90d03c98d3345d563dd3a6721be4542c1d35af9f`

Owner-tested head:
`b1dacada7cb84c715b71c654c7abe465d370cc0b`

CI #876 SUCCESS.
Owner manual 6/6 PASS.
Closure #877 SUCCESS.
Final recording #878 SUCCESS.

Profiles include:

### Walter direct-SI external profile
`walter-flat-plane-eq-10008`

Pole→Equator = 10008 km.
For the current normalized Gleason radial coordinate, this implies
`1 NRU = 20016 km` inside that external profile.

### Figure 43 + Chapter XVII 6075-ft assumption
`6075 × 0.3048 = 1851.66 m`

### Figure 43 + Figure 37 ratio assumption
`208 English miles = 180 nautical/geographical miles`

English/statute:
`5280 × 0.3048 = 1609.344 m`

Ratio-derived nautical/geographical:
`(208/180) × 1609.344 = 1859.6864 m`

### Figure 43 + Chapter XIX 6070-ft assumption
`6070 × 0.3048 = 1850.136 m`

All remain explicitly named assumptions rather than a single hidden historical answer.

## 11. P6.C3 — Calibration & Fixture Laboratory

This is the current active slice.

Branch:
`feat/p6.c3-calibration-fixture-laboratory`

Draft PR:
#39

Baseline:
`main @ 90d03c98d3345d563dd3a6721be4542c1d35af9f`

Original exact owner-tested head:
`acb232c9ab78bcd8c84e16fd666b37200b5d1c57`

Pre-manual CI:
#904 SUCCESS

Owner manual:
6/6 PASS — REPORTED BY OWNER

Original fixture set count:
9

Fixture IDs:
1. `book-fig43-equator-one-degree`
2. `video-dNBxb-spreadsheet-chord`
3. `video-dNBxb-australia-chord`
4. `video-dNBxb-australia-north-south`
5. `video-SuHnvvYEfok-ruler-triangle`
6. `walter-pole-equator-default`
7. `reference-equator-one-degree-wgs84-vs-walter`
8. `raster-restored-outer-ring-fit`
9. `raster-owner-8k-jgw`

The laboratory compares source/prediction/residual behavior without selecting a
scientific “winner”.

## 12. Owner proxy/JGW refinement after original P6.C3 manual PASS

The original full-resolution raster is unavailable.

Owner authorized use of the lower-quality received representation as a visual/ruler
reference and adoption of metre/mile after verification.

Recovered proxy:
`Gleason-map-8k.jpg`

Received dimensions:
1361 × 2048 px

Bytes:
1,233,904

SHA-256:
`884e9b2473eac5929b25375bc2a1be9907866e03653722b6a3bbc2dd9a62ef1d`

Library id:
`libfile_59fd00b0a9908191b5a57473d3b40383`

This is the owner-authorized visual/ruler proxy.
It is NOT asserted to be the unavailable original 8K pixel matrix.

The separate 1464×2048 JPEG remains a separate reference and must not be merged
silently into the proxy identity.

## 13. Historical ruler identities preserved

English / Land / Statute mile:
`1609.344 m`

Chapter XVII Nautical / Sea / Solar mile:
`1851.66 m`

Figure 37 ratio-derived Nautical / Sea / Geographical mile:
`1859.6864 m`

Difference:
`8.0264 m per mile`

Chapter XIX 6070-ft comparison:
`1850.136 m`

Generic Figure-43 mile remains unresolved for automatic SI conversion.

## 14. JGW refinement

World file:
`data/sources/artifacts/8k-Flat-Earth-map.jgw`

Affine values:
- A = 5014.54829148701719532
- D = 0
- B = 0
- E = -5014.54829148701719532
- C = -19423852.80707496032118797
- F = 19448678.93866851553320885

Current project refinement policy:
- affine working unit accepted as metre under the owner-authorized proxy verification;
- one JGW affine pixel step = 5014.548291487017 m;
- = 3.115895850413 international statute miles;
- = 2.707639466246 international nautical miles;
- CRS remains UNKNOWN / NOT ENCODED;
- exact original-raster pixel pairing remains GATED;
- no fabricated geographic control points;
- no inferred EPSG/CRS.

## 15. Exact current PR #39 state at this reference

Current PR head before this documentation save:
`3b830783c6abfa92aebc0f1a8e303f3343e43cb7`

PR state:
DRAFT / OPEN / UNMERGED.

CI #939:
FAILURE.

Failure is limited to Browser/E2E identity mismatch.

Expected:
`data-p6c3-visual-reference="gleason-owner-8k-received-proxy-2026-09-22"`

Rendered:
`gleason-owner-hires-jpeg-reference-2026-09-22`

Pre-browser gates were green.

Therefore the proxy/JGW refinement is NOT technically green yet.
Do not run owner targeted retest or close/merge P6.C3 until this UI identity mismatch
is fixed and full Release Acceptance Gates succeed on a new exact head.

## 16. Current runtime Gleason measurement before experimental redesign

Current normalized radius:

`r = (90 - latitude_deg) / 180`

Coordinates:

`x = r * sin(longitude)`

`y = -r * cos(longitude)`

Straight planar chord:

`d = hypot(x2-x1, y2-y1)`

The unit:
`NRU = normalized-radius-unit`

NRU is a project computational normalization, not a historical Gleason printed unit.

It has no universal km value because each explicit profile may map it to a different
scale.

## 17. Experimental proposals discussed after P6.C3 manual testing

### Proposal A — remove NRU + Great Circle
RESEARCH ONLY / NOT IMPLEMENTED.

Concept:
- use lat/lon directly;
- compute Great-Circle angular distance;
- use a profile-specific equivalent radius.

Approximate discussed radii:
- Walter: 6371.291 km
- 6075 ft: 6365.538 km
- Figure37 ratio: 6393.131 km
- 6070 ft: 6360.299 km

Observation:
if all profiles use the same Great-Circle geometry, results become close because only
the radius/scale differs.

This proposal was NOT approved for runtime implementation.

### Proposal B — Gleason-only azimuthal planar research profile
RESEARCH ONLY / NOT IMPLEMENTED.

Owner requested a test geometry based on:
- north-polar azimuthal/Gleason-style layout;
- direct kilometre radial scale;
- straight Euclidean chord between projected points;
- reprojected modern country/coastline data for test visualization.

First experimental standard:
North Pole→South Pole = 12731 km.

This was superseded by the current experimental standard:
North Pole→South Pole = **12720.6 km**.

## 18. Current experimental 12,720.6-km standard

Research only.

Radial rule:

`r_km = 12720.6 × (90° - latitude) / 180°`

Therefore:
- North Pole radius = 0 km
- Equator radius = 6360.3 km
- South Pole outer radius = 12720.6 km
- one radial latitude degree = 70.67 km

Coordinates:

`x = r_km × sin(longitude)`

`y = -r_km × cos(longitude)`

Straight map distance:

`D = sqrt((x2-x1)^2 + (y2-y1)^2)`

Modern geographic boundaries were reprojected for experiment visualization.
The experimental map is not claimed to be the original historical Gleason raster.

## 19. Current experimental distance tests

Coordinates currently used include:
- Perth `(-31.9523, 115.8613)`
- Sydney `(-33.8688, 151.2093)`
- Johannesburg `(-26.2041, 28.0473)`
- Santiago `(-33.4489, -70.6693)`
- Dubai `(25.2048, 55.2708)`
- Doha `(25.2854, 51.5310)`
- Amman `(31.9539, 35.9106)`
- Cairo `(30.0444, 31.2357)`

Reference spherical comparison:
Great Circle using mean-radius sphere `R = 6371.0088 km`.

Current 12,720.6-km results:

Sydney→Santiago:
- azimuthal test = 16323.694 km
- spherical Great Circle = 11346.731 km
- difference = +4976.964 km
- approximately +43.86%

Perth→Johannesburg:
- azimuthal test = 11675.459 km
- spherical Great Circle = 8313.868 km
- difference = +3361.591 km
- approximately +40.43%

Perth→Dubai:
- azimuthal test = 7515.757 km
- spherical Great Circle = 9037.894 km
- difference = -1522.137 km
- approximately -16.84%

Radial latitude:
- 65°N→66°N = 70.67 km
- 65°S→66°S = 70.67 km

The earlier 12,731-km results remain experiment history only.

## 20. Persistence locations

GitHub repository:
`amralqatawneh-prog/gleason-platform`

Canonical status documents:
- `docs/PROJECT_MEMORY_CURRENT.md`
- `docs/PROJECT_MASTER_REFERENCE_CURRENT.md`
- `docs/PROJECT_FUTURE_PHASES_CURRENT.md`
- `docs/PROJECT_HANDOFF_CURRENT.md`
- `docs/ROADMAP_CURRENT.md`
- `docs/PHASE_6_PLAN.md`
- `docs/PHASE_5_ACCEPTANCE_PACKAGE.json`
- `docs/PHASE_6_P6_C3_CALIBRATION_FIXTURE_LABORATORY.md`

Persistent ChatGPT Library folder:
`/Gleason-platform/`

Canonical Library handoff:
`/Gleason-platform/handoffs/PROJECT_MEMORY_CURRENT.md`

The master reference and future-phases reference should also be kept in that handoff
folder.

Experimental maps:
`/Gleason-platform/experiments/azimuthal/`

## 21. Main sources needed to continue

Primary Gleason book:
`Alex Gleason - Is the Bible From Heaven.pdf`

Important locators:
- Figures 37–38 / Chapter XVII: PDF pp.376–377 / printed pp.349–350
- Figure 43: PDF p.429 / printed p.402
- Figure 30: PDF pp.360–361 / printed pp.333–334

GitHub source registries:
- `data/sources/gleason-book.yaml`
- `data/sources/gleason-measurement-unit-audit-2026-09-22.yaml`
- `data/sources/gleason-video-measurement-audit.yaml`
- `data/sources/gleason-restored-map.yaml`
- `data/sources/gleason-owner-8k-map.yaml`
- `data/sources/gleason-owner-hires-jpeg-reference.yaml`
- `data/sources/gleason-owner-8k-proxy-verification.yaml`
- `data/sources/walter-bislin-comparative-models.yaml`
- `data/sources/gleason-calibration-fixtures.yaml`
- `data/sources/astronomy-comparative-sources.yaml`

Modern reference sources/tools:
- Natural Earth locked source
- OurAirports locked source
- PROJ / pyproj
- GeographicLib
- future named elevation/geoid provider(s)

## 22. Immediate next executable actions

1. Fix P6.C3 rendered visual-reference identity mismatch.
2. Run complete Release Acceptance Gates.
3. If green, run targeted owner retest for the affected proxy/ruler/JGW presentation.
4. Record owner PASS only if explicitly reported.
5. Create closure-state documentation commit.
6. Run full closure-state CI.
7. Wait for explicit merge authorization.
8. Merge PR #39 only after explicit owner instruction.
9. Reconcile the new `main` baseline after merge.
10. Start P6.C4 only after P6.C3 is properly closed.
11. Keep the 12,720.6-km azimuthal research lane separate until the owner explicitly
    approves promotion into a runtime profile.

## 23. New-conversation restart instruction

Use:

`تابع مشروع Gleason-platform. اقرأ أولًا docs/PROJECT_MASTER_REFERENCE_CURRENT.md وdocs/PROJECT_MEMORY_CURRENT.md وdocs/PROJECT_HANDOFF_CURRENT.md من مستودع amralqatawneh-prog/gleason-platform، وافحص PR #39 وCI الحالي قبل أي تعديل، ثم اقرأ docs/PROJECT_FUTURE_PHASES_CURRENT.md قبل بدء أي مرحلة جديدة.`

Never rely on the chat title alone.