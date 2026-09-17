# Phase 3 Delivery Plan — v0.3.0

## Scope from accepted architecture

Phase 3 is limited to:

1. PostGIS datasets + unified search.
2. Offline search index / region packs.
3. Base data for countries, cities, seas, oceans, rivers, mountains, and airports.

It does **not** include the Phase 4 WGS84 3D globe or later astronomy/comparison laboratories.

## Delivery slices

### P3.1 — Spatial catalog foundation
- Canonical `places` schema in PostgreSQL/PostGIS.
- Stable place IDs, category taxonomy, multilingual names/aliases, source provenance, quality fields, point geometry and optional region-pack membership.
- Full-text/trigram indexes plus spatial indexes.
- SQLite-compatible in-memory search path for development/tests without pretending SQLite is PostGIS.

### P3.2 — Unified Search API
- One query surface for all Phase 3 place categories.
- Filters: category, country, region pack, result limit.
- Deterministic ranking with exact/prefix/name/alias relevance.
- Optional near-point ordering when PostgreSQL/PostGIS is active.
- Every result exposes source/provenance metadata.

### P3.3 — Source ingestion
- Natural Earth importer for countries, populated places, seas/oceans, rivers and physical/geographic features.
- OurAirports importer for airports.
- Source versions/checksums stored with ingestion records.
- Import scripts fail on malformed input and never invent missing coordinates.

### P3.4 — Offline search + region packs
- Versioned JSON search index format.
- Core-world pack plus installable region-pack contract.
- Browser IndexedDB storage using existing offline abstraction.
- Same place IDs/category taxonomy online and offline.

### P3.5 — UI
- Unified search box in the Phase 3 workspace.
- Category/source badges.
- Selecting a result exposes canonical latitude/longitude and source metadata.
- Arabic/English/RTL/LTR retained.

## Data sources and licensing policy

- **Natural Earth**: public-domain map/vector data; used for the geographic base catalog.
- **OurAirports**: airport datasets released to the Public Domain; used for airport base data.
- Test fixtures are explicitly test-only and are never represented as production source data.

## Acceptance criteria

Phase 3 may be proposed for acceptance only when:

1. Database schema initializes under PostgreSQL/PostGIS.
2. Unified search passes backend tests for every required category.
3. Source provenance is present in every production place row/result.
4. Importers reject invalid coordinates and unsupported categories.
5. Offline index validates, searches without a network connection, and preserves canonical IDs.
6. Region-pack install/remove behavior is tested.
7. Production frontend builds.
8. Docker runtime passes with PostgreSQL/PostGIS and Redis.
9. Search API passes Docker smoke tests.
10. Owner manual checks confirm search usability on desktop/mobile and offline behavior.

## Status

**IN PROGRESS — Phase 3 started.**

No Phase 4 work is authorized by this document.
