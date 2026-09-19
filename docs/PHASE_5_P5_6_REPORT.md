# P5.6 — Optional Geographic Focus / Navigation

Started/authorized: 2026-09-19 by the owner's explicit instruction «أكمل» after
P5.5 closure.

## Repository reconciliation note

At the start of this continuation audit, P5.6 navigation code and regression
commits were already present on the working branch while the canonical handoff
and Phase 5 plan still described P5.6 as NOT STARTED. This report reconciles the
actual repository state, reviews the implementation against the approved
requirements, fixes the remaining WGS84 wheel regression/build typing issue, and
does not duplicate already-present code.

P5.1–P5.5 remain closed. P5.6 is the only active slice. P5.7 and Phase 6 are
not started.

## Delivered navigation behavior

### Gleason and AE OpenLayers views

Each 2D model has its own independent camera/view state and visible controls for:

- zoom in / zoom out;
- mouse-wheel zoom;
- native OpenLayers touch/pinch navigation;
- explicit zoom-to-area mode using a drag rectangle;
- rotate left / rotate right;
- reset orientation to 0°;
- fit full model;
- focus the current canonical geographic selection.

Navigation updates the model's own view only. It does not copy zoom, rotation or
center to the other models, and it does not increment the shared geographic
selection revision.

The model marker remains geographic: it is reprojected from the canonical
selection after camera navigation. OpenLayers inverse picking continues to use
the active rotated/zoomed view transform.

### WGS84 WebGL2 reference view

The reference globe has independent navigation state for:

- bounded zoom;
- mouse-wheel zoom through a native non-passive listener local to the surface;
- two-pointer pinch zoom;
- horizontal rotation (yaw);
- vertical view-direction/tilt (pitch);
- explicit rectangle zoom-to-area;
- reset view direction;
- fit full model;
- focus current selection.

Rendering, labels, marker projection and inverse picking all use the same
zoom/yaw/pitch state. This prevents a zoomed or rotated display from selecting a
different geographic point than the point visually clicked.

### WGS84 2D fallback

The fallback retains:

- zoom in/out and wheel zoom;
- pinch zoom;
- drag pan;
- rectangle zoom-to-area;
- fit full model;
- focus selected location.

3D rotation and pitch controls remain visible but disabled with an explicit
tooltip because a north-up 2D fallback has no equivalent 3D globe orientation.

## Selection and camera separation

P5.6 preserves the core Phase 5 contract:

- geographic selection is canonical WGS84 latitude/longitude;
- each model owns its own camera/zoom/rotation;
- navigation never creates a new selection by itself;
- focus is an explicit navigation action, not a free-point selection event;
- zoom values are not normalized or equated between Gleason, AE and WGS84.

## Zoom-to-area semantics

Zoom-to-area is an explicit mode. Ordinary drag keeps the normal pan/rotation
behavior. A rectangle drag changes only the active view and exits area mode after
completion where supported. It does not create a point selection.

The control frames the dragged visible region; it does not claim that zooming
adds higher-resolution geographic source data.

## Key implementation files

- `frontend/src/map2d/ProjectionMap.tsx`
- `frontend/src/reference/ReferenceGlobe.tsx`
- `frontend/src/reference/referenceMath.ts`
- `frontend/src/styles.css`
- `frontend/tests/reference-globe.test.mjs`
- `frontend/tests/e2e/acceptance.spec.ts`
- `docs/NAVIGATION_MEASUREMENT_REQUIREMENTS.md`

No new dependency, external dataset, projection formula, historical claim or
measurement engine is introduced.

## Automated verification

Final audited code head:
`378f0a8ed6710195cb1e48e0ebcd4518116a5d0d`.

