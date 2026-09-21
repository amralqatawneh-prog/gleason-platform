# Calculation Reference

Status: **LIVING NUMERICAL/SEMANTIC REFERENCE**

This document records calculation identity, units, scale and limitations. It is
not a substitute for source/provenance records; it links numerical meaning to
those records.

## 1. Current measurement methods

### WGS84 geodesic

- method: `wgs84-geodesic`
- quantity currently implemented: distance
- unit: metre
- scale/reference basis: WGS84 ellipsoid
- semantic class: REFERENCE_RESULT
- backend authority: pyproj/PROJ
- browser/offline implementation: GeographicLib JS
- route total: sum of adjacent geodesic segments in the ordered open polyline

A display-only Great Circle guide must not be confused with the ellipsoidal
numeric result or with an observed flight path.

### AE projected plane

- method: `ae-projected-plane`
- quantity currently implemented: distance
- unit: metre
- scale/reference basis: AE projected-plane SI metre
- semantic class: REFERENCE_RESULT
- projection: north-polar Azimuthal Equidistant
- backend: pyproj/PROJ
- browser/offline: proj4
- segment rule: Euclidean distance between independently projected endpoints

AE preserves radial distance from its projection center; arbitrary pairwise
projected-plane distance is not automatically a WGS84 surface geodesic.

### Gleason native normalized measurement

Status: **P6.5 CLOSED + MERGED — final head `03a04679cfa4955340fa91f5f9d75aeeb268b0d7`; Release Acceptance Gates #699 SUCCESS; owner manual 6/6 PASS — REPORTED BY OWNER**

Current P6.5 distance identity:
- method: `gleason-native-normalized`
- distance unit: `normalized-radius-unit`
- area unit: `normalized-radius-unit-squared`
- scale basis: `gleason-normalized-model-radius`
- semantic class: COMPUTED_RESULT unless a future source-grounded rule warrants
  a more specific evidence classification

Current reconstruction uses the project-defined normalized radial rule
`r = (90 - latitude_deg) / 180`.

P6.5 distance rule: project each canonical geographic endpoint with GH-0.2.0,
then calculate Euclidean distance between adjacent projected coordinates and sum
the open polyline. Backend and browser implementations are parity-gated.

No automatic conversion to metres/kilometres is allowed without a separately
documented historical scale or explicit assumption.

## 2. Measurement polyline vs navigation route

The current ordered route is a list of canonical geographic points used by
measurement engines.

A future RouteProvider may return a road/pedestrian/cycling network path with its
own provider distance and duration. That provider result remains separate from
WGS84/AE/Gleason native measurement.

## 3. Future astronomy reference entries

Before Phase 9 calculations become executable, this reference must record:
- pinned ephemeris authority/version;
- supported date range;
- time scales;
- coordinate/reference frames;
- observer transformation;
- topocentric altitude/azimuth convention;
- refraction policy;
- offline approximation/cache policy;
- tolerances and reference cases.

## 4. Future twilight/event definitions

Phase 10 must record exact angular/event definitions for:
- sunrise/sunset;
- civil twilight;
- nautical twilight;
- astronomical twilight;
- any additional culturally/religiously defined event as a separate named
  contract rather than silently equating it with an astronomical twilight angle.

## 5. Future analemma definitions

Solar analemma output must declare:
- observer/location rule;
- fixed local/UTC sampling rule;
- sampling cadence;
- time span;
- reference/model-native identity.

Lunar analemma output must additionally declare the chosen lunar sampling period
and may not be described as a simple annual analogue unless that is exactly the
defined experiment.

## 6. Future eclipse calculations

Phase 12 must separate:
- event occurrence;
- global/top-view path or visibility geometry;
- observer-local circumstances.

Solar and lunar eclipse geometry must not be forced into an identical ground-path
representation.

## 7. Future aviation altitude semantics

Any aviation calculation must distinguish, when supplied:
- barometric altitude;
- geometric altitude;
- MSL;
- AGL.

AGL requires a named terrain/elevation source and its vertical datum/resolution
limitations.
