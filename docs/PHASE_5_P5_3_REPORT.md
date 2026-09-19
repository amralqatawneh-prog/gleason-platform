# P5.3 — synchronized geographic selection and markers

Started 2026-09-19 after owner reported all P5.2 tests successful, followed by
«اكمل». P5.2 closure is recorded separately. Phase 5 remains in progress.

## Behavior and implementation

One reducer owns the canonical geographic selection and a revision incremented
once per user selection. Search and each model's geographic pick dispatch into
it. Rendering markers never dispatches back. Models receive degrees, not screen
coordinates, and preserve the independent P5.2 contracts.

Gleason and AE now render OpenLayers overlays at their independent adapter's
forward projection of that selection, with coordinate/name readouts. Their maps
and cameras are not recreated when the selection or language changes. WGS84's
marker and readout now consume the parent selection instead of a second local
selection state. Rear-hemisphere markers remain hidden correctly; rotate the
globe to see them. No marker is invented before a user selection.

Existing search-to-WGS84 focus is retained. Incoming map picks do not move other
cameras or impose equal zoom; the optional geographic-focus controls are P5.6.
Search is now labeled “Locate on models” / «اعرض على النماذج». Source identity
and names accompany search selections, and disappear on every free pick.

Any canonical selected point can now be captured in the existing WGS84 geodesic
inspector, including a point picked in Gleason/AE. This remains an explicitly
WGS84 reference calculation; it does not equate historical or AE distances.
The existing readout's explicit surface-height convention is unchanged; the
shared selection does not acquire an invented height.

## Files

- `frontend/src/comparison/selectionState.ts`: reducer, action contract and revision.
- `frontend/src/App.tsx`: common state and model props; reference capture.
- `frontend/src/map2d/ProjectionMap.tsx`: independent projected markers and readouts.
- `frontend/src/reference/ReferenceGlobe.tsx`: controlled selection; separate camera focus.
- `frontend/src/search/PlaceSearch.tsx`: search action label.
- `backend/app/services/capabilities.py`, `backend/tests/test_api.py`: selection
  synchronization capability true, accepted phase still 4, astronomy still false.
- `frontend/tests/selection-state.test.mjs`, `frontend/tests/e2e/acceptance.spec.ts`,
  `frontend/tsconfig.core.json`: reducer and integrated browser coverage.

## Validation and status

Local PASS: 49 backend tests, 57 frontend core tests, production build and 2 PWA
tests. Browser suite now has 8 scenarios: the added scenario checks one revision
per search/pick, equal canonical coordinates across models, actual marker pixel
placement at the clicked location, unchanged WGS84 camera on projection picks,
drag/language/phone changes without selecting, and no stale place identity.
Existing cold-offline and fallback scenarios now check projection readouts too.

Remote CI is pending at preparation; use the exact commit's checks and final
evidence on draft PR #9. Do not inherit the P5.2 CI result for this implementation.
P5.3 coding scope is complete; browser verification and owner manual testing
remain required. Owner manual results: NOT RUN. Known bundle-size warning
persists; this slice does not claim general performance hardening.

## Update and manual checklist

```bash
git switch feat/phase5-shared-state
git pull --ff-only origin feat/phase5-shared-state
docker compose up --build -d
```

Open `http://127.0.0.1:8080`. Let the PWA update install online, close all old
tabs and reopen. Previously corrected city data need not be imported again.

1. Search الدوحة, choose «اعرض على النماذج»: verify matching coordinates/name
   and geographic markers in WGS84, Gleason and AE. Visual positions differ by projection.
2. Pick a free point on each model: the others' coordinates/markers update, old
   place identity clears, and cameras do not jump because another map was clicked.
   Markers outside a panned map viewport or behind the globe require navigation.
3. Rotate/zoom, switch AR/EN and repeat offline after caching. These navigation
   actions must not change the selected geographic point. Try WGS84 A/B capture
   using a point selected in either projection.

No reload persistence (P5.8), model laboratory (P5.4), comparability/deltas
(P5.5/P5.7), or optional camera-focus feature (P5.6) is claimed. Next planned
slice is P5.4; it has not started. No merge, tag or release.

Sources: `PHASE_5_PLAN.md`, `ROADMAP_CURRENT.md`, `PHASE_5_P5_2_REPORT.md`,
the existing geographic selection/adapters, OpenLayers integration and WGS84
renderer source listed above. No new source dataset, dependency or historical
claim is introduced.

Owner review identified a visual defect despite CI #202 success: correct readings but missing projection markers, plus a request for a solid globe. See `PHASE_5_P5_3_VISUAL_FIX.md` for the correction, stronger visual checks and future imagery/terrain boundary. This review was pending until the later acceptance closure below.

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
