# Navigation and measurement requirements — 2026-09-20

Status: P5.6 navigation implementation is CLOSED after CI #329/#340 and owner-reported manual PASS. Phase 6 measurement requirements remain future / NOT STARTED.
Source: owner message following successful P5.3 retest and later continuation instructions.
Sequential execution remains enforced: P5.6–P5.9 are closed. Full Phase 5 owner acceptance is still pending. Phase 6 paths/ruler/area remain NOT STARTED and require Phase 5 acceptance plus an explicit Phase 6 start instruction.

## P5.6 — navigation on all three views

- Visible zoom-in/out controls, wheel zoom, and touch pinch on supported devices.
- Explicit zoom-to-area mode: drag a rectangle to frame a country/region. Ordinary
  drag retains pan/rotation behavior; mode changes must not create point selections.
- Visible rotation controls on Gleason, AE and WGS84; reset orientation and fit
  full model controls. Globe additionally supports view-direction changes.
- Optional focus on the selected geographic location across views. Independent
  cameras and scales; do not equate numeric zoom across different projections.
- Define camera transforms and inverse picking together: rotated/zoomed views
  must still select the correct geography. Preserve selection while navigating.
- Test Arabic/English, keyboard/buttons, mouse wheel, touch/pinch, offline,
  model edges/poles/antimeridian, and the supported WGS84 fallback behavior.
- Zoom does not add higher-resolution geographic data. Country-boundary fitting
  must use actual available geometry; absent detail remains explicit.

### P5.6 implementation status — 2026-09-19

Implemented on all three views with independent cameras/scales:
- visible zoom controls, wheel zoom, touch/pinch support;
- explicit zoom-to-area mode;
- Gleason/AE rotation/reset/fit/focus controls;
- WGS84 zoom/yaw/pitch/reset/fit/focus and zoom-aware picking;
- fallback navigation with unsupported 3D orientation controls explicitly disabled;
- selection-preservation and camera-independence regression coverage.

Exact audited code head `378f0a8ed6710195cb1e48e0ebcd4518116a5d0d`
passed CI #329 with 71 frontend core tests, 2 PWA tests and 14 Chromium
scenarios plus full release gates. Owner manual verification is PASS — REPORTED BY OWNER («نجحت كل الاختبارات»).
See `PHASE_5_P5_6_REPORT.md`.

The requirement that zoom not add source detail remains unchanged. Current
zoom-to-area frames the dragged visible region; it does not claim a new
higher-resolution country dataset.

## Phase 6 — paths, ruler and polygon area

1. Define explicit geographic endpoints: selected cities/capitals/custom points.
   A country name alone is not a unique distance endpoint. Boundary-to-boundary
   distance would be a separate operation, not an implicit alternative.
2. Ordered multi-stop route state: add/move/remove/reorder points; clear/undo;
   display each segment and total. Project geographic geometry independently into
   each view; never measure screen pixels or reuse another engine's coordinates.
3. Define path semantics first. A WGS84 geodesic displayed on all views retains
   its WGS84 label; a model-native path is a separate calculation with its own
   method, units and provenance. It is not a road/flight route without such data.
4. Interactive ruler: two points or an open polyline, live segment/total distances;
   polygon tool: closed ordered points with perimeter and area. Require at least
   three distinct non-collinear vertices; define self-intersection handling,
   polygon interior/complement and antimeridian/polar behavior before acceptance.
5. Implement WGS84 reference distance/area with documented numerical authority and
   local/server parity. AE results explicitly describe projected-plane versus
   geodesic quantities and distortion. Gleason normalized-radius results must
   not silently become km or km² without a documented scale or labeled assumption.
6. Validate reference cases, reversed ordering, repeated points, degenerate inputs,
   poles/antimeridian, edits and all three renderings, plus online/offline parity.
   If a view cannot represent a supported path safely, report its limitation.

### P5.7 route-contract status — CLOSED 2026-09-19

P5.7 declares a versioned route-service boundary with status `unavailable`
and no available operations. The owner reported all P5.7 manual tests PASS; CI #383/#387 are recorded in `PHASE_5_P5_7_REPORT.md`. This is deliberately a fail-closed contract, not a
route engine. The UI states that route drawing, path semantics, distance, ruler
and area remain Phase 6 work.

P5.7 only prepares versioned route contracts; it does not deliver this measurement
engine. Long-term saved routes/experiments belong to Phase 17; final tool styling,
presentation mode and exports to Phase 18. Core usability is not deferred to 18.

## Sources

- Owner's current requirements and test-success statement in this conversation.
- `ROADMAP_CURRENT.md`: Phase 5/6 boundary, phases 17–18, units and country endpoints.
- `PHASE_5_PLAN.md`: ordered slices and independent camera policy.
- `frontend/src/map2d/ProjectionMap.tsx`: existing OpenLayers view/selection behavior.
- `frontend/src/reference/ReferenceGlobe.tsx`: current custom globe drag/picking.
- `PHASE_5_P5_3_VISUAL_FIX.md`: accepted marker and opaque-surface correction scope.

No new external source, library choice or numerical algorithm is claimed here;
implementation will verify primary documentation for the selected algorithms.


## Current boundary after P5.9 closure

- P5.6 navigation: **CLOSED**.
- P5.7 route contract only: **CLOSED**.
- P5.8 state persistence: **CLOSED**.
- P5.9 Phase 5 regression package: **CLOSED — owner manual PASS (10/10), reported by owner**.
- Full Phase 5 acceptance: **PENDING separate explicit owner decision**.
- Phase 6 route drawing, ordered multi-stop state, ruler, distance, perimeter and area: **NOT STARTED**.

The route contract being present in code must never be interpreted as a route or measurement engine. `availableOperations` remains empty until the approved later implementation replaces that unavailable boundary.
