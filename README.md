# Gleason Comparison Platform — v0.1.0

Phase 1 operational foundation for the long-term geospatial/astronomical comparison platform.

## What works in v0.1.0

- FastAPI application with `/api/v1/health`, `/api/v1/ready`, `/api/v1/capabilities`.
- Structured JSON logging, request IDs, CORS and centralized API errors.
- Database configuration/lifecycle abstraction with SQLite development fallback and PostgreSQL-ready configuration.
- React + TypeScript + Vite application shell with Arabic/English, RTL/LTR, responsive desktop/tablet/mobile layouts.
- Installable PWA foundation: manifest, service worker, cache versioning and offline page.
- IndexedDB abstraction and versioned Offline Pack manifest types.
- Browser capability detection including WebGL2 and graceful 2D fallback messaging.
- Capacitor configuration shell for Android/iOS.
- Dockerfiles + Compose for frontend, backend, PostgreSQL/PostGIS and Redis.
- Backend tests, frontend offline-core tests, static validation and Phase 1 verification script.

No Gleason projection, 3D globe, live aviation, astronomy or scientific comparison is implemented in this phase.

## Local development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -e '.[dev]'
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

### Docker

```bash
cp .env.example .env
docker compose up --build
```

Frontend: `http://localhost:8080`  
Backend docs: `http://localhost:8000/docs`

## Phase 1 verification

From the repository root:

```bash
python scripts/verify_phase1.py
```

The script validates backend tests, Python compilation, configuration files, PWA assets, service-worker syntax and frontend offline-core TypeScript tests. The final release gates additionally require a successful production npm build and a real Docker runtime with PostgreSQL/PostGIS and Redis.

See `docs/PHASE_1_REPORT.md` and `docs/TEST_REPORT.md`.
