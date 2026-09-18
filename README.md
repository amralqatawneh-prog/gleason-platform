# Gleason Comparison Platform — v0.3.0

Phase 3 is accepted. The platform now includes the accepted Phase 2 projection foundation plus a PostGIS-backed spatial catalog, unified English/Arabic place search, and deterministic offline-search packs.

## Current phase status
- Phase 0 — ACCEPTED ✅
- Phase 1 — ACCEPTED ✅
- Phase 2 — ACCEPTED ✅
- Phase 3 — ACCEPTED ✅
- Phase 4 — implemented with approved local corrections; new remote/manual acceptance gates pending.
- Phase 5 — NOT STARTED.

Current handoff: [docs/PROJECT_HANDOFF_CURRENT.md](docs/PROJECT_HANDOFF_CURRENT.md).
Approved roadmap: [docs/ROADMAP_CURRENT.md](docs/ROADMAP_CURRENT.md).
Correction evidence: [docs/PHASE_4_CORRECTIONS_TEST_REPORT.md](docs/PHASE_4_CORRECTIONS_TEST_REPORT.md).

## Layout
`backend/` FastAPI providers/tests · `frontend/` React/OpenLayers/PWA · `data/sources/` source registry/locks · `database/` PostGIS bootstrap · `docs/` reports/references.

## v0.3.0
- PostGIS/pg_trgm place catalog for countries, cities, seas, oceans, rivers, mountains, and airports.
- Locked Natural Earth and OurAirports production imports with SHA-256 verification.
- Explicit coordinate provenance classifications; no invented production centroids.
- Unified English/Arabic search API and frontend.
- Deterministic core-world and country offline-search packs.
- Direct offline-search regression tests.
- Enforced `npm audit --audit-level=high` CI gate.
- Phase 2 projection regressions retained in release gates.

## Phase 2 projection foundation retained
- Gleason Historical `GH-0.2.0` with explicit provenance.
- Independent north-polar AE `AE-0.2.0`.
- Forward/inverse APIs.
- Interactive OpenLayers maps with click-to-coordinate inverse transform.
- Historical Source Viewer and affine georeferencing engine.
- Arabic/English responsive PWA foundation.

The maps remain intentionally unsynchronized; cross-model synchronization is Phase 5. The historical provider does not claim that Gleason printed the analytic equation used by the software. `DOCUMENTED`, `DERIVED`, `DISPLAY_CONVENTION`, and `REFERENCE` remain separate.

## Historical scan
The georeferencing engine exists, but no verified distributable standalone historical map scan is embedded. No control points are invented.

## Backend
```bash
cd backend
pip install uv==0.12.15
uv sync --locked --extra dev
uv run --locked --extra dev pytest -q
uv run --locked uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend
```bash
cd frontend
npm ci
npm audit --audit-level=high
npm run test:core
npm run build
npm run dev
```

## Docker
```bash
cp .env.example .env
docker compose up --build
```

## Phase 3 production data
The locked source files are fetched explicitly; a plain Docker startup does not automatically import the full production datasets.

```bash
python scripts/fetch_phase3_sources.py --output-dir .phase3-data
```

On Windows, if `python` is an older interpreter but the Python launcher points to a modern one, use:

```bash
py -3 scripts/fetch_phase3_sources.py --output-dir .phase3-data
```

See `docs/PHASE_3_REPORT.md` for the accepted Phase 3 implementation, validation evidence, manual acceptance record, and local developer notes. See also `docs/PHASE_2_REPORT.md`, `docs/MATHEMATICAL_REFERENCES.md`, and `docs/DEPENDENCIES.md`.
