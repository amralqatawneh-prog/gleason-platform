# Navigation and measurement requirements — updated 2026-09-21

Status: P5.6 navigation is CLOSED. Phase 5 is ACCEPTED BY OWNER at v0.5.0. Phase 6 is in progress; **P6.1/P6.2/P6.3/P6.4 are CLOSED**. Post-PR21 reconciliation PR #22 is merged at `main @ ba44ae59410e02ae748b235ed9792c8d4ee31b02`; exact final PR head `a76fcff0ac7ad366143645ad722ff5d91183561e` passed Release Acceptance Gates **#671 — SUCCESS** before merge. **P6.5 remains NOT STARTED**.
Source: owner requirements, accepted Phase 5 records, and explicit instruction «ابدأ بتنفيذ Phase 6».
Sequential execution remains enforced: P6.1 defines the closed semantics baseline; P6.2 owns transient ordered route state; P6.3 implements WGS84 geodesic distance; P6.4 implements AE projected-plane distance; Gleason native distance remains P6.5; polygon perimeter/area remains P6.6; P6.7A owns same-route rendering; the newly approved P6.7B owns dedicated RouteProvider/turn-by-turn navigation.

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
2. Ordered multi-stop route state: add/move/remove/reorder points; clear/undo.
   P6.2 supports up to 50 transient points and an explicit direct-map add mode:
   when enabled, a short pick on Gleason, AE or WGS84 appends that geographic
   point to the ordered route. Normal map picking remains selection-only when the
   mode is off. Project geographic geometry independently into each view; never
   measure screen pixels or reuse another engine's coordinates. Numeric segment
   and total quantities remain later measurement work.
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

7. Keep a future navigation route distinct from the measurement polyline. A
   `RouteProvider` result must preserve provider/version/mode/geometry/legs/
   maneuvers/distance/duration/provenance. Drawing that route on Gleason, AE or
   WGS84 never converts provider distance into a native model distance.
8. P6.7B evaluates a turn-by-turn provider (Valhalla is the first candidate
   named by the approved amendment), but provider choice remains a documented
   implementation decision with licensing/offline/error-state tests.

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


## Current boundary after explicit Phase 6 start

- P5.6 navigation: **CLOSED**.
- P5.7 route contract only: **CLOSED**.
- P5.8 state persistence: **CLOSED**.
- P5.9 Phase 5 regression package: **CLOSED — owner manual PASS (10/10), reported by owner**.
- Full Phase 5 acceptance: **ACCEPTED BY OWNER — v0.5.0**.
- Phase 6: **IN PROGRESS**.
- P6.1 Measurement Semantics Contract: **CLOSED — CI #519/#520/#529; owner manual PASS 5/5**.
- P6.2 ordered route state: **CLOSED + MERGED**.
- P6.3 WGS84 geodesic segment/open-polyline distance: **CLOSED + MERGED** through PR #19.
- P6.4 AE projected-plane segment/open-polyline distance: **CLOSED + MERGED** through PR #21.
- P6.5 Gleason native normalized measurement: **NOT STARTED**.
- P6.6 polygon/perimeter/area operations: **NOT STARTED**.
- P6.7A same route / three renderings: **NOT STARTED**.
- P6.7B RouteProvider / turn-by-turn directions: **NOT STARTED**.

P6.2 continues to own transient ordered route state. P6.3 and P6.4 expose separate
numeric measurement identities and do not enable provider-backed road/flight paths.
The dedicated future `RouteProvider` remains unavailable until P6.7B. Gleason native
measurement remains unavailable until P6.5 starts explicitly; perimeter and area
remain unavailable until P6.6. The approved architecture amendment is documented in
`ROADMAP_ARCHITECTURE_AMENDMENT_2026-09-21.md` and
`SHARED_CONTEXT_PROVIDER_CONTRACTS.md`.
