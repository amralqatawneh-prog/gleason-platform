# P5.5 — Comparability Contract

Started: 2026-09-19 by the owner's explicit continuation instruction «أكمل»
after P5.4 closure. P5.1–P5.4 remain closed. P5.5 is the only active slice;
P5.6 and Phase 6 are not started.

## Purpose

P5.5 defines whether two model quantities may be compared directly. It does
**not** calculate distances, routes or numeric differences. The contract exists
to prevent visually similar numbers, shared unit labels or ad-hoc conversions
from being treated as equivalent quantities.

The rules require compatibility of quantity meaning/dimensionality,
coordinate/reference space, declared unit, declared scale basis and output
availability for the current input. Decisions are typed as `comparable`,
`not-comparable` or `unavailable`, with explicit reasons. P5.5 applies no
conversion or normalization.

## Current model decisions

- Gleason ↔ AE: not directly comparable. Both are planar positions, but they
  belong to different coordinate spaces and use different units. Gleason's
  `normalized-radius` has no declared cross-model metre/kilometre scale.
- Gleason ↔ WGS84 ECEF: not directly comparable because meaning/dimensionality,
  coordinate space and units differ; no normalized-radius conversion is
  invented.
- AE ↔ WGS84 ECEF: not directly comparable even though both use metres. AE is a
  2D projected position while ECEF is a 3D Earth-centred Cartesian position;
  equal unit text alone is insufficient.
- Missing WGS84 ECEF due absent ellipsoidal height remains explicit. If two
  otherwise identical quantities are structurally compatible but one value is
  missing, the contract returns `unavailable`.

A same-model, same-version, same-meaning, same-space, same-unit quantity is
structurally comparable in its own declared unit. P5.5 does not subtract values;
homogeneous difference display belongs to P5.7.

## Implementation

- `frontend/src/comparison/comparability.ts`: typed descriptors, pairwise
  decision rules, explicit reason codes and a guard that rejects invalid
  comparisons.
- `frontend/src/comparison/ModelLaboratory.tsx`: bilingual P5.5 comparability
  panel attached to the accepted P5.4 laboratory.
- `frontend/src/styles.css`: responsive comparison cards.
- `frontend/tests/comparability.test.mjs`: direct contract tests.
- `frontend/tests/e2e/acceptance.spec.ts`: browser gate for no normalization,
  metre-is-not-enough semantics, Arabic/English and mobile layout.
- `frontend/tsconfig.core.json`: compile the comparability contract in core
  tests.

No dependency, dataset, projection formula, adapter calculation or historical
claim is added or changed.

## Scope boundary

P5.5 does not implement distance between places, routes, ruler/polygon area,
Gleason-to-km conversion, numeric difference overlays or navigation controls.

## Verification state at implementation preparation

Automated PASS is not claimed until the exact uploaded revision completes CI.
Owner manual P5.5 verification is **NOT RUN** until that build is delivered.

## Owner manual checklist after CI

1. Select a place and confirm the Model Laboratory shows a comparability section
   with exactly three model pairs.
2. Confirm Gleason ↔ AE is not directly comparable and says normalized-radius is
   not converted to metres/kilometres.
3. Confirm AE ↔ WGS84 is not directly comparable even though both display metre
   units, because their quantity meanings/spaces differ.
4. Confirm no pair displays a numeric difference and no automatic conversion.
5. Switch Arabic/English and phone-sized layout; explanations/statuses remain
   readable without horizontal overflow.

Acceptance criterion: incompatible quantities are rejected for explicit reasons,
normalization never forces agreement, and structural incompatibility remains
separate from temporarily missing output.

Sources: `ROADMAP_CURRENT.md`, `PHASE_5_PLAN.md`, P5.2 adapter contracts and
the accepted P5.4 Model Laboratory. No outside dataset or new historical source
is required.


## Automated verification — CI #266

Exact implementation/documentation head:
`1bf01cda0a1b4273b14f7d1c06a844021e575648`.

[Release Acceptance Gates #266 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35459843476).

Observed results on that exact revision:
- npm security gate: **0 vulnerabilities**;
- frontend core tests: **67 PASS**;
- PWA tests: **2 PASS**;
- Chromium acceptance scenarios: **12 PASS**;
- WGS84 browser/backend parity, production build, service-worker/PWA,
  Docker/PostGIS/Redis, locked production sources, online/offline search and
  Arabic city search gates: **PASS**.

P5.5 is technically green. Owner manual verification remains **NOT RUN** at this
point, so P5.5 is not yet closed and P5.6 must not start.
