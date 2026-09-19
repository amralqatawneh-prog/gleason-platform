# Gleason Comparison Platform — v0.4.0

Phase 4 is accepted by the owner. The platform includes independent Gleason/AE projection foundations, a PostGIS-backed catalog and offline search, plus the WGS84 reference globe, geodesic/ECEF calculations and offline operation. Application version 0.4.0 does not imply a published GitHub Release.

## Current phase status
- Phase 0 — ACCEPTED ✅
- Phase 1 — ACCEPTED ✅
- Phase 2 — ACCEPTED ✅
- Phase 3 — ACCEPTED ✅
- Phase 4 — ACCEPTED BY OWNER on 2026-09-18; all manual checks reported PASS; automated browser/Docker/source evidence recorded.
- Phase 5 — IN PROGRESS, explicitly started by owner on 2026-09-19. Development branch: `feat/phase5-shared-state` (uploaded, draft PR #9). P5.1 and Arabic city correction are closed; P5.2 closed after CI #198 and owner testing; P5.3 closed after CI #204 and owner testing; P5.4 Basic Model Laboratory closed after CI #236 and owner-reported functional/clarity PASS. P5.5 Comparability Contract is CLOSED after CI #266/#271 and owner-reported manual PASS. P5.6 Optional Geographic Focus / Navigation is CLOSED after CI #329/#340 and owner-reported manual PASS. P5.7 is next but NOT STARTED. Phase 5 as a whole is not accepted.

Latest closed slice: [P5.6 Optional Geographic Focus / Navigation](docs/PHASE_5_P5_6_REPORT.md). Next ordered slice is P5.7 Homogeneous Differences and future time/layer/route contracts, not started. See the [Phase 5 plan](docs/PHASE_5_PLAN.md). Package version 0.4.0 is the last accepted version; Phase 5 changes are unreleased.

Current handoff: [docs/PROJECT_HANDOFF_CURRENT.md](docs/PROJECT_HANDOFF_CURRENT.md).
Owner acceptance: [docs/PHASE_4_ACCEPTANCE.md](docs/PHASE_4_ACCEPTANCE.md).
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

The maps now share geographic selection and markers; their cameras and projection units remain independent. The historical provider does not claim that Gleason printed the analytic equation used by the software. `DOCUMENTED`, `DERIVED`, `DISPLAY_CONVENTION`, and `REFERENCE` remain separate.

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
