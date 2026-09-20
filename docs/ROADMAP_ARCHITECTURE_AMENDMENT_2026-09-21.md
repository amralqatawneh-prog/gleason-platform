# Roadmap & Architecture Amendment — New Requirements 2026-09-21

Status: **CLOSED + MERGED — PR #23**

Owner approval date: 2026-09-21  
Baseline: `main @ ba44ae59410e02ae748b235ed9792c8d4ee31b02`  
Accepted application version remains: **v0.5.0**  
Accepted phase remains: **Phase 5**  
Current implementation phase remains: **Phase 6 / IN PROGRESS**  
P6.1–P6.4 remain **CLOSED**. P6.5 remains **NOT STARTED**.

This amendment does not rewrite the accepted Phase 0 architecture history. It extends
the current execution roadmap after the owner approved the new requirements below.

## 1. Approved requirements

The following requirements are now part of the product roadmap:

1. Solar and lunar analemma visualization on Gleason, AE and WGS84.
2. Continuous developer/user/calculation documentation, with a polished final
   documentation delivery at project completion.
3. Current-location observer selection and a virtual observer sky dome.
4. Map-pin observer selection on all three model views and the same observer dome.
5. Solar- and lunar-eclipse motion/path views both from above and from an observer.
6. High-detail global streets/cities/buildings/points-of-interest comparable in
   practical usefulness to a modern detailed map, rendered appropriately on all
   three models.
7. Accurate visual and numerical day/night, sunrise/sunset, dawn and civil/nautical/
   astronomical twilight behavior, including observer-local event times.
8. Aviation laboratory with live, historical and future/scheduled flights where
   licensed data providers allow it, including aircraft/operator metadata,
   receiver provenance where available, route times, speed and altitude context.
9. Use OSIRIS as an open-source architectural/reference implementation and optional
   adapter source where appropriate, while preferring original upstream providers
   and preserving provider-specific licenses/provenance.
10. Route Directions / turn-by-turn routing, distinctly separated from measurement
    polylines and model-native distance calculations.

## 2. Non-negotiable semantic rules

The project keeps the existing **No Hidden Normalization** rule.

### 2.1 Computation identity vs visualization identity

A quantity keeps the identity of the engine that computed it even when visualized
on another model. Examples:

- a WGS84 ephemeris position rendered on Gleason remains
  **Reference Astronomy rendered on Gleason**;
- a road route returned by a routing provider and rendered on AE remains a
  **provider road route rendered on AE**;
- it does not become an AE-native distance merely because its geometry is visible
  on the AE map.

### 2.2 Reference vs model-native astronomy

Future astronomy work must distinguish:

- **Reference Astronomy**: documented modern ephemeris/reference calculations;
- **Model-Native Astronomy**: a separately specified model rule when such a rule
  exists and is explicitly implemented;
- **Display Convention**: purely illustrative geometry that is not a physical
  prediction.

No reference result may be relabeled as a native Gleason result.

### 2.3 Measurement route vs navigation route

The P6.2 ordered route remains a **measurement polyline** unless a dedicated route
provider computes a network path.

A turn-by-turn result must carry provider identity, mode, geometry, legs,
maneuvers, provider distance/time and provenance. Rendering the same navigation
geometry on the three models does not change the provider computation identity.

### 2.4 Observer source identity

An observer may come from device geolocation, search, a map pin, manual
coordinates or a saved observer. These origins must remain explicit. Approximate
IP geolocation must never be presented as precise device GPS.

### 2.5 Missing values stay missing

Unknown elevation, receiver identity, aircraft metadata, observation precision,
schedule status or historical source scale must not be silently fabricated.

## 3. Cross-cutting contracts to define before heavy future features

The architecture now reserves four explicit shared contracts:

- `ObserverContext`
- `TimeContext`
- `ExternalLayerProvider`
- `RouteProvider`

Their current design contract is documented in
`docs/SHARED_CONTEXT_PROVIDER_CONTRACTS.md`.

These are roadmap architecture contracts only until a later implementation slice
explicitly implements them.

## 4. Continuous documentation policy — effective immediately

Documentation becomes a deliverable of every future slice.

Each new feature or material algorithm change must update, when applicable:

