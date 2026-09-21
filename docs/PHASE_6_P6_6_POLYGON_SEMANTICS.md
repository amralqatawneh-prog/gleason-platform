# Phase 6 — P6.6 Polygon / Perimeter / Area Semantics

Status: **IN PROGRESS**

Start baseline: `main @ 1c64285b92c093365b74f3256aa9557b9a48268e`  
Working branch: `feat/p6.6-polygon-perimeter-area`  
Owner instruction: **«ادمج PR #30 وابدأ P6.6»**

## 1. Canonical polygon identity

P6.6 reuses the transient ordered geographic points from P6.2. The canonical
identity remains WGS84 latitude/longitude plus the existing point identity and
provenance. Screen pixels and another model's projected coordinates are never
shared as polygon identity.

The polygon ring is **implicitly closed**. If the ordered vertices are
A → B → C, perimeter/area uses A → B → C → A. The caller must not repeat A as
an explicit final vertex.

## 2. Input validity

A polygon operation requires:

- at least 3 and at most 50 ordered vertices;
- non-empty unique point IDs;
- finite latitude in [-90, 90] and longitude in [-180, 180];
- no repeated geographic coordinate pair anywhere in the explicit vertex list;
- a non-zero method-native signed area after computation.

Repeated geographic coordinates fail closed, including an explicit duplicate of
the first vertex at the end. Collinear/degenerate geometry is method-specific:
if the selected computation space produces zero area within its numerical
tolerance, that engine returns no numeric polygon result.

## 3. Self-intersection policy

P6.6 does **not** silently invent a union/fill interpretation for a
self-intersecting ring. The policy is:

`algebraic-signed-area`

Self-intersecting ordered rings are therefore evaluated algebraically in the
chosen computation space. Oppositely oriented lobes can cancel. If the
algebraic area becomes zero within tolerance, the result is degenerate and
fails closed.

This matches the documented GeographicLib/PROJ polygon-area behavior used by
the WGS84 engine and the signed shoelace accumulation used by the two planar
engines.

## 4. Orientation and primary area

Every engine exposes:

- signed area;
- orientation: `counterclockwise` for positive signed area and `clockwise`
  for negative signed area;
- primary area = absolute value of the signed area;
- closed perimeter including the final edge from the last vertex to the first.

Reversing a valid ring must preserve perimeter and primary area while negating
signed area and reversing orientation.

## 5. Interior / complement semantics

### WGS84

Method: `wgs84-geodesic`.

The WGS84 backend uses `pyproj.Geod.polygon_area_perimeter`; the independent
browser implementation uses GeographicLib `Geodesic.WGS84.Polygon(false)`
with `Compute(false, true)`.

The signed-result mode is used, so traversal direction changes the sign instead
of automatically returning the rest-of-earth complement. P6.6 labels this
interior rule:

`signed-half-surface-range`

No road/flight semantics are implied.

### Azimuthal Equidistant

Method: `ae-projected-plane`.

Each canonical geographic vertex is independently projected into the existing
north-polar AE plane. Closed-edge perimeter is Euclidean in metres. Signed area
is the shoelace area in square metres.

Interior rule:

`absolute-algebraic-planar-area`

Projection distortion is part of this method. AE metres/m² are not relabeled as
WGS84 geodesic quantities.

### Gleason derived normalized model

Method: `gleason-native-normalized`.

Each canonical geographic vertex is independently projected through the
project-derived GH-0.2.0 reconstruction. Closed-edge perimeter is Euclidean in
`normalized-radius-unit`. Signed area is shoelace area in
`normalized-radius-unit-squared`.

Interior rule:

`absolute-algebraic-planar-area`

There is no automatic conversion to metres, kilometres, m² or km².

## 6. Antimeridian and polar behavior

- WGS84 delegates geodesic edge/area handling to the pinned geodesic algorithm.
- AE and Gleason do not unwrap into WGS84 geodesic geometry. Canonical
  longitudes are projected independently into each model, then measured in that
  model's plane.
- Polar coordinates retain method-specific behavior. P6.6 does not silently
  collapse or rewrite longitude at a pole.

## 7. Cross-model rule

No cross-model area normalization is introduced.

A WGS84 area rendered next to an AE or Gleason area retains its own method,
units, scale basis and provenance. Equal-looking numbers do not become directly
comparable merely because they are displayed together.

## 8. Numerical authorities

- Backend WGS84: pyproj/PROJ `Geod.polygon_area_perimeter`.
- Browser WGS84: `geographiclib-geodesic` PolygonArea.
- Backend/browser AE: the existing independent north-polar AE projection,
  followed by Euclidean edge lengths and signed shoelace area.
- Backend/browser Gleason: the existing GH-0.2.0 derived normalized
  reconstruction, followed by Euclidean edge lengths and signed shoelace area.

P6.6 acceptance requires backend/browser parity where both implementations
exist, plus reversed-order, repeated-point, degenerate, antimeridian and polar
coverage.


## 9. Backend / browser parity tolerances

Parity compares two independent implementations rather than forcing bitwise
identity:

- WGS84: perimeter < `1e-5 m`; area < `0.1 m²`.
- AE: perimeter < `0.1 m`; area tolerance is
  `max(1 m², 5e-9 × |backend area|)` (five parts per billion). This accommodates the already accepted
  sub-centimetre-to-centimetre class differences between browser proj4 and
  backend pyproj/PROJ at very large projected coordinates without changing the
  method identity or displayed precision.
- Gleason normalized: perimeter and area differences < `1e-12` in native
  normalized units.

A tolerance is an acceptance bound between implementations; it is not an added
measurement uncertainty model and must not be presented as one.
