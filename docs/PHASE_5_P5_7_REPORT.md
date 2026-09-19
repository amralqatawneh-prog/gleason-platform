# P5.7 — Homogeneous Differences and Future Service Contracts

Started: 2026-09-19 by the owner's explicit instruction «أكمل» after P5.6
closure. P5.1–P5.6 remain closed. P5.7 is the only active slice; P5.8 and
Phase 6 are not started.

## Purpose

P5.7 extends the accepted P5.5 comparability contract with two protections:

1. a numeric difference may be produced only when the two quantities are already
   structurally comparable under P5.5;
2. future time, shared-layer and route services have explicit versioned
   contracts whose current status is unavailable, so the UI never implies that
   these later engines already exist.

P5.7 does not weaken or bypass P5.5. If P5.5 says a pair is not comparable,
P5.7 must expose no numeric delta.

## Homogeneous difference contract

`frontend/src/comparison/homogeneousDifference.ts` implements a signed
component difference:

`delta = right - left`

only after a `ComparabilityDecision` is `comparable`.

The result retains the already-declared comparison unit and records
`conversionApplied: false`. P5.7 additionally requires the two adapter domains and output structures to match before producing any delta. No normalization or unit conversion is introduced.

Examples covered by the contract:

- AE position ↔ AE position with the same model/version/space/unit: allowed;
  ΔX/ΔY remain in metres.
- Gleason position ↔ Gleason position with the same
  model/version/space/unit: allowed; ΔX/ΔY remain in `normalized-radius`.
- Gleason ↔ AE: blocked; no numeric delta.
- AE ↔ WGS84 ECEF: blocked even though both may use metre text, because the
  quantity meaning and coordinate space differ.
- Any non-comparable or unavailable pair produces no numeric values.
- Even if a future descriptor accidentally passes P5.5, a different adapter domain or output structure is fail-closed in P5.7 and produces no numeric values.

The current Model Laboratory compares the three different model outputs for one
canonical geographic selection. Those three cross-model pairs are heterogeneous,
so the user-visible P5.7 result correctly shows **no numeric cross-model
difference** for all three pairs. This is an intentional contract result, not a
missing calculation.

## Future service contracts

`frontend/src/comparison/futureServices.ts` declares contract version 1 for
three future service boundaries:

- `time`: unavailable in Phase 5; astronomy/time/timeline implementation is
  planned for later phases 9–10.
- `layer-sync`: unavailable as a shared cross-model service. Existing local
  view layers are not disabled or relabeled as absent; only the shared
  cross-model layer-state service is unavailable. The advanced layer system is
  planned for phase 16.
- `route`: unavailable in Phase 5. P5.7 reserves only a versioned boundary;
  route drawing, path semantics, distance, ruler and polygon-area engines remain
  Phase 6 work.

Each contract has `availableOperations: []`, and the guard fails closed with a
typed `FutureServiceUnavailableError`.

## User interface

The Model Laboratory now:

- labels the combined inspector as P5.4–P5.7;
- shows a P5.7 numeric-difference section inside each P5.5 pair;
- shows no Δ values for the current heterogeneous cross-model pairs;
- states why no difference is displayed;
- shows a separate Future Service Contracts panel with time, cross-model layer
  synchronization and route/measurement all explicitly marked unavailable;
- keeps the planned phase and contract version visible in Arabic and English.

## Files

- `frontend/src/comparison/homogeneousDifference.ts`
- `frontend/src/comparison/futureServices.ts`
- `frontend/src/comparison/ModelLaboratory.tsx`
- `frontend/src/styles.css`
- `frontend/tests/p5-7-contracts.test.mjs`
- `frontend/tests/e2e/acceptance.spec.ts`
- `frontend/tsconfig.core.json`

No dependency, dataset, projection formula, historical claim, distance engine or
route engine is added.

## Scope boundary

P5.7 does **not** implement:

- selecting two new route endpoints;
- route drawing or ordered multi-stop state;
- road/flight routing;
- ruler, distance, perimeter or area calculations;
- astronomy/time calculations or a timeline;
- cross-model layer synchronization;
- automatic unit conversion;
- persistence of P5.7 state (P5.8).

The Phase 6 measurement boundary in
`NAVIGATION_MEASUREMENT_REQUIREMENTS.md` remains unchanged.

## Verification state

Automated PASS is not claimed until the exact uploaded implementation revision
finishes the Release Acceptance Gates. Owner manual P5.7 verification is
**NOT RUN** at this point.

## Owner manual checklist after CI

1. Select Doha or another place and open the Model Laboratory. Under the three
   P5.5 comparison cards, confirm each P5.7 numeric-difference box says that no
   numeric difference is shown because the quantities are not homogeneous.
2. Confirm there are no ΔX/ΔY/ΔZ numeric values for Gleason ↔ AE,
   Gleason ↔ WGS84 or AE ↔ WGS84.
3. Confirm the Future Service Contracts panel contains exactly three services:
   time/astronomy, cross-model layer synchronization and route/measurement.
4. Confirm all three are visibly **Unavailable**. Route/measurement must say it
   remains Phase 6; time must point to phases 9–10; shared layer synchronization
   must point to phase 16.
5. Confirm the layer message does not say that existing WGS84 local display
   layers disappeared; it distinguishes local layers from future shared layer
   synchronization.
6. Switch Arabic/English and phone-sized layout; no horizontal overflow and all
   unavailable boundaries remain understandable.

Acceptance criterion: numeric differences appear only for homogeneous quantities
that pass P5.5, incompatible pairs expose no numeric delta, and future services
cannot be mistaken for implemented functionality.

Sources: `ROADMAP_CURRENT.md`, `PHASE_5_PLAN.md`, accepted P5.5
comparability contract and `NAVIGATION_MEASUREMENT_REQUIREMENTS.md`.


## Automated verification — CI #383

Exact implementation/documentation head:
`6b21fbf78494335ca5cbec4c4c75a634b475cfac`.

[Release Acceptance Gates #383 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35464215834)

Observed on that exact revision:
- npm security gate: **0 vulnerabilities**;
- frontend core tests: **78 PASS**;
- PWA tests: **2 PASS**;
- Chromium acceptance scenarios: **15 PASS**;
- production TypeScript/Vite build: **PASS**;
- WGS84 browser/backend parity: **PASS**;
- Docker/PostGIS/Redis, locked production sources, online/offline search and
  Arabic city gates: **PASS**.

The 78 core tests include the P5.7 homogeneous-difference rules, cross-model
numeric blocking, explicit future-service unavailability, and the extra
fail-closed domain-mismatch guard.

P5.7 is **TECHNICALLY GREEN / awaiting owner manual verification**. It is not
closed yet. P5.8 and Phase 6 remain NOT STARTED.