- `docs/DEVELOPER_GUIDE.md`
- `docs/USER_GUIDE.md`
- `docs/CALCULATION_REFERENCE.md`
- current roadmap/handoff/status documents
- source/provenance records
- tests and acceptance evidence

### Code comment rule

Do **not** comment every line. Prefer readable names/types/functions. Comments and
docstrings are required where they explain:

- why a non-obvious algorithm or workaround exists;
- mathematical assumptions, units, CRS/reference frames or time scales;
- provenance/licensing constraints;
- invariants and fail-closed behavior;
- cross-model identity boundaries;
- numerical edge cases;
- public APIs whose contract is not obvious from the type signature.

A stale or redundant comment is a defect and must be updated with the code.

### Slice acceptance addition

A future slice is not documentation-complete if it changes user-visible behavior,
a calculation, a provider contract or a persistence contract without updating the
relevant living guides.

Phase 21 becomes final editorial/validation consolidation, not the first time the
documentation is written.

## 5. Revised Phase 6 plan

Existing closed slices remain unchanged.

### P6.5 — Gleason Native Measurement
Status: **NOT STARTED**

Deliver:
- normalized Gleason-plane segment distance and open-polyline total;
- method identity `gleason-native-normalized`;
- unit `normalized-radius-unit`;
- scale basis `gleason-normalized-model-radius`;
- backend/client parity where the architecture supports both;
- no metre/km conversion without a separately documented scale rule.

Acceptance:
- repeated/reversed/polar/antimeridian/model-center cases are deterministic;
- UI always displays model, method, unit, scale basis and provenance;
- WGS84/AE identities remain untouched;
- user/developer/calculation documentation updated.

### P6.6 — Polygon / Perimeter / Area
Status: **NOT STARTED**

Before implementation define closure, minimum vertices, duplicate endpoint,
collinearity, self-intersection, interior/complement, pole/antimeridian and
orientation rules per model.

Acceptance:
- invalid/degenerate polygons fail closed;
- units and model identity are explicit;
- no cross-model area normalization.

### P6.7A — Same Route, Three Renderings
Status: **NOT STARTED**

Render one canonical ordered geographic route on all three views without changing
the selected computation identity.

Acceptance:
- geometry identity is visible in the inspector;
- no rendering is mislabeled as native computation of the destination view.

### P6.7B — Route Provider & Turn-by-Turn Directions
Status: **NOT STARTED**

Introduce the `RouteProvider` abstraction. Valhalla is the first candidate for
an implementation spike because it supports OSM-based routing and turn-by-turn
maneuvers, but provider selection remains a documented decision gate.

Deliver:
- driving/walking/cycling modes when supported;
- canonical WGS84 route geometry;
- route legs, maneuvers and ETA/provider distance;
- same provider geometry rendered independently on Gleason, AE and WGS84;
- online/offline/regional-routing policy;
- provider attribution/license/provenance.

Acceptance:
- navigation path is never confused with the P6.2 measurement polyline;
- provider distance/time is never relabeled as Gleason/AE/WGS84 native distance;
- unsupported mode/provider state is explicit;
- rerouting, waypoint ordering and error states are tested;
- user/developer/calculation documentation updated.

### P6.8 — Navigation / Longitude Laboratory
Unchanged in purpose; it follows P6.7A/P6.7B.

### P6.9 — Gleason Original Mode
Unchanged source-grounded requirement.

### P6.10 — Phase 6 Regression / Acceptance
Extend regression to cover route-provider identity and turn-by-turn separation if
P6.7B has been implemented before Phase 6 closure.

## 6. Revised astronomy and observer roadmap

### Phase 9 — Astronomy, Time and Observer Foundations

P9.1 — Ephemeris authority and astronomical reference policy  
P9.2 — `TimeContext`: UTC instant, display timezone, simulation mode/rate and
astronomical time-scale handling  
P9.3 — `ObserverContext`: location/elevation/accuracy/source/timezone/provenance  
P9.4 — Sun/Moon/planet state service with explicit coordinate/reference frames  
P9.5 — offline/cache range, numerical parity and source/version reporting

