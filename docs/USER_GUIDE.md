# User Guide

Status: **LIVING DOCUMENT — current capabilities plus clearly marked future scope**

## 1. What the application is

Gleason Comparison Platform compares the same canonical geographic location or
ordered points across three independent views:

- Gleason Historical
- AE Visualization
- WGS84 Reference

The application is designed to show where calculations come from rather than
forcing the three models to agree.

## 2. What is implemented now

Current accepted/product state includes:
- search and canonical geographic selection;
- synchronized markers across all three views;
- independent pan/zoom/navigation;
- Model Laboratory/provenance display;
- transient multi-point ordered route state;
- WGS84 geodesic distance;
- AE projected-plane distance;
- Gleason normalized native distance;
- P6.6 closed-polygon perimeter and area for WGS84, AE and Gleason, with each result retaining its own units and method identity;
- offline-capable foundations and bilingual Arabic/English UI.

P6.4, P6.5 and P6.6 are closed. P6.6 **Polygon / Perimeter / Area is VERIFIED + MERGED** through PR #31 at `main @ 6a2666112e56514051ea62fbe1c25f5a8016f1ae`. Add at least three ordered points; the polygon closes automatically from the last point to the first. Do not repeat the first vertex manually.

## 3. Understanding measurements

A displayed line and a displayed number are not automatically the same kind of
result.

Examples:
- WGS84 geodesic distance follows the WGS84 reference computation.
- AE projected-plane distance measures straight Euclidean separation in the AE
  projected plane.
- Gleason native measurement uses normalized Gleason-plane units (`normalized-radius-unit`) and is not automatically converted to metres/kilometres.
- a future road-navigation route will carry the routing provider's identity,
  distance and time even when drawn on all three views.

For P6.6, WGS84 reports geodesic perimeter in metres and ellipsoidal area in
m²; AE reports projected-plane perimeter/area in m/m²; Gleason reports
normalized-radius units and squared normalized-radius units. These are not
silently normalized to match each other. Reversing vertex order changes signed
area orientation but not primary area or perimeter.

Always read the method/unit/provenance labels.

## 3.1 Same route — three renderings (P6.7A)

P6.7A is **CLOSED / VERIFIED / MERGED** through PR #34. The ordered A → B → C → … route still
comes from the one transient P6.2 route list.

The new **Same route — three renderings** panel lets you choose which
calculation identity owns the line shown on all three views:

- **WGS84 geodesic**;
- **AE projected-plane chord**;
- **Gleason normalized-plane chord**.

All three views then show the same selected path geometry, projected into each
view independently. The view does not rename the calculation. For example,
a WGS84 geodesic drawn on the Gleason view is still a WGS84 geodesic rendered
on Gleason; it is not a Gleason distance.

The existing WGS84, AE and Gleason numeric measurement panels remain separate.
Changing the P6.7A visual computation identity does not rewrite their numbers.

P6.7A does not provide a road route, flight track, ETA or turn-by-turn
instructions. Those provider-backed navigation semantics remain P6.7B/future
work.

## 3.2 Gleason SI profiles (P6.C2)

P6.C2 is the active Phase 6 slice and is awaiting owner manual verification
after final-contract reconciliation CI. In the Gleason Measurement Laboratory:

- **DIRECT SI** is currently the Walter external-comparative profile; it is not
  relabeled as Gleason historical.
- Figure 43 SI presentations appear only as **EXPLICIT ASSUMPTION** profiles.
- the direct `gleason-book-historical` SI conversion remains **FAIL CLOSED /
  UNRESOLVED**.
- every executable card exposes its calculation space and, when applicable, its
  explicit assumption id.
- the native value/unit, conversion basis, provenance and limitations remain
  visible beside m/km/NM outputs.

The result does not treat the UI route revision as a numerical input. It returns
the route id and exact ordered point snapshot used for the calculation.

## 4. Planned observer and astronomy features

Approved future scope includes:
- current-location observer selection;
- placing an observer pin on a map;
- a virtual `ObserverCelestialSphere` with horizon/cardinal directions;
- Sun/Moon/planet/star tracks where supported;
- day/night and twilight bands;
- numerical sunrise/sunset/twilight events;
- solar and lunar analemmas;
- multi-method eclipse top-view and observer-view laboratories;
- comparison between modern reference astronomy, historical-cycle calculations,
  audited Shane/Walter comparative outputs, and future model-native outputs when
  those engines actually exist;
- reproducible experiment URLs/IDs that restore declared observer/time/provider
  state.

The observer dome is a mathematical/visual sky surface. It is not automatically a
claim that celestial objects physically lie on a solid dome.

The future eclipse laboratory will include a documented Babylonian
**223-Month Eclipse Cycle (later called Saros)** method alongside modern
reference calculations. A cycle recurrence result will be shown with its own
limitations and will not be presented as a precise local eclipse path unless that
specific provider actually calculates one.

These are roadmap features and are not yet implemented.

## 5. Planned high-detail maps and routing

Approved future scope includes:
- detailed streets/cities/buildings/POIs from licensed/open sources;
- regional/offline map packs where licensing permits;
- turn-by-turn routing through a dedicated RouteProvider;
- independent rendering of the same canonical route on all three models.

A turn-by-turn navigation route is not the same object as the current
measurement polyline.

## 6. Planned aviation laboratory

Approved future scope includes provider-dependent:
- live aircraft positions;
- historical tracks/replay;
- future/scheduled flights;
- aircraft/operator metadata;
- receiver-station provenance when supplied;
- altitude context including AGL when terrain data allows it.

Missing provider data will remain visibly unavailable rather than being guessed.

## 7. Privacy and permissions

Future precise current-location features will request browser/device geolocation
permission. A denied permission must not be bypassed by pretending an approximate
IP location is precise.

## 8. Final guide

This document will grow with each accepted slice. Phase 21 will validate and
polish the complete user guide against the final executable behavior.
