# Calculation Reference

Status: **LIVING NUMERICAL/SEMANTIC REFERENCE**

This document records calculation identity, units, scale and limitations. It is
not a substitute for source/provenance records; it links numerical meaning to
those records.

## 1. Current measurement methods

### WGS84 geodesic

- method: `wgs84-geodesic`
- quantities currently implemented: distance, perimeter, area
- linear unit: metre
- area unit: square-metre
- scale/reference basis: WGS84 ellipsoid
- semantic class: REFERENCE_RESULT
- backend authority: pyproj/PROJ
- browser/offline implementation: GeographicLib JS
- route total: sum of adjacent geodesic segments in the ordered open polyline
- polygon perimeter: closed WGS84 geodesic ring
- polygon area: signed ellipsoidal area; primary displayed area is its absolute value
- polygon backend: `pyproj.Geod.polygon_area_perimeter`
- polygon browser/offline: GeographicLib PolygonArea `Compute(false, true)`

A display-only Great Circle guide must not be confused with the ellipsoidal
numeric result or with an observed flight path.

### AE projected plane

- method: `ae-projected-plane`
- quantities currently implemented: distance, perimeter, area
- linear unit: metre
- area unit: square-metre
- scale/reference basis: AE projected-plane SI metre
- semantic class: REFERENCE_RESULT
- projection: north-polar Azimuthal Equidistant
- backend: pyproj/PROJ
- browser/offline: proj4
- segment rule: Euclidean distance between independently projected endpoints
- polygon perimeter: Euclidean closed ring after AE projection
- polygon area: signed shoelace area in the AE plane; primary area is the absolute value

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
the open polyline.

P6.6 polygon rule: project each canonical vertex independently with GH-0.2.0,
close the ring implicitly, sum Euclidean closed-edge perimeter, and calculate
signed shoelace area in `normalized-radius-unit-squared`. The primary area is
the absolute value. Backend/browser parity is required.

No automatic conversion to metres/kilometres is allowed without a separately
documented historical scale or explicit assumption.

### P6.6 shared polygon semantics

- explicit vertices: 3–50;
- closure: implicit last → first;
- repeated geographic coordinates: rejected;
- zero method-native signed area: fail closed;
- orientation: positive = counterclockwise; negative = clockwise;
- self-intersection: algebraic signed-area policy, not implicit union/fill area;
- no cross-model area normalization.

Full contract: `docs/PHASE_6_P6_6_POLYGON_SEMANTICS.md`.

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
- tolerances and reference cases;
- provider/method/version/source IDs;
- calculation class:
  `reference-ephemeris`, `historical-cycle`,
  `external-comparative-model`, `model-native` or `display-only`.

Rendering does not change calculation class.

The planning source registry is
`data/sources/astronomy-comparative-sources.yaml`. Shane/Walter are comparative
sources, not automatic reference-validation truth. Their exact source snapshot and
algorithm path must be audited before numerical fixtures are accepted.

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

### 6.1 EclipsePredictionProvider capability rule

Each provider must advertise supported outputs. A result may contain only the
fields that provider actually calculates or sources. Missing geometry remains
missing.

Examples of independent capabilities:
- eclipse possibility/window;
- family/series;
- event maximum time;
- local contact times;
- magnitude/obscuration;
- observer visibility;
- central line;
- umbra/antumbra/penumbra;
- precise ground path.

### 6.2 Babylonian 223-Month Eclipse Cycle

Planned class: `historical-cycle`.

Historical-method source:
Brack-Bernsen & Steele (2005), DOI
`10.1111/j.1600-0498.2005.470301.x`.

Modern Saros parameter cross-check:
NASA solar/lunar Saros periodicity references.

Initial numerical relationship to document/test at implementation:
- 223 synodic months;
- approximately 242 draconic months;
- approximately 239 anomalistic months;
- approximately 6585.32 days for the modern mean Saros relationship.

The historical engine must distinguish the historically reconstructed rule from
modern mean orbital-period values. NASA values are not to be back-labeled as
Babylonian tablet numbers.

Saros recurrence alone is not a complete precise local ground-path calculation.
Any Exeligmos, TU 11, BM 45861, 5/6-month or Goal-Year rule must be implemented
only after exact scholarly/tablet evidence is extracted and cited.

### 6.3 Comparative eclipse matrix

Future comparison may include:
- modern reference provider;
- Babylonian historical-cycle provider;
- audited Shane/Walter external-comparative provider;
- future model-native provider.

Comparisons report compatible quantities such as time/angular/path differences
without borrowing unsupported fields or changing provider identity.

## 7. Future aviation altitude semantics

Any aviation calculation must distinguish, when supplied:
- barometric altitude;
- geometric altitude;
- MSL;
- AGL.

AGL requires a named terrain/elevation source and its vertical datum/resolution
limitations.
