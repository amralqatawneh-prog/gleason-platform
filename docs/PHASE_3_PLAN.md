# Phase 3 Delivery Plan — v0.3.0

## Scope
Phase 3 implements the geography-data/search foundation defined by the accepted architecture:

- PostGIS datasets and unified search.
- Offline search index and region-pack contracts.
- Base entity support for cities, countries, seas, oceans, rivers, mountains, and airports.

## Delivery increments

### Increment 3.1 — Unified geography contract
- Canonical `GeographicEntity` model shared by server and offline index.
- Stable entity types and provenance fields.
- PostgreSQL/PostGIS schema with spatial and text-search indexes.
- Unified `/api/v1/search` endpoint.
- No fabricated production dataset; empty databases are valid until an importer loads licensed data.

### Increment 3.2 — Import pipeline
- Versioned source adapters.
- Idempotent imports/upserts.
- Source/license/version metadata required for every imported entity.
- Import validation and counts by entity type.

### Increment 3.3 — Offline search packs
- Deterministic region-pack manifest.
- Compact JSON search index generated from the canonical dataset.
- Client-side prefix/token search with Arabic/English names and aliases.
- Pack version/checksum validation.

### Increment 3.4 — Search UI
- Unified search box for online and offline modes.
- Filters by entity type and region.
- Results expose source/provenance and canonical coordinates.

## Acceptance criteria
1. PostGIS schema creates successfully in Docker.
2. Search API returns the same canonical shape for every entity type.
3. Arabic/English names and aliases are searchable.
4. Geometry is stored as SRID 4326 and spatially indexed.
5. Every production record carries source/version/license metadata.
6. Offline index uses the same IDs, entity types, coordinates, and provenance contract as the API.
7. Region packs are versioned and checksummed.
8. No sample/test fixtures are presented as production geographic truth.
9. Existing Phase 2 projection/source tests remain green.
10. `npm build`, Docker runtime, PostgreSQL/PostGIS and Redis gates remain green.

## Non-goals
- WGS84 3D globe.
- Cross-model synchronized navigation.
- Astronomy/Sun/Moon/planet calculations.
- Advanced navigation, flight, cable, river, or elevation laboratories.

Those remain later-phase work.
