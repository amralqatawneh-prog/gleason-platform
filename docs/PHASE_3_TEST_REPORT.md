# Phase 3 Test Report — v0.3.0 candidate

## Automated verification summary

Latest validated Phase 3 release-gate execution before this documentation-only commit:

- repository structure: PASS
- source policy/version guard: PASS
- Python backend tests: PASS
- TypeScript/frontend core tests: PASS
- production frontend build: PASS
- PWA/offline artifacts: PASS
- Docker Compose validation: PASS
- Docker stack build/start: PASS
- PostgreSQL readiness: PASS
- Phase 2 projection API regression: PASS
- PostGIS extension: PASS
- Phase 3 geographic schema: PASS
- English unified search: PASS
- Arabic unified search: PASS
- importer runtime/upsert path: PASS
- Region Pack API/export contract: PASS
- Redis: PASS
- frontend HTTP runtime: PASS

## Phase 3-specific tested behavior

### Canonical geography
- Entity type vocabulary covers country, city, sea, ocean, river, mountain, airport.
- Coordinates are constrained to valid latitude/longitude ranges at the API/domain layer.
- Production import records require source ID, source version and source license.

### Unified search
- Exact/prefix/fuzzy text paths are exercised through PostgreSQL `pg_trgm`.
- English names, Arabic names and aliases are included in the search predicate.
- Type filtering and provenance are verified in Docker runtime.

### Import pipeline
- Validation tests reject missing provenance and malformed geometry objects.
- Docker runtime test imports a fixture through `import_geographic_records` into PostGIS.
- Upsert is keyed by stable canonical entity ID.

### Offline/Region Packs
- Offline search normalization and ranking are covered by Node tests.
- SHA-256 checksum generation is deterministic for the canonical entity payload.
- Invalid Region Pack checksum is rejected.
- Docker runtime exports a QA region pack and verifies its manifest and imported entity.

## Fixture policy
All CI/test geographic records are explicitly marked test-only. They must never be used as production world data.

## Regression policy
Phase 2 Gleason Historical and AE projection endpoints remain part of every release gate. Phase 3 cannot pass by breaking Phase 2.

## Manual acceptance still required
The owner should verify:

1. unified search UI renders on desktop and mobile;
2. Arabic/RTL search input and results are usable;
3. online PostGIS results appear after traceable data is imported;
4. offline fallback does not crash when no region pack is installed;
5. Phase 2 maps/source viewer still operate normally.