[Release Acceptance Gates #329 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35462318226)

Observed on that exact revision:

- npm security gate: **0 vulnerabilities**;
- frontend core tests: **71 PASS**;
- PWA tests: **2 PASS**;
- Chromium acceptance scenarios: **14 PASS**;
- production TypeScript/Vite build: **PASS**;
- WGS84 browser/backend parity: **PASS**;
- Docker/PostGIS/Redis and existing Phase 2–4 API gates: **PASS**;
- locked production source, online/offline search and Arabic city gates: **PASS**.

The successful revision includes the WGS84 native wheel listener type correction
and a real browser wheel gesture aimed at the surface listener.

## Automated P5.6 coverage

The navigation regression coverage verifies:

- changing Gleason zoom/rotation does not change AE or WGS84 camera state;
- camera actions preserve the shared selection revision;
- explicit focus preserves selection;
- 2D and WGS84 rectangle zoom do not create point selections;
- AE mouse-wheel zoom works;
- WGS84 button/wheel/rotation/pitch/focus work;
- keyboard activation of a navigation button works;
- Arabic/English labels and mobile-width layout remain readable;
- WebGL-disabled fallback exposes supported navigation and disables unsupported
  3D orientation controls;
- WGS84 projection and inverse picking remain reciprocal across zoom levels;
- pinch zoom is bounded;
- zoom-aware inverse picking is tested near both poles and the ±180°
  antimeridian.

## Scope boundary

P5.6 does **not** implement:

- route drawing between countries/cities;
- multi-stop route state;
- ruler/measurement;
- distance or area engine;
- polygon perimeter/area;
- road or flight routes;
- cross-model numeric zoom equality.

Those remain in Phase 6 as recorded in
`NAVIGATION_MEASUREMENT_REQUIREMENTS.md`.

## Owner manual checklist

The owner completed the delivered manual checklist and reported: «نجحت كل الاختبارات». Record manual result as **PASS — REPORTED BY OWNER**. Device/browser/local checkout SHA were not supplied.

1. Search for Doha or another city. On Gleason, use +/−, mouse wheel, rotate
   left/right, reset, fit full model and focus selected. The selected point must
   remain the same.
2. Repeat on AE. Changing AE must not move/rotate/zoom the Gleason or WGS84
   camera.
3. On Gleason or AE activate «تكبير إلى منطقة / Zoom to area», drag a rectangle,
   and confirm it zooms without creating a new geographic selection.
4. On WGS84 test +/−, wheel, rotate left/right, tilt up/down, reset, fit and focus.
   After zoom/rotation, clicking a visible geographic point/marker must still
   resolve correctly.
5. On WGS84 activate zoom-to-area and drag a rectangle. It must zoom without
   changing the selected geographic point.
6. If a touch device is available, test pinch zoom. If not, this manual item may
   remain NOT RUN; automated pinch-contract coverage is recorded above.
7. Switch Arabic/English and use a phone-sized window. Controls must remain
   readable without horizontal overflow.
8. Optional fallback check: with WebGL unavailable, zoom/focus must work while
   rotate/tilt controls are visibly disabled rather than pretending to work.

Acceptance criterion: all supported navigation actions are explicit and
camera-local, preserve shared geographic selection unless the user deliberately
picks a point, and keep inverse picking geographically correct after navigation.

## Status

**CLOSED / ACCEPTED FOR THIS SLICE — automated gates PASS and owner manual checks PASS.**

P5.7 remains NOT STARTED. Full Phase 5 acceptance remains pending. Accepted
application version remains 0.4.0. Draft PR #9 remains open/unmerged. No merge,
tag or release is authorized.


## P5.6 acceptance closure — 2026-09-19

After the technically green P5.6 build and the delivered manual checklist, the
owner reported:

> «نجحت كل الاختبارات»

Manual result: **PASS — REPORTED BY OWNER**. Device/browser/local checkout SHA
were not supplied.

Final automated evidence before owner acceptance:
- audited implementation head
  `378f0a8ed6710195cb1e48e0ebcd4518116a5d0d` — CI #329 SUCCESS;
- documented branch head
  `3de1169c0f1534b9f0417dda81de8176f8f99b2c` — CI #340 SUCCESS.

P5.6 is now **CLOSED**. P5.7 Homogeneous Differences and future time/layer/route
contracts is the next ordered slice and remains **NOT STARTED** until the owner
explicitly instructs continuation. Phase 6 routes/ruler/area remain NOT STARTED.

Full Phase 5 acceptance remains pending. Accepted application version remains
0.4.0. Draft PR #9 remains open/unmerged. No merge, tag or release is implied or
authorized.
