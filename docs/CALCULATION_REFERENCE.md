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

Status: **P6.5/P6.6 corrected Gleason measurement semantics VERIFIED + MERGED through PR #31; final closure #784 SUCCESS**

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

The audited Gleason tools are intentionally separate:

- `gleason-map-ruler-derived`: straight GH-0.2.0 map-plane chord. NRU remains
  native. The preferred audited historical display profile is
  `gleason-fig43-circle-derived`: `1 NRU = 21600/pi ≈ 6875.493541569879`
  historical Fig.43 miles, evidence `DERIVED_FROM_DOCUMENTED`. The earlier
  `10800 NM/NRU` profile remains `gleason-radial-60nm-legacy`,
  `SECONDARY_OBSERVED`, comparison-only.
- `gleason-historical-longitude-scale`: Figure 43 latitude-specific
  historical-book miles per longitude degree,
  `60 - (2/3 * latitude_deg)`. It is not a general slanted-segment rule.
- `gleason-frame-time-calculator`: Figures 37–38 / map-frame longitude-time
  conversion. It is a calculator, not route geometry.

No automatic conversion to metres/kilometres is allowed. Derived NM/NM²
map-ruler values must not be mislabeled as WGS84 distance/area or as a
source-defined physical surface metric.

### P6.6 shared polygon semantics

- explicit vertices: 3–50;
- closure: implicit last → first;
- repeated geographic coordinates: rejected;
- zero method-native signed area: fail closed;
- orientation: positive = counterclockwise; negative = clockwise;
- self-intersection: algebraic signed-area policy, not implicit union/fill area;
- no cross-model area normalization.

Full contract: `docs/PHASE_6_P6_6_POLYGON_SEMANTICS.md`.

## 1.1 P6.7A same-route rendering geometry

P6.7A does not introduce a fourth measurement method. It selects one existing
distance computation identity and builds one geometry for cross-view display.

### WGS84 rendering geometry

- computation method: `wgs84-geodesic`;
- calculation model: WGS84;
- unit identity: metre;
- scale basis: WGS84 ellipsoid;
- rendering geometry: `wgs84-ellipsoidal-geodesic`;
- browser geometry engine: `geographiclib-geodesic 2.2.0`, WGS84
  inverse/direct sampling.

Drawing this geometry on AE or Gleason does not turn the method into an AE or
Gleason distance.

### AE rendering geometry

- computation method: `ae-projected-plane`;
- calculation model: AE;
- unit identity: metre;
- scale basis: AE projected-plane SI metre;
- rendering geometry: `ae-straight-projected-chord`.

For each adjacent pair, endpoints are projected to the AE plane and one straight
chord is defined there. Display samples along the chord are inverse-projected
back to canonical geographic coordinates so the identical AE-owned geometry can
be projected independently by all views.

### Gleason rendering geometry

- computation method: `gleason-native-normalized`;
- calculation model: Gleason;
- unit identity: `normalized-radius-unit`;
- scale basis: `gleason-normalized-model-radius`;
- rendering geometry: `gleason-straight-projected-chord`.

For each adjacent pair, endpoints are projected into GH-0.2.0 normalized space
and one straight chord is defined there. Samples are inverse-projected only as
an interchange step for rendering on the other views. This does not convert NRU
to metres or make GH-0.2.0 a formula printed by the historical source.

### Visualization identity

Every destination view carries:

`interpretationRule = preserve-computation-identity`.

Therefore:

`computation identity != visualization identity`.

The destination renderer changes only where the geometry is drawn, not who
computed it, its units, scale basis or semantic class.

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


## Gleason audited scale-profile amendment — 2026-09-21

The default historical scale is now `gleason-fig43-circle-derived`:

`1 NRU = 21600/pi = 6875.493541569879 historical-fig43-mile`.

The prior `10800 NM/NRU` profile is retained only as
`gleason-radial-60nm-legacy` with evidence
`SECONDARY_OBSERVED`.

Walter comparison is parameterized:

`distance = NRU_distance * 2 * EQ`.

For same-latitude Figure 43 work the application exposes both parallel arc and
direct planar chord. These are not interchangeable.

Restored raster source/calibration:
`data/sources/gleason-restored-map.yaml`.
