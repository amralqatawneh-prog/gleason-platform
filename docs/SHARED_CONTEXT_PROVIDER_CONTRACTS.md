# Shared Context & Provider Contracts

Status: **ROADMAP CONTRACT — NOT YET IMPLEMENTED AS A COMPLETE SERVICE**

Date: 2026-09-21

These contracts prevent future astronomy, observer, eclipse, external-layer and routing
features from inventing incompatible state models. They describe semantic
requirements, not a claim that the services already exist. The approved Astronomy
Architecture Amendment also reserves `CelestialComputationProvider` and
`EclipsePredictionProvider`; neither is implemented yet.

## 1. ObserverContext

Minimum semantic fields:

- canonical latitude and longitude;
- optional ellipsoidal height;
- optional orthometric/terrain elevation with vertical datum/source;
- horizontal accuracy when supplied;
- source: device-geolocation / search / map-pin / manual / saved;
- source timestamp when meaningful;
- IANA display timezone or explicit unknown;
- optional place identity;
- provenance/version;
- coordinate classification.

Rules:
- device location requires explicit user/browser permission;
- IP-derived location is approximate and must be labeled approximate;
- missing elevation remains missing;
- a pin placed on any model must resolve back to a canonical geographic
  coordinate before becoming an ObserverContext;
- screen/pixel/model-projected coordinates are never shared as observer identity.

## 2. TimeContext

Minimum semantic fields:

- UTC instant;
- display timezone;
- mode: live / fixed / animated;
- playback rate when animated;
- paused/running state;
- source of time;
- astronomical time-scale conversion metadata when an ephemeris requires it.

Rules:
- display timezone does not alter the physical instant;
- UTC, TT/TDB or other astronomical time scales must not be conflated;
- deterministic tests pin the instant explicitly;
- offline mode must disclose supported date range and ephemeris version.

## 3. ExternalLayerProvider

Minimum semantic fields:

- provider ID and layer ID;
- source/upstream identity;
- data/license/attribution requirements;
- observed/event time where relevant;
- fetched time;
- freshness state: live / delayed / historical / stale / offline snapshot;
- spatial and temporal coverage;
- normalization schema/version;
- cache TTL/update policy;
- offline storage permission;
- raw-source provenance/reference.

Rules:
- normalization may unify field shape but must not erase source meaning;
- stale data cannot be labeled live;
- provider failure must fail closed with a visible status;
- upstream licensing/attribution survives proxying/self-hosting;
- no unsupported offline/bulk caching of a source whose terms prohibit it.

## 4. RouteProvider

The project distinguishes two objects:

### MeasurementPolyline
A user-ordered geographic A→B→C sequence for geometric/model measurement.

### NavigationRoute
A provider-derived network route.

NavigationRoute minimum semantics:
- provider ID/version;
- travel mode;
- canonical origin/destination/waypoints;
- provider geometry in canonical geographic coordinates;
- legs;
- maneuvers/turn-by-turn instructions;
- provider distance;
- provider duration/ETA where available;
- traffic/time assumptions where applicable;
- response timestamp;
- provenance/license/attribution;
- reroute/error state.

Rules:
- provider distance/time retains provider identity;
- rendering on Gleason/AE/WGS84 does not convert it to native model distance;
- the same canonical provider geometry is projected independently per view;
- a Great Circle display guide is not a navigation route;
- an observed aircraft track is not a RouteProvider road path.

## 5. ObserverCelestialSphere vs PhysicalHeavensModel

The project permanently distinguishes these concepts.

### ObserverCelestialSphere

A mathematical/topocentric visualization surface associated with one
`ObserverContext`. It may contain:
- horizon and cardinal directions;
- altitude/azimuth grid;
- Sun/Moon/planet/star apparent positions;
- apparent tracks;
- celestial poles;
- star trails;
- observer-local event geometry.

A dome-shaped ObserverCelestialSphere is a coordinate/visualization construct. It
does not by itself assert that a physical solid dome exists or that a rendered
object physically lies on that surface.

