# Roadmap & Astronomy Architecture Amendment — Comparative Celestial Models and Historical Eclipse Cycles — 2026-09-21

Status: **CLOSED / VERIFIED + MERGED — FINAL HEAD `8d84c2e83a148a359fd0d75da7e5f3b21570ac22` / CI #726 SUCCESS / MERGE `5442852ef4bc2e760db39743d0bc7b3bc57d0b11`**

Owner approval: **«موافق على هذا التصور، وابدأ بتنفيذ Roadmap & Astronomy Architecture Amendment جديد»**

Stacked baseline:
- post-PR25 reconciliation exact verified head: `24aba98192483dc8fc3d60cacbb8eac96f0fa5aa`
- Release Acceptance Gates: **#718 — SUCCESS**
- current integration baseline: `main @ 5442852ef4bc2e760db39743d0bc7b3bc57d0b11` (PR #27 merge)
- P6.5: **CLOSED + MERGED**
- P6.6: **NOT STARTED**
- accepted phase remains: **Phase 5**
- accepted application version remains: **v0.5.0**

This amendment changes roadmap contracts and source/provenance policy only. It
does not implement astronomy, eclipses, observer-dome calculations, Saros
prediction, or P6.6.

## 1. Approved source families

The future astronomy architecture formally recognizes five separate source/result
families. Their identities may never be silently merged:

1. **REFERENCE_ASTRONOMY / reference-ephemeris**
   - modern documented ephemeris/reference calculations;
   - planned authorities include pinned JPL/NASA or another explicitly selected
     reference implementation after a dedicated source decision.
2. **HISTORICAL_CYCLE / historical-cycle**
   - documented historical periodic methods such as the Babylonian
     223-synodic-month eclipse cycle;
   - output is a computed historical-cycle result, not a modern ephemeris result.
3. **EXTERNAL_COMPARATIVE_MODEL / external-comparative-model**
   - external interactive/model implementations used for reproducible comparison;
   - Shane and the upstream Walter Bislin FE-Dome implementation are the first
     registered examples.
4. **MODEL_NATIVE_ASTRONOMY / model-native**
   - a separately specified Gleason/model rule only after the project defines and
     implements one with explicit assumptions and provenance.
5. **DISPLAY_ONLY / display-only**
   - illustrative geometry that is not a prediction.

Rendering any of these on Gleason, AE or WGS84 does not change its computation
identity.

Authoritative planning registry:
`data/sources/astronomy-comparative-sources.yaml`.

## 2. Shane / Walter comparative-model policy

### 2.1 Shane source

Register Shane's Personal Celestial Sphere / Flat Earth Dome Model as an
**EXTERNAL_COMPARATIVE_MODEL**, useful for:
- Personal Celestial Sphere UX and observer-dome concepts;
- Sun/Moon/star tracks;
- day/night terminator comparison;
- eclipse-node/demo comparison;
- saved-state / replay URL ideas;
- comparison fixtures after a complete code audit.

It is **not** accepted as sole numerical validation truth.

Before production code reuse or numeric acceptance:
- acquire/pin an exact source snapshot;
- record SHA-256 or commit/revision;
- audit actual formulas and dependencies;
- map every adopted quantity to provider/method/version/reference frame;
- re-check license/attribution for the exact copied files;
- add deterministic fixtures and tolerances.

### 2.2 Walter upstream source

Walter Bislin's FE-Dome implementation is registered separately as
**UPSTREAM_REFERENCE_IMPLEMENTATION** because Shane's license page attributes the
original code to Walter and says it may have been modified.

Walter's own methodology statement says the model uses heliocentric/JPL-derived
inputs and projects them onto a flat-earth dome. Shane's page disputes that
interpretation and describes the cycles differently. The project must preserve
this disagreement as source provenance:

- Walter claim != Shane claim;
- neither claim is silently adopted as the project's conclusion;
- code-derived facts are recorded separately from author interpretation;
- a future adapter reports exactly which source/snapshot produced a result.

## 3. Personal Celestial Sphere vs physical-heavens model

Create a permanent architecture distinction:

### ObserverCelestialSphere

A mathematical/visual topocentric surface around an `ObserverContext` used to
plot:
- horizon;
- cardinal directions;
- altitude/azimuth;
- Sun/Moon/planet/star apparent tracks;
- celestial poles;
- star trails;
- observer-local event geometry.

It is a coordinate/visualization construct and does not by itself assert the
physical location or shape of the heavens.

### PhysicalHeavensModel

A separately versioned model-native interpretation of physical celestial
geometry, if the project later defines one.

A point drawn on `ObserverCelestialSphere` may not be described as physically
lying on a dome merely because the visualization is dome-shaped.

## 4. New provider contracts

Add a fifth cross-cutting provider contract:

### CelestialComputationProvider

Minimum output identity:
- `providerId`;
- `methodId`;
- provider/model version;
- `calculationClass`: `reference-ephemeris` /
  `historical-cycle` / `external-comparative-model` /
  `model-native` / `display-only`;
- `TimeContext`;
- optional `ObserverContext`;
- reference/coordinate frame;
- quantities and units;
- source IDs and provenance;
- numerical tolerance/uncertainty when meaningful;
- limitations;
- reproducibility state/fixture ID.

Rules:
- provider identity survives rendering on another map/model;
- comparison requires compatible quantities/frames/times;
- missing values remain missing;
- a visual match is not numerical validation;
- external model claims and project calculations remain distinct.

### EclipsePredictionProvider

Specialized provider interface for eclipse work. It must declare which outputs it
actually supports, for example:
- eclipse possibility/window;
- event family/series;
- event maximum time;
- local circumstances;
- magnitude/obscuration;
- visibility region;
- umbra/antumbra/penumbra;
- precise ground path.

A provider that only predicts cycle recurrence may not fabricate or inherit a
precise local ground path.

## 5. Babylonian eclipse-cycle architecture

Add a **Babylonian Eclipse-Cycle Engine** in the future roadmap.

Primary historical-method reference:
- Brack-Bernsen & Steele (2005), *Eclipse Prediction and the Length of the Saros
  in Babylonian Astronomy*.

Modern cycle-parameter cross-check:
- NASA solar/lunar Saros periodicity references.

The first historical implementation target is the documented relationship:
- 223 synodic months;
- approximately 242 draconic months;
- approximately 239 anomalistic months.

The UI/documentation should prefer:
**Babylonian 223-Month Eclipse Cycle (later called Saros)**

rather than implying that the Babylonian tablets necessarily used the later
Greek-derived name in the same way.

Future extraction may add historically documented:
- eclipse-possibility schemes;
- 5/6-month interval rules;
- TU 11 procedures;
- BM 45861 Saros-length model;
- Goal-Year procedures;
only after each rule has a cited source and test fixture.

### Hard limitation

Saros recurrence alone is not a complete precise local eclipse-path engine.
The historical-cycle provider must state its actual outputs and limitations.
Modern/reference geometry and historical-cycle recurrence may be compared, but
one may not silently fill missing fields of the other.

## 6. Historical cosmography context

The British Museum Map of the World (tablet 92687) is registered only as
historical Mesopotamian cosmography context.

It supports the statement that the particular tablet depicts the world as a disc
surrounded by a ring of water. It does not, by itself:
- establish one universal Babylonian cosmology;
- define the Saros mathematics;
- prove what every Babylonian eclipse calculator assumed physically.

The project must preserve this narrower evidence boundary.

## 7. Revised Phase 9 — Astronomy, Time, Sources and Observer Foundations

P9.1 — **Astronomy Source Authority & Provenance Registry**
- pin selected modern reference ephemeris;
- register Shane/Walter comparative models and historical-cycle sources;
- exact version/hash/license/provenance policy;
- source claim vs code-derived fact vs project inference separation.

P9.2 — **TimeContext**
- UTC instant, display timezone, live/fixed/animated mode;
- astronomical time-scale conversions where required;
- deterministic timestamp fixtures.

P9.3 — **ObserverContext**
- location/elevation/accuracy/source/timezone/provenance;
- device/search/map-pin/manual/saved observer identity.

P9.4 — **CelestialComputationProvider + Sun/Moon/Planet State**
- canonical provider contract;
- explicit coordinate/reference frames;
- reference implementation selected independently of renderer.

P9.5 — **Offline Range / Numerical Parity / Version Reporting**
- supported date range;
- cache/offline policy;
- reference parity fixtures.

P9.6 — **External Comparative Astronomy Adapters**
- Shane-compatible adapter feasibility;
- Walter upstream adapter/audit;
- deterministic source snapshots;
- no code reuse before snapshot/hash/license audit;
- preserved interpretation/provenance disagreement.

Acceptance:
- every result exposes class/provider/method/version/frame/time;
- source snapshot/version is reproducible;
- a Shane/Walter result cannot be labeled reference astronomy;
- a reference ephemeris rendered on Gleason cannot be labeled Gleason-native;
- P9 does not silently introduce a physical-heavens model.

## 8. Revised Phase 10 — Celestial Motion, Illumination and Comparative Layers

P10.1 — Sun/Moon/planet motion layers and timeline  
P10.2 — day/night terminator plus twilight bands  
P10.3 — sunrise/sunset/twilight observer-local event times  
P10.4 — solar analemma with declared sampling rule  
P10.5 — lunar analemma with declared sampling rule  
P10.6 — cross-model difference overlays preserving computation identity  
P10.7 — **External Comparative Astronomy Layer**
- Shane/Walter-compatible track/terminator comparison where audited;
- same timestamp/observer across providers;
- difference inspector rather than forced normalization.

Acceptance adds:
- comparison requires same instant and compatible quantity/frame;
- visual overlays display provider badge and provenance;
- source disagreement is visible rather than reconciled silently.

## 9. Revised Phase 11 — Observer Dome / Observation Laboratory

P11.1 — observer selection workflows  
P11.2 — topocentric altitude/azimuth contract  
P11.3 — **ObserverCelestialSphere**:
- horizon/cardinal directions;
- Sun/Moon/planets/stars;
- celestial poles;
- star trails;
- supported apparent tracks.

P11.4 — deterministic timeline and shared ObserverContext  
P11.5 — observation capture/comparison/reproducibility metadata  
P11.6 — **Personal Celestial Sphere Comparison Mode**
- reference topocentric result;
- audited Shane/Walter-compatible comparative result;
- future model-native result when it actually exists;
- difference inspector with no hidden normalization.

Acceptance adds:
- ObserverCelestialSphere is explicitly a mathematical/visual construct;
- no dome visualization is automatically a PhysicalHeavensModel claim;
- Alt/Az acceptance truth comes from the pinned reference provider for
  reference-mode tests;
- external/model-native providers retain their own identities.

## 10. Revised Phase 12 — Multi-Method Eclipse Laboratory

P12.1 — **Canonical EclipseEvent + EclipsePredictionProvider**
- event ID/type;
- provider/method/version;
- supported outputs/capabilities;
- time/reference frame/provenance.

P12.2 — **Modern Reference Eclipse Provider**
- pinned NASA/JPL/reference implementation;
- event catalogue and reference cases;
- precise outputs only where the selected provider supports them.

P12.3 — **Babylonian 223-Month Eclipse-Cycle Engine**
- historical-cycle class;
- 223-synodic-month recurrence;
- historically supported eclipse possibility/time rules;
- explicit confidence/limitations.

P12.4 — **Extended Babylonian Procedure Research**
- 5/6-month eclipse-possibility structure;
- TU 11;
- BM 45861;
- Goal-Year methods;
- implement only extracted/cited rules.

P12.5 — **Saros Family / Exeligmos Explorer**
- cycle family;
- Saros offset;
- three-Saros/Exeligmos comparison;
- modern reference overlay without changing historical-cycle identity.

P12.6 — **Solar Eclipse Top View**
- WGS84 / AE / Gleason renderings;
- central line/umbra/antumbra/penumbra only when provider supplies/calculates them.

P12.7 — **Solar Eclipse Observer View**
- local circumstances;
- observer sky path;
- contact times where supported.

P12.8 — **Lunar Eclipse Laboratory**
- event visibility;
- observer sky track;
- phase/magnitude semantics;
- never fake a solar-style ground shadow path.

P12.9 — **Multi-Provider Comparison**
- modern reference;
- Babylonian historical-cycle;
- audited Shane/Walter external comparative model;
- future model-native provider when implemented.

Acceptance adds:
- event occurrence != local visibility;
- historical recurrence != precise local ground path;
- unsupported outputs remain unavailable;
- every comparison shows provider/method/time/frame/source;
- known historical and modern cases are reproducible.

## 11. Revised Phase 17 — Reproducible Experiment Workspace

Phase 17 must preserve not only points/routes but complete astronomy experiments:

- observer state;
- time state;
- selected model/view;
- selected celestial provider and method;
- provider version/source snapshot;
- layer/toggle state;
- eclipse-cycle family/method where relevant;
- comparison tolerances;
- language/presentation state where needed.

Add a **Reproducible Experiment URL / ID** inspired by the useful state-replay
pattern studied in Shane/Walter:
- opening the URL restores the same declared experiment;
- no secret server state is required for core reproducibility where feasible;
- schema is versioned;
- unknown/retired provider versions fail visibly rather than silently upgrading.

## 12. Revised Phase 20 — Validation Matrix

Phase 20 expands validation to a provider-by-provider astronomy matrix, while
still requiring correctness to be tested in the implementing phases.

Required classes of fixtures:
- known solar and lunar eclipse events;
- sunrise/sunset and twilight;
- polar day/night;
- Sun/Moon/planet/star Alt/Az where applicable;
- antimeridian/high-latitude observer cases;
- historical Saros-family recurrence;
- Shane/Walter snapshot replay when licensed/audited;
- offline deterministic replay.

Report differences separately:
- time error;
- angular error;
- geographic/path error where supported;
- event classification mismatch;
- unsupported quantity;
- provider/source/version.

A lower error from one provider is reported as measurement evidence; Phase 20 does
not relabel provider identities or force an overall model winner.

## 13. Work required now vs later

### Required now by this amendment
- register source/provenance records;
- reserve provider/result classes;
- update roadmap phases 9–12, 17 and 20;
- update shared contracts;
- update living documentation references;
- preserve P6.6 as NOT STARTED.

### Deferred until its implementation phase
- downloading/bundling Shane or Walter code;
- implementing ephemeris engines;
- implementing Saros/TU11/Goal-Year mathematics;
- observer-dome rendering;
- eclipse path calculations;
- numerical validation claims.

No tag, GitHub Release, deployment, Phase 6 acceptance, or P6.6 start is
authorized by this amendment.


## 14. PR #27 verification after PR #26 merge

PR #26 has now been separately authorized and **MERGED** into `main`:
- final head: `24aba98192483dc8fc3d60cacbb8eac96f0fa5aa`
- Release Acceptance Gates: **#718 — SUCCESS**
- merge commit: `6bbfe92e8a4c0b66415eb888598cace5b7b15102`

Implementation PR #27 is **MERGED / CLOSED** into `main @ 5442852ef4bc2e760db39743d0bc7b3bc57d0b11` by separate explicit owner authorization.

The previous stacked-base blocker is cleared. PR #27 now targets `main` and must pass the complete Release Acceptance Gates on its exact head. Any
closure-state documentation update after that verification must itself pass the
full gates before PR #27 is ready for separate merge authorization.

This sequencing does not start P6.6 or any runtime astronomy implementation.


## 15. Verification and closure

Pre-closure verification:
- exact head: `eebf162e3dd1cf35e15933ff4622e7915bf0cd97`
- Release Acceptance Gates: **#720 — SUCCESS**
- acceptance-package checker: **PASS**
- backend/frontend/parity/PWA/browser/Docker/API/PostGIS/search/Redis gates:
  **PASS**

The amendment is therefore **CLOSED / VERIFIED** as architecture/documentation
scope. It does not imply any runtime astronomy implementation and it does not
start P6.6.

The closure-state head `8d84c2e83a148a359fd0d75da7e5f3b21570ac22` passed the complete **Release Acceptance Gates #726 — SUCCESS**. The owner separately authorized merging PR #27, and it was **MERGED** into `main` at `5442852ef4bc2e760db39743d0bc7b3bc57d0b11` on 2026-09-21. No post-merge push-run is claimed because none is independently visible through the available workflow view.
