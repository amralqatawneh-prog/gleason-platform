# P5.8 — Versioned Local State Persistence

Started: 2026-09-19 by the owner's explicit instruction: «أبدأ P5.8».

Base: `main` after PR #9 merge and documentation reconciliation.
P5.1–P5.7 remain closed. P5.8 is the only active slice. P5.9 and Phase 6 are
not started.

## Purpose

Persist and restore the Phase 5 **shared geographic selection state** locally and
offline with an explicit schema version, strict validation, and fail-closed place
identity handling.

This slice is deliberately narrower than later Phase 17 experiment persistence.
It does not persist routes, notebooks, astronomy state, cross-model layer state,
or saved experiments.

## State contract

Storage key:

`phase5-shared-state-v1`

Persisted schema:

`schemaVersion: 1`

Payload:

- the current canonical `GeographicSelection`, or
- `null` when no geographic selection exists.

The existing P5.1 selection contract remains authoritative:
- WGS84 latitude/longitude in degrees;
- optional ellipsoidal height in metres;
- missing height means unknown and is never replaced with zero;
- `place` and `free-point` remain distinct;
- pixels/projected coordinates never enter persistence.

## Restore rules

### Free point

A valid free point is restored exactly after strict coordinate/model validation.
Restoration does not increment the selection revision because hydration is not a
new user action.

### Place selection

A saved place identity is trusted only when the currently installed offline
search packs contain an unchanged canonical record matching:

- canonical place ID;
- category;
- source ID;
- source record ID;
- latitude/longitude;
- saved source version when the saved version is known.

When matched, the place is reconstructed from the **installed offline pack**
using its current local provenance and is marked as an offline canonical record.

### Saved place missing or changed

If the saved coordinate is valid but its place identity cannot be verified
against installed packs, P5.8 restores the coordinate only as a WGS84
`free-point` and explicitly reports `restored-point-only`.

It does **not** carry the unverifiable saved place ID/name/source forward.

### Invalid or unsupported state

- malformed payload → discarded;
- unsupported schema version → discarded;
- invalid latitude/longitude → discarded;
- non-finite or null ellipsoidal height → discarded;
- invalid place shape/provenance fields → discarded.

No partial malformed place identity is trusted.

## IndexedDB integration

P5.8 uses the existing Phase 1 `gleason-platform` IndexedDB database and
`key-value` object store. It does not add a database migration or new object
store.

The existing Phase 4 WGS84 layer-visibility key remains independent:
`phase4-wgs84-globe-layers-v1`.

The Phase 3 search-pack state also remains independent:
`phase3-search-packs-v1`.

## Application integration

On startup:

1. load persisted P5.8 state and installed search packs;
2. decode/validate the state;
3. verify saved place identity against installed packs;
4. hydrate the selection reducer with a non-user `restore` action;
5. expose the restore status in the UI;
6. only after hydration completes, enable writes so the initial empty React
   state cannot overwrite persisted data before it is read.

After any user selection change, the current valid canonical selection is saved
locally.

The app exposes `data-persistence-status` for browser acceptance evidence and a
bilingual status notice explaining restored/degraded/discarded state.

## Files

- `frontend/src/comparison/statePersistence.ts`
- `frontend/src/comparison/selectionState.ts`
- `frontend/src/App.tsx`
- `frontend/tests/state-persistence.test.mjs`
- `frontend/tests/selection-state.test.mjs`
- `frontend/tests/e2e/acceptance.spec.ts`
- `frontend/tsconfig.core.json`

No dependency, projection formula, source dataset, database schema, or accepted
application version is changed.

## Automated coverage

Core tests cover:

- schema version 1 round trip;
- invalid/unsupported state rejection;
- free-point restore without fabricated height;
- installed-pack place identity restore;
- place downgrade when pack identity is absent;
- rejection of changed record ID, coordinate or source version;
- reducer hydration without a synthetic user revision.

Browser coverage verifies:

- a selected place is written to IndexedDB;
- the installed local search pack restores that place while servers/network are
  unavailable;
- restored state does not increment the user-selection revision;
- malformed persisted state is discarded offline and does not recreate place
  provenance.

Automated PASS is not claimed until the exact uploaded revision completes the
Release Acceptance Gates.

## Manual owner checklist after CI

1. Select a city such as Doha and note that the persistence notice is present.
2. Reload the page while online; the same selection/marker should return.
3. After the city has been available in an installed local pack, disable network
   access (or use the existing offline workflow), reload, and confirm the place
   identity/provenance returns from the local pack.
4. Select a free point on any model, reload, and confirm the geographic point
   returns without acquiring a place name/ID.
5. Confirm missing ellipsoidal height remains missing; no UI should show a
   fabricated 0 m height because of persistence.
6. Arabic/English and phone-sized layout must keep the persistence status
   understandable.

## Status

**IN PROGRESS — implementation uploaded; automated verification pending.**

P5.9 remains NOT STARTED. Phase 6 remains NOT STARTED. Full Phase 5 acceptance
remains pending. Accepted application version remains 0.4.0. No tag or GitHub
Release is authorized by P5.8.