### PhysicalHeavensModel

A separately specified model-native physical interpretation, if a future slice
defines one. Its assumptions, distances, geometry, units, source claims and
limitations must be versioned independently.

Rules:
- never infer a PhysicalHeavensModel from display shape alone;
- rendering a reference result on a dome keeps the result reference-derived;
- an external comparative dome keeps its external-provider identity.

## 6. CelestialComputationProvider

A future celestial engine/adapter must expose a common identity envelope.

Minimum semantics:
- `providerId`;
- `methodId`;
- provider/model version;
- `calculationClass`;
- `TimeContext`;
- optional `ObserverContext`;
- coordinate/reference frame;
- quantities and units;
- source IDs / provenance;
- numerical tolerance, uncertainty or precision statement where meaningful;
- limitations;
- reproducibility fixture/state identifier when available.

Allowed `calculationClass` values:
- `reference-ephemeris`;
- `historical-cycle`;
- `external-comparative-model`;
- `model-native`;
- `display-only`.

Rules:
- computation identity survives rendering on Gleason/AE/WGS84;
- a WGS84/reference ephemeris result rendered on Gleason is still reference
  astronomy rendered on Gleason;
- a Shane/Walter result remains `external-comparative-model`;
- a Babylonian-cycle result remains `historical-cycle`;
- a model-native result requires an independently specified implemented model rule;
- display-only geometry is never upgraded into a computed prediction;
- provider/source disagreement remains visible rather than silently reconciled;
- compatible comparison requires a matching instant plus compatible quantity,
  frame and observer semantics.

## 7. EclipsePredictionProvider

`EclipsePredictionProvider` specializes `CelestialComputationProvider` for
solar/lunar eclipse work.

Each provider advertises explicit capabilities such as:
- eclipse possibility/window;
- event type;
- family/series identity;
- event maximum time;
- local circumstances/contact times;
- magnitude/obscuration;
- observer visibility;
- ground visibility region;
- central line;
- umbra/antumbra/penumbra geometry;
- precise ground path.

Rules:
- unsupported fields remain unavailable;
- a cycle-recurrence provider may not fabricate a precise local ground path;
- historical-cycle outputs may be compared with modern/reference outputs without
  borrowing missing geometry from the reference provider;
- solar-eclipse ground-shadow semantics are not copied onto lunar-eclipse views;
- every event output preserves provider/method/version/time/source identity.

## 8. Registered comparative astronomy source policy

The planning registry is:
`data/sources/astronomy-comparative-sources.yaml`.

Initial registered families:
- Shane Personal Celestial Sphere / FE model:
  `external-comparative-model`;
- Walter Bislin FE-Dome upstream implementation:
  `upstream-reference-implementation` / comparative source;
- NASA solar/lunar Saros references:
  modern `reference-astronomy` for the documented modern cycle parameters;
- Brack-Bernsen & Steele (2005):
  historical-method scholarship for Babylonian 223-month eclipse prediction;
- British Museum Map of the World:
  historical cosmography context only.

Registration is not runtime adoption. Before code reuse or numerical acceptance,
the exact source snapshot/version/hash/license and algorithm path must be audited.

## 9. Celestial evidence classes

Future celestial output must declare enough information to preserve the existing
evidence policy:
- source/model version;
- calculation class;
- observer context if topocentric;
- time context;
- reference frame;
- units;
- numerical limitations.

The project continues to distinguish:
- `SOURCE_TEXT`;
- `SOURCE_CLAIM`;
- `COMPUTED_RESULT`;
- `REFERENCE_RESULT`.

A historical-cycle calculation is normally a `COMPUTED_RESULT` whose method is
historical-cycle; a modern pinned ephemeris/reference output is a
`REFERENCE_RESULT`; an author's statement about why a model works remains a
`SOURCE_CLAIM`.

This contract extends the existing evidence/provenance policy rather than
replacing it.
