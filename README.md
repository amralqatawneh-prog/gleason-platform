# Gleason Comparison Platform — v0.1.0

Phase 1 operational foundation for the long-term geospatial/astronomical comparison platform.

## Repository layout

```text
.
├── backend/                  # FastAPI application, services and Python tests
│   ├── app/
│   │   ├── api/
│   │   └── services/
│   └── tests/
├── frontend/                 # React + TypeScript + Vite + PWA/Capacitor shell
│   ├── public/
│   ├── src/
│   │   ├── offline/
│   │   ├── platform/
│   │   └── shared/
│   └── tests/
├── data/
│   └── sources/              # Source registry and future normalized datasets
├── database/
│   └── init/                 # PostgreSQL/PostGIS bootstrap SQL
├── docs/                     # Architecture, reports, security and verification records
├── .github/workflows/        # Continuous-integration acceptance gates
├── docker-compose.yml        # Local/CI multi-service runtime
├── PROJECT_ARCHITECTURE.md   # Accepted architecture baseline
├── CHANGELOG.md
└── VERSION
```

Application source files must not be placed directly in the repository root. CI enforces this rule so the repository remains organized as the project grows.

## What works in v0.1.0

- FastAPI application with `/api/v1/health`, `/api/v1/ready`, `/api/v1/capabilities`.
- Structured JSON logging, request IDs, CORS and centralized API errors.
- Database configuration/lifecycle abstraction with SQLite development fallback and PostgreSQL/PostGIS production configuration.
- React + TypeScript + Vite application shell with Arabic/English, RTL/LTR and responsive layouts.
- Installable PWA foundation: manifest, service worker, cache versioning and offline page.
- IndexedDB abstraction and versioned Offline Pack manifest types.
- Browser capability detection including WebGL2 and graceful 2D fallback messaging.
- Capacitor configuration shell for Android/iOS.
- Dockerfiles + Compose for frontend, backend, PostgreSQL/PostGIS and Redis.
- Backend tests, frontend offline-core tests and GitHub Actions release gates.

No Gleason projection, 3D globe, live aviation, astronomy or scientific comparison is implemented in this phase.

## Local development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -e '.[dev]'
pytest -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run test:core
npm run build
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

## Acceptance verification

Every push and pull request runs the Phase 1 acceptance workflow. It verifies the permanent repository structure, backend tests, frontend core tests, production npm build, PWA artifacts, Docker Compose runtime, PostgreSQL/PostGIS connectivity, Redis and frontend/backend HTTP smoke tests.

See `docs/PHASE_1_REPORT.md`, `docs/TEST_REPORT.md` and `docs/REPOSITORY_STRUCTURE.md`.
