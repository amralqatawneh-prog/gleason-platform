# Offline Architecture — current through P5.7

_Last reconciled: 2026-09-19. Accepted application version: v0.4.0._

## Core rule

Deterministic/local capabilities must not depend on FastAPI merely to execute
when the required assets/data packs are already installed. Offline execution
must preserve provenance and must never relabel cached/stale/network-derived data
as live/current.

## Existing offline foundation

The repository currently includes:

- Service Worker application shell and cache versioning.
- IndexedDB key/value storage abstraction.
- Versioned `OfflinePackManifest` schema.
- Runtime online/offline status.
- Capability detection and WGS84 2D fallback.
- Core-world and regional offline search packs.
- Locally bundled/installed map data required by supported views.
- Local WGS84 geodesic fallback via pinned GeographicLib JS.
- Local geodetic/ECEF conversion via proj4js within documented limits.
- Existing WGS84 layer visibility persistence from Phase 4.

## Offline pack schema v1

Each pack has a stable ID, semantic version, kind, generation timestamp, source
IDs and a file list with SHA-256 and byte size.

Allowed kinds remain:

- `core-world`
- `region`
- `astronomy`
- `research`

A kind being allowed by the manifest schema does **not** mean a corresponding
later engine is implemented. In particular, P5.7 marks the future
time/astronomy service unavailable.

## Standalone PWA behavior

After a successful production install, the generated service worker precaches
the compiled entry, chunks/styles and bundled assets required by the installed
shell. Close existing tabs/clients to allow an updated worker to activate; a
hard refresh alone does not guarantee activation.

API responses are not treated as shell assets. Regional search data still
requires an explicitly saved/installed pack.

WGS84 geodesics can fall back to the pinned client engine when offline or the
server is unavailable. Backend PROJ remains the numerical acceptance authority
through `scripts/check_reference_parity.py`.

Local ECEF inverse rejects points within 1 m of the geocentre because geographic
coordinates there are undefined. The limitation is explicit rather than silently
normalized.

## Phase 5 status

P5.1–P5.7 are closed. Their offline-relevant behavior includes:

- canonical shared geographic selection while the app is running;
- offline-capable model calculations already supported by each adapter;
- search/selection/marker behavior against installed search packs;
- independent navigation without requiring network data;
- comparability/difference contracts that do not invent unavailable data;
- future time/shared-layer/route services explicitly unavailable.

### P5.8 boundary — not started

P5.8 **Versioned Local State Persistence** is the next slice and is NOT STARTED.

It is distinct from the existing Phase 4 layer-visibility persistence. P5.8 must
define and test the persisted **Phase 5 shared state contract**, including:

- schema/version identifier;
- safe decode/migration/rejection of old or malformed state;
- offline restoration from installed/local data only;
- no fabricated place identity or source metadata;
- no conversion of missing ellipsoidal height to zero;
- no restoration of unavailable future-service operations as if implemented.

This document does not claim P5.8 functionality before that slice is authorized,
implemented and accepted.

## Browser evidence

Release Acceptance Gates #397 on
`e710075531dbdbc2fdd2ed62dde07f22786e320f` passed service-worker syntax,
production PWA/offline-pack verification, browser offline gates and the broader
release suite. Historical evidence remains in the relevant phase reports.

Build/cache checks alone never substitute for behavior tests. Physical
Android/iOS validation remains separate from Chromium automation.

## Data integrity

Offline packs and cached data must keep:

- source ID/version;
- checksum/version metadata;
- place identity where legitimately present;
- live/stale/offline classification where relevant.

Do not invent missing records or silently replace a requested source with a
different dataset.