Phase 9 acceptance:
- reference ephemeris authority is pinned and reproducible;
- time scales and observer coordinates are explicit;
- no observer altitude is invented;
- online/offline limits are visible;
- all celestial results expose source/method/frame/time.

### Phase 10 — Celestial Motion, Illumination and Analemmas

P10.1 — Sun/Moon/planet motion layers and timeline  
P10.2 — day/night terminator plus civil/nautical/astronomical twilight bands  
P10.3 — numerical sunrise/sunset/twilight event times for an ObserverContext  
P10.4 — solar analemma at a declared observer/time sampling rule  
P10.5 — lunar analemma with an explicitly selected sampling period/rule; no
assumption that it is a simple annual analogue of the solar analemma  
P10.6 — cross-model comparison/difference overlays with computation identity kept

Phase 10 acceptance:
- visual illumination boundaries agree with their numerical angular definitions;
- every event has date/time/timezone and observer provenance;
- reference astronomy vs model-native/display-only outputs are distinct;
- animation is deterministic for a fixed timestamp;
- Arabic/English/mobile/offline-supported cases are tested.

### Phase 11 — Observer Dome / Observation Laboratory

P11.1 — observer selection from device location, search, map pin, manual coordinate
and saved observer  
P11.2 — topocentric altitude/azimuth transformation contract  
P11.3 — virtual observer dome: horizon, cardinal directions, celestial tracks,
Sun/Moon/planets/stars where supported  
P11.4 — timeline animation and the same observer identity across all three model
views  
P11.5 — observation capture/comparison and reproducibility metadata

Phase 11 acceptance:
- device geolocation requires explicit browser/user permission and reports accuracy;
- map pin/search/manual observer selections share one canonical ObserverContext;
- sky-dome azimuth/elevation matches the pinned reference engine within declared
  tolerances;
- current location and pin workflows work on desktop/mobile;
- reference vs model-native interpretations remain labeled.

### Phase 12 — Eclipse Laboratory

P12.1 — eclipse event/reference provider and event catalogue  
P12.2 — solar-eclipse top view: central line/umbra/antumbra/penumbra where data or
calculation supports them  
P12.3 — solar eclipse observer view with local circumstances  
P12.4 — lunar eclipse visibility region plus observer sky track/magnitude/phases  
P12.5 — validation against pinned authoritative reference cases

Phase 12 acceptance:
- event occurrence is separated from observer visibility;
- top-view path and observer-local circumstances share the same event/time source;
- lunar eclipse is not falsely rendered as a solar-style ground shadow path;
- reference cases and tolerances are recorded.

## 7. Revised aviation roadmap — Phase 15

Phase 15 becomes **Aviation Laboratory** with provider separation.

P15.1 — provider contracts:
- `LiveTrackProvider`
- `HistoricalTrackProvider`
- `ScheduleProvider`
- `AircraftMetadataProvider`
- `ReceiverNetworkProvider`
- `TerrainElevationProvider`

P15.2 — live aircraft tracks  
P15.3 — historical tracks/replay  
P15.4 — future/scheduled flight data when a licensed provider supplies it  
P15.5 — operator/aircraft/registration/type metadata  
P15.6 — receiver-station provenance where the upstream feed exposes it  
P15.7 — altitude reference handling: barometric/geometric/MSL/AGL with terrain
source and limitations  
P15.8 — same actual/provider track rendered on the three models

Phase 15 acceptance:
- live/historical/scheduled statuses cannot be confused;
- missing provider fields remain missing;
- an ADS-B/Mode-S receiver is not labeled an ATC tower unless the source actually
  identifies an ATC facility;
- observed track is not replaced by a Great Circle or road-like reconstruction;
- time, source, freshness and licensing are visible;
- AGL uses a named terrain source and uncertainty/vertical datum limits.

## 8. Revised detailed-map/layer roadmap — Phase 16

Phase 16 becomes **Advanced Layers & High-Detail Geography**.

