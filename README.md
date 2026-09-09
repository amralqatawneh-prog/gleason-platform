# Gleason Comparison Platform — v0.2.0

Phase 2 adds source-grounded historical and reference projection engines plus an offline interactive 2D world-map baseline.

## Layout
`backend/` FastAPI providers/tests · `frontend/` React/OpenLayers/PWA · `data/sources/` source registry · `database/` PostGIS bootstrap · `docs/` reports/references.

## v0.2.0
- Gleason Historical `GH-0.2.0` with explicit provenance.
- Independent north-polar AE `AE-0.2.0`.
- Forward/inverse APIs.
- Interactive OpenLayers maps with click-to-coordinate inverse transform.
- Bundled Natural Earth 110m baseline through world-atlas; no live tile API required for the core map.
- Historical Source Viewer and affine georeferencing engine.
- Arabic/English responsive PWA foundation.

The maps are intentionally not synchronized; cross-model synchronization is Phase 5. The historical provider does not claim that Gleason printed the analytic equation used by the software. `DOCUMENTED`, `DERIVED`, `DISPLAY_CONVENTION`, and `REFERENCE` remain separate.

## Historical scan
The georeferencing engine exists, but no verified distributable standalone historical map scan is embedded. No control points are invented.

## Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
pytest -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend
```bash
cd frontend
npm install
npm run test:core
npm run build
npm run dev
```

## Docker
```bash
cp .env.example .env
docker compose up --build
```

See `docs/PHASE_2_REPORT.md`, `docs/MATHEMATICAL_REFERENCES.md`, and `docs/DEPENDENCIES.md`.
