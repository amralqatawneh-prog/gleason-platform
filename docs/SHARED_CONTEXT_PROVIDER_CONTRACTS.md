# Shared Context & Provider Contracts

Status: **ROADMAP CONTRACT — NOT YET IMPLEMENTED AS A COMPLETE SERVICE**

Date: 2026-09-21

These contracts prevent future astronomy, observer, external-layer and routing
features from inventing incompatible state models. They describe semantic
requirements, not a claim that the services already exist.

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

## 5. Celestial computation identity

Future celestial output must declare:
- reference/model-native/display-only class;
- ephemeris/model version;
- observer context if topocentric;
- time context;
- reference frame;
- units;
- numerical limitations.

This contract extends the existing SOURCE_TEXT / SOURCE_CLAIM / COMPUTED_RESULT /
REFERENCE_RESULT and evidence/provenance policy rather than replacing it.
