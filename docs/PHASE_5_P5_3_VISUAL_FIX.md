# P5.3 visual corrections — 2026-09-19

Owner reports correct synchronized readings but missing markers on the two
projection maps, and asks for a solid-looking reference globe rather than a
hollow wireframe. This is a P5.3 correction, not P5.3 acceptance or P5.4 start.

## Projection markers

OpenLayers positions overlays using physical left-origin pixels and CSS
transforms. Its overlay element has absolute positioning without an explicit
left inset; inheriting RTL changes its static origin and can place the marker
outside the map even while all geographic coordinates remain correct. Typing
English into an Arabic interface does not change that layout direction.

The map rendering target now explicitly uses `dir="ltr"`, independent of the
surrounding Arabic UI. Headings, search, inspector and readouts retain their
language behavior. No longitude, projected coordinate or camera is adjusted to
compensate for a CSS layout problem.

Previous browser checks mainly selected in the English interface and checked
DOM visibility, not marker containment after Arabic layout. The new regression
tests Arabic/English query strings in both RTL/LTR interfaces and verifies the
actual marker rectangle is inside each map viewport. Synthetic Arabic E2E names
are explicitly TEST_ONLY; real production Arabic-source tests remain separate.

## Solid reference globe

The previous WebGL renderer drew only grid lines, country boundary lines and
place points. It had no filled surface. A closed WGS84 ellipsoid mesh is now
drawn first, with opaque blue color and view-relative display shading. Existing
front-facing overlays draw above it; geographic picking, reverse drag behavior,
rear-marker filtering and numeric providers are unchanged.

The mesh is built once per component mount and uploaded with existing buffers.
It uses the same WGS84 geodetic mapping as the accepted renderer. Shading is a
display convention, not a computed Sun/terminator/day-night result.

This addresses the hollow appearance now. It does **not** claim Google Earth
equivalence or include satellite imagery, textured land, terrain, buildings or
Google assets. Terrain is planned in Phase 13; data-layer/source/licensing work
belongs to the relevant future layers and Phase 16, with final UX in Phase 18.
ADR-014 requires renderer evaluation before heavier terrain/3D data; full
Google-Earth-like functionality is not a promised single future step.

## Files and evidence

- `frontend/src/map2d/ProjectionMap.tsx`: isolate map-coordinate direction.
- `frontend/src/reference/ellipsoidSurface.ts`, `ReferenceGlobe.tsx`: opaque
  ellipsoid mesh, shading and surface render pass.
- `frontend/tests/ellipsoid-surface.test.mjs`: mesh coverage/finite values and
  WGS84 ellipsoid equation, including axes and polar radius.
- `frontend/tests/e2e/acceptance.spec.ts`, `scripts/e2e_backend.py`: two new browser
  scenarios, actual RTL/LTR marker bounds, and a real WebGL framebuffer pixel
  check immediately after the surface draw; screenshot evidence in CI artifacts.
- `frontend/tsconfig.core.json`: include surface generation in the core suite.

At preparation: local 58 core tests, production build and 2 PWA tests PASS.
Local Chromium installation failed with CDN 502/timeouts; browser/production
gates must run in CI. The final exact-commit evidence is recorded on draft PR #9.
Owner retest of these corrections: NOT RUN. P5.3 remains awaiting owner review.

## Update and owner checks

```bash
git switch feat/phase5-shared-state
git pull --ff-only origin feat/phase5-shared-state
docker compose up --build -d
```

Let the online PWA update install, close all old app tabs/windows, then reopen.
No city reimport is needed. Search الدوحة or Doha while the interface is Arabic,
and repeat in English. Verify the two map markers, including after changing
language. A marker outside a manually panned/zoomed viewport still requires
navigation: camera synchronization is not added here. Rotate the globe and
verify its solid surface, selection marker and country/grid overlays.

Sources: current owner report; `frontend/node_modules/ol/Overlay.js` and
`Map.js` for the pinned installed OpenLayers behavior; repository renderer and
`referenceMath.ts` for existing WGS84 mapping; `ROADMAP_CURRENT.md` / ADR-014
for future scope. No new geographic source, historical claim or dependency.

## P5.3 acceptance closure — 2026-09-19

Owner reported «نجحت الاختبارات كلها» after the marker/opaque-surface correction.
Manual result: **PASS — REPORTED BY OWNER**; device/browser/local checkout SHA
were not supplied. P5.3 is closed, including both reported visual issues.
Implementation evidence: commit `3ca3989868b6bcc42e8f1aae8d09f035b1c7a98e`,
[CI #204 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35441426643),
including 58 core tests and 10 Chromium scenarios. This is evidence for that
implementation revision, not a claim of a new test run for this documentation.
P5.4 remains the next implementation slice. Full Phase 5 acceptance is pending;
accepted application version stays 0.4.0. No merge, tag or release.

The owner also requested navigation controls, multi-stop paths and distance/area
measurement, then instructed «اكمل». Scheduling and acceptance requirements are
recorded in `NAVIGATION_MEASUREMENT_REQUIREMENTS.md`; those tools are not yet
implemented by this documentation update.
