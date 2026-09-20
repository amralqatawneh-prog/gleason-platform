# Dependency Register — current through accepted Phase 5 / app v0.5.0

_Last reconciled: 2026-09-20 after Phase 5 owner acceptance._

This register documents direct project dependencies. Exact transitive
resolutions/integrities remain authoritative in `frontend/package-lock.json` and
`backend/uv.lock`. Updating this document does not change dependency versions.

## Frontend runtime dependencies

| Dependency | Version | Purpose |
|---|---:|---|
| React | 19.0.0 | Application UI |
| React DOM | 19.0.0 | Browser rendering |
| OpenLayers (`ol`) | 10.10.0 | Gleason/AE interactive 2D maps and navigation |
| proj4 | 2.22.0 | Client projection / geodetic transforms used by existing reference code |
| geographiclib-geodesic | 2.2.0 | Independent offline WGS84 geodesic calculations |
| topojson-client | 3.1.0 | TopoJSON → GeoJSON conversion |
| world-atlas | 2.0.2 | Bundled low-resolution world topology |
| @capacitor/core | 7.6.9 | Mobile shell runtime |

## Frontend development / build dependencies

| Dependency | Version | Purpose |
|---|---:|---|
| TypeScript | 5.8.3 | Type checking / compilation |
| Vite | 6.4.3 | Development and production frontend build |
| @vitejs/plugin-react | 4.4.0 | React/Vite integration |
| @playwright/test | 1.63.0 | Chromium acceptance/browser regression gates |
| @capacitor/cli | 7.6.9 | Capacitor tooling |
| @capacitor/android | 7.6.9 | Android project integration |
| @capacitor/ios | 7.6.9 | iOS project integration |
| @types/react | 19.0.0 | React TypeScript declarations |
| @types/react-dom | 19.0.0 | React DOM TypeScript declarations |
| @types/topojson-client | 3.1.5 | TopoJSON TypeScript declarations |

## Backend runtime dependencies

Backend project metadata currently requires Python **>=3.12**.

| Dependency | Constraint / pin | Purpose |
|---|---:|---|
| FastAPI | >=0.115,<1.0 | HTTP API |
| uvicorn[standard] | >=0.34,<1.0 | ASGI runtime |
| Pydantic | >=2.10,<3.0 | API/domain validation |
| pydantic-settings | >=2.7,<3.0 | Environment/configuration parsing |
| SQLAlchemy | >=2.0,<3.0 | Database access |
| psycopg[binary] | >=3.2,<4.0 | PostgreSQL/PostGIS driver |
| pyproj | **3.8.0** | Backend projection/WGS84 reference calculations |

Backend development dependencies:
- pytest >=8.3,<10.0
- httpx >=0.28,<1.0
- ruff >=0.9,<1.0

Build backend requirements are pinned to:
- setuptools 84.0.0
- wheel 0.48.0

The repository uses **uv 0.12.15** for the locked backend workflow.

## Reproducible installation

Frontend:

```bash
cd frontend
npm ci
npm audit --audit-level=high
npm run test:core
npm run test:pwa
npm run build
```

Backend:

```bash
pip install uv==0.12.15
cd backend
uv sync --locked --extra dev
uv run --locked --extra dev pytest -q
```

Reference parity from repository root:

```bash
backend/.venv/bin/python scripts/check_reference_parity.py
```

Browser acceptance:

```bash
cd frontend
npx playwright install --with-deps chromium
npm run test:e2e
```

## Current dependency security gate

The final accepted PR #13 head
`9d6dbbc3cbf2756d59cc0d1bd9d3fbe1f3483e8c` passed Release Acceptance Gates
**#514 — SUCCESS**, and the resulting `main` merge commit
`913ec67c195ac5971e0f63d9acfe94dba8de60bf` passed Release Acceptance Gates
**#515 — SUCCESS**.

The post-merge gate includes:

- `npm audit --audit-level=high`: **0 vulnerabilities**
- frontend production build: PASS
- frontend core/PWA/Chromium regression gates: PASS
- backend locked install/tests: PASS

This is evidence for the accepted post-merge v0.5.0 baseline. Any later
dependency change requires fresh evidence; do not carry this result forward
automatically.

## Data/source dependencies are separate from package dependencies

Locked production geographic sources are defined in:

- `data/sources/phase3-source-lock.json`
- `data/sources/phase3-place-sources.yaml`

The historical primary source record is:

- `data/sources/gleason-book.yaml`

Do not change source revisions/checksums merely to refresh this dependency
document.

## Update policy

When a direct dependency is intentionally changed:

1. update the relevant project manifest;
2. regenerate/review the matching lockfile;
3. update this register;
4. run security, core, build, parity, PWA, browser and Docker/source gates;
5. record the exact tested revision and limitations.

Lockfiles reproduce package resolution, not immutable operating-system images.
Pinning base-image digests and broader supply-chain hardening remain separate
future work.
