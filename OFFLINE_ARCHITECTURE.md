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
