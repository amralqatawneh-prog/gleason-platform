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
- offline-capable foundations and bilingual Arabic/English UI.

P6.4 is closed. P6.5 Gleason native numerical measurement is **CLOSED + MERGED** through PR #25; its final head `03a04679cfa4955340fa91f5f9d75aeeb268b0d7` passed Release Acceptance Gates #699 and the owner reported 6/6 manual PASS. P6.6 remains **NOT STARTED**.

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

Always read the method/unit/provenance labels.

## 4. Planned observer and astronomy features

Approved future scope includes:
- current-location observer selection;
- placing an observer pin on a map;
- a virtual observer sky dome;
- Sun/Moon/planet/star tracks where supported;
- day/night and twilight bands;
- numerical sunrise/sunset/twilight events;
- solar and lunar analemmas;
- eclipse top-view and observer-view laboratories.

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