P16.1 — `ExternalLayerProvider`, normalization, freshness, licensing,
attribution, caching and offline-rights framework  
P16.2 — renderer architecture spike comparing the current renderer with
MapLibre/Cesium/hybrid approaches before any irreversible migration  
P16.3 — canonical detailed road/building/city/POI data pipeline, with
OpenStreetMap/other licensed sources evaluated explicitly  
P16.4 — vector tiles, regional packs, cache/update strategy and storage budgets  
P16.5 — detailed global/regional streets/buildings/cities rendered on all three
model views without corrupting model projection identity  
P16.6 — selected OSIRIS-inspired live-layer adapters such as maritime, satellite,
cables or other project-relevant layers, preferably from original upstream
providers

Phase 16 acceptance:
- source/license/attribution is visible and compliant;
- no bulk/offline use of a public tile endpoint that forbids it;
- the renderer decision is benchmarked for desktop/mobile/offline/memory/GPU;
- high-detail geometry has a defined canonical coordinate source before being
  projected by each model adapter;
- stale/live/offline state is explicit;
- unsupported layers fail closed.

## 9. OSIRIS usage policy

OSIRIS is accepted as:
- an open-source architecture/reference implementation;
- a source of design ideas for normalized external feeds and map layers;
- an optional integration layer when its API/license/availability fit.

OSIRIS is **not** accepted as the single source of truth for all layers.

For production-critical data, prefer direct upstream providers or a self-hosted
adapter when feasible. Preserve upstream license, attribution, rate limits,
timestamp/freshness and field semantics.

Candidate references to re-verify at implementation time:
- OSIRIS project/docs: https://osirisai.live/docs
- OSIRIS repository: https://github.com/simplifaisoul/osiris
- OpenSky: https://opensky-network.org/
- JPL Horizons: https://ssd.jpl.nasa.gov/horizons/
- Astropy coordinates: https://docs.astropy.org/
- NASA eclipse references: https://eclipse.gsfc.nasa.gov/
- OpenStreetMap policies: https://operations.osmfoundation.org/policies/
- MapLibre GL JS: https://maplibre.org/maplibre-gl-js/docs/
- Valhalla routing: https://valhalla.github.io/valhalla/
- Copernicus DEM: https://dataspace.copernicus.eu/

These references are planning inputs, not pinned production dependencies until a
future slice performs its own source/license/version decision.

## 10. Performance and final documentation implications

### Phase 19
Add performance gates for:
- large vector-tile/layer workloads;
- observer-dome animation;
- celestial timeline animation;
- live aircraft refreshes;
- route geometry and rerouting;
- cache/storage budgets;
- WebGL context loss/recovery;
- graceful reduced-quality fallbacks.

### Phase 21
Deliver the final validated versions of:
- User Guide;
- Developer Guide;
- Calculation Reference;
- provider/source/license catalogue;
- installation/offline-pack guide;
- reproducibility/experiment guide;
- known limitations.

Phase 21 must verify that guides match executable behavior; it must not invent
documentation retroactively for undocumented historical code.

## 11. Verification and closure

- PR: **#23**
- initial verification head: `cb4b4681bd359e29b08542856b7bff144a239796`
- initial Release Acceptance Gates: **#673 — SUCCESS**
- exact final closure head: `c73ca4cdd41b2e3cd745df5412be30a44d2bda9c`
- exact final Release Acceptance Gates: **#676 — SUCCESS**
- merge authorization: explicit owner instruction **«قم بدمج PR #23 إلى main»**
- merge commit: `de2cf9b0a8a48a788323373eb2b9c72622c288f8`
- merged at GitHub timestamp: `2026-09-20T22:39:36Z`
- post-merge push-run number: not independently verified/recorded; no result is fabricated
- scope verification: documentation/architecture/governance only; no P6.5 functional implementation
- P6.5 status: **NOT STARTED**
- accepted phase: **5**
- accepted application version: **v0.5.0**

## 12. Immediate execution order after this amendment

1. Reconcile post-PR23 current-state documentation and machine-readable governance before starting another slice.
2. Do **not** start Phase 9/10/11/12/15/16 implementation now.
3. Resume Phase 6 with **P6.5 — Gleason Native Measurement** only after the reconciliation is merged and an explicit owner start instruction is given.
4. Continue sequentially through P6.6, P6.7A and P6.7B before later Phase 6 labs.
5. Whole Phase 6 acceptance remains dependent on P6.10 and explicit owner
   acceptance.
