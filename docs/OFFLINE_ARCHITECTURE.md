# Offline Foundation — v0.1.0

## Boundary

Offline-capable deterministic/local features must not depend on FastAPI merely to execute. Phase 1 therefore establishes:

- Service Worker app shell.
- Cache versioning.
- IndexedDB key/value abstraction.
- Versioned `OfflinePackManifest` schema.
- Runtime online/offline status.
- Client capability detection.

## Pack schema v1

Each pack has a stable id, semantic version, kind, generation timestamp, source ids and a file list with SHA-256 and byte size.

Allowed pack kinds:

- `core-world`
- `region`
- `astronomy`
- `research`

The actual geographic/astronomical pack content starts in later phases.

## Correctness rule

A cached live response must never be relabeled as live. Future provider results will carry freshness/provenance flags such as `LIVE_DATA` and `STALE_CACHE`.


## Approved Phase 4 correction: standalone PWA

After one successful production install, the generated service worker precaches the compiled entry, all chunks/styles and bundled map assets. Close existing tabs to activate an updated worker; offline navigation uses the cached application shell. API requests are not cached as shell assets. Regional search data still requires an explicitly saved pack.

WGS84 geodesics fall back to pinned GeographicLib JS when offline or the server is unavailable; geodetic/ECEF conversion is available locally via proj4js. This works with Docker stopped, unlike a merely local server. Every result identifies its execution engine. Backend PROJ remains the numerical acceptance authority via `python scripts/check_reference_parity.py`. Local ECEF inverse rejects points within 1 m of the geocentre because geographic coordinates there are undefined; this limitation is explicit rather than silently normalized.

Cache installation/build checks alone do not prove browser behaviour. The M6 browser gate must test first install, offline reload and computation with network blocked and the server stopped. Physical Android/iOS checks remain separate from Chromium automation.
