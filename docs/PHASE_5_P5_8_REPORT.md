# P5.8 — Versioned Local State Persistence

Started: 2026-09-19 by explicit owner instruction «أبدأ P5.8».

Base: `main` at
`4ea148a24eb28433dade35f79e46886afe4ce867`, after PR #9 merge and
Release Acceptance Gates #427 SUCCESS.

Working branch: `feat/phase5-p5.8-state-persistence`.

P5.1–P5.7 remain closed. P5.8 is the only active slice. P5.9 and Phase 6 are
not started.

## Purpose

P5.8 persists and restores the **canonical Phase 5 shared geographic selection**
using a versioned local contract.

The persisted state is intentionally narrower than the entire UI. P5.8 does not
persist camera zoom/rotation, route state, future services, model-laboratory
results or Phase 6 measurement state.

## Contract

Storage key:

`phase5-shared-selection-v1`

Contract identifier:

`phase5-shared-selection`

Schema version:

`1`

The envelope contains:

- contract identifier;
- schema version;
- saved timestamp;
- either a free-point selection, a place locator, or null.

The React `revision` counter is **not persisted**. It remains a session-local
user-action sequence. Restoring state does not pretend that a user clicked a map
and therefore does not increment revision.

## Free-point persistence

A free point stores only contract fields:

- model: Gleason / AE / WGS84;
- latitude;
- longitude;
- optional WGS84 ellipsoidal height.

If ellipsoidal height was absent, it stays absent. P5.8 never converts unknown
height to 0 m, sea level or orthometric height.

Invalid coordinates are rejected during decode/restore.

## Place persistence

A named place does **not** persist the full mutable display/provenance object.

It stores only an identity locator:

- canonical place ID;
- source ID;
- source-record ID;
- source version, when known.

On restore, P5.8 searches the already installed/sanitized Phase 3 offline search
packs. The place is restored only when a local record matches the persisted
identity.

The restored name, Arabic name, coordinates, category, country, license, source
URL, classification and offline flag come from the currently installed local
record, not from stale persisted display metadata.

If the matching record is absent, the result is
`missing-local-place` and no place identity or point is fabricated.

P5.8 does not download a pack merely to satisfy restore; this keeps offline
restore deterministic and source-grounded.

## Invalid and old state handling

Decode is fail-closed.

- unknown schema version → `unsupported-version`;
- malformed contract → `invalid`;
- invalid coordinate → `invalid`;
- missing installed place record → `missing-local-place`;
- storage read failure → UI status `error`.

Unsupported/malformed state is not silently migrated by guessing.

The v1 decoder accepts only the defined root/selection keys. Extra state such as
route/time/future-service operations is rejected rather than restored as if those
later services existed.

## App lifecycle

At startup:

1. read the P5.8 key from IndexedDB;
2. decode the versioned envelope;
3. for place selections, resolve identity only from installed local packs;
4. restore only when safe;
5. restoration keeps selection revision unchanged.

After a **new user selection**:

1. revision increments through the existing reducer;
2. the canonical selection is saved as P5.8 v1;
3. navigation-only camera actions do not trigger a persistence write.

If a user makes a selection while an asynchronous restore is still resolving,
the new session selection wins and the stale restore is skipped.

## User-visible status

The geographic inspector exposes a small P5.8 local-state notice with:

- restore status;
- save status;
- explicit statement that only shared selection is persisted.

The app shell also exposes deterministic
`data-persistence-restore` / `data-persistence-save` attributes for browser
acceptance tests.

## Implementation files

- `frontend/src/comparison/persistedSelection.ts`
- `frontend/src/offline/phase5StateStore.ts`
- `frontend/src/comparison/selectionState.ts`
- `frontend/src/App.tsx`
- `frontend/tests/p5-8-persistence.test.mjs`
- `frontend/tests/e2e/acceptance.spec.ts`
- `frontend/tsconfig.core.json`

No new dependency, dataset, projection formula, database schema or source
revision is introduced.

## Scope boundary

P5.8 does **not** persist:

- Gleason/AE/WGS84 camera state;
- P5.7 future time/astronomy operations;
- cross-model layer synchronization state;
- route endpoints or route drawing;
- distance/ruler/perimeter/area state;
- Model Laboratory derived output;
- geodesic A/B calculation workflow.

Existing Phase 4 globe-layer visibility persistence remains separate and
unchanged.

Long-term saved experiments/routes remain later roadmap work; P5.8 is the
versioned local persistence of the canonical Phase 5 selection.

## Automated tests added

Core coverage verifies:

- free point round-trip without fabricated height;
- explicit ellipsoidal height preserved exactly;
- place persistence stores locator only, not stale name/source-label metadata;
- place restore rebuilds identity from a local offline record;
- identity mismatch fails closed;
- unsupported schema version is ignored safely;
- malformed coordinates are rejected;
- extra future-service state is rejected;
- restore does not increment user-action revision.

Browser acceptance verifies:

- first run reports empty persisted state;
- a user selection is saved;
- a named place reloads from an installed local pack and is shown as an offline
  canonical record;
- restored state starts with revision 0;
- unsupported versions produce no selection;
- a valid locator with no installed record produces no selection;
- Arabic/English notice and mobile width remain usable.

## Verification state

Automated PASS is not claimed until the exact uploaded P5.8 revision completes
the release acceptance workflow.

Owner manual P5.8 verification is **NOT RUN**.

## Manual checklist after CI

1. Update to the P5.8 branch and open the app. The inspector should show
   “No saved local state / لا توجد حالة محفوظة” on a clean browser profile.
2. Search for a city and locate it. Wait until the P5.8 notice says the latest
   selection was saved locally.
3. Reload the page. The city should restore automatically with selection
   revision 0 and the provenance should identify the restored record as an
   offline canonical record.
4. Pick a free point on Gleason, AE or WGS84, reload, and verify the point
   restores without old place provenance.
5. If the free point has no explicit ellipsoidal height, WGS84 ECEF must remain
   unavailable; reload must not create a 0 m height.
6. Navigation-only zoom/rotate/focus actions must not create a new selection
   revision or change the saved place/free-point identity.
7. Switch Arabic/English and phone-sized layout; the local-state notice must
   remain readable without horizontal overflow.
8. Optional developer check: an unsupported/malformed saved schema must be
   ignored with an explicit status rather than crashing or fabricating a place.

Acceptance criterion: the canonical selection survives reload safely when its
required local evidence exists, invalid/old state fails closed, and no identity,
height or unavailable future operation is invented.
