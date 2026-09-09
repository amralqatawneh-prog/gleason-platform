# TEST REPORT — Phase 1 / v0.1.0

**Date:** 2026-09-09  
**Environment:** Python 3.13.5, Node 22.16.0, npm 10.9.2, Git 2.47.3  
**Automated verification:** 16/16 checks passed  
**Environment-dependent acceptance checks:** 2 not executable in this sandbox

## A. Backend unit/integration tests

Command:

```bash
cd backend
python -m pytest -q
```

Result:

```text
....... [100%]
7 passed
```

Covered:

1. CSV CORS origin parsing.
2. API prefix normalization.
3. Real SQLite database probe.
4. `/api/v1/health` and request-ID propagation.
5. `/api/v1/ready` database readiness.
6. `/api/v1/capabilities` does not claim Phase 2+ features.
7. CORS preflight for an allowed origin.

## B. Python compilation

```bash
python -m compileall -q app
```

**Result:** PASS.

## C. Live API smoke test

Uvicorn was started on `127.0.0.1:8010` and three real HTTP requests were made.

| Endpoint | HTTP | Result |
|---|---:|---|
| `/api/v1/health` | 200 | service/version correct |
| `/api/v1/ready` | 200 | SQLite reachable, dialect `sqlite` |
| `/api/v1/capabilities` | 200 | Phase 1 flags correct; future engines false |

Every response contained an `X-Request-ID`; HTTP middleware emitted structured JSON access logs.

## D. Frontend offline-core TypeScript tests

Command:

```bash
cd frontend
npm run test:core
```

This command needs no third-party React runtime; it compiles the pure TypeScript Phase 1 core with the available TypeScript compiler and executes Node tests.

Result:

```text
4 tests
4 pass
0 fail
```

Covered:

1. WebGL2 missing -> `fallback-2d`.
2. WebGL2 available -> `available`.
3. Valid Offline Pack manifest accepted.
4. Invalid pack kind/checksum rejected.

## E. TS/TSX parser validation

All 8 source `.ts/.tsx` files were parsed/transpiled through the TypeScript compiler API to detect syntax/JSX errors.

**Result:** PASS — 8 files parsed.

This is a syntax/transpilation check, not a substitute for the full Vite dependency-resolved production build.

## F. PWA tests

- `node --check public/sw.js`: PASS.
- Manifest JSON parse: PASS.
- `icon-192.png` exact dimensions: 192×192 — PASS.
- `icon-512.png` exact dimensions: 512×512 — PASS.
- Offline fallback and Cache Storage usage statically verified — PASS.

## G. Responsive / bilingual shell checks

Static acceptance checks verified:

- Runtime `document.documentElement.dir` synchronization for RTL/LTR.
- Phone breakpoint: 420 px.
- Mobile/tablet breakpoint: 760 px.
- Wide/tablet breakpoint: 1100 px.

**Result:** PASS.

Browser visual regression testing starts in the dedicated later UI/browser phases; Phase 1 only establishes the adaptive shell.

## H. Docker/Compose contract

`docker-compose.yml` parsed successfully as YAML and contains exactly the required Phase 1 service roles:

- `db`
- `redis`
- `backend`
- `frontend`

**Static result:** PASS.

**Runtime result:** NOT EXECUTED — Docker is not installed in the delivery sandbox.

## I. Gleason source integrity

`data/sources/gleason-book.yaml` was validated and the uploaded project PDF was independently hashed in the delivery environment.

```text
SHA-256:
03e429285376c7fcd21659116f43a8da7d6e363169e7c7841c9b31518effbe60
```

The catalog explicitly keeps `forward_inverse_locked: false`; no projection equations are claimed in Phase 1.

## J. Full frontend production build — acceptance caveat

Attempted dependency resolution in strict offline mode:

```bash
npm install --offline --ignore-scripts
```

Result:

```text
ENOTCACHED: @capacitor/android is not present in the sandbox npm cache
```

The sandbox has no external network access, therefore `npm install`, `npm run build`, and `npx cap sync` cannot be truthfully marked as passed here.

Required external acceptance commands:

```bash
cd frontend
npm install
npm run build
npm run preview
```

Then verify the rendered UI in Chrome, Edge, Firefox and Safari/mobile browser environments.

## K. Phase acceptance status

### Passed now

- 16/16 executable automated checks.
- Backend live boot/API smoke.
- Database real local probe.
- Offline-core tests.
- PWA syntax/manifest/icons.
- Source catalog integrity.

### Still required before Phase 2

1. Full npm dependency install + `npm run build` succeeds.
2. Docker runtime `docker compose up --build` succeeds and backend/frontend health is verified.

**Conclusion:** implementation scope is present, but Phase 1 acceptance remains conditional on the two environment-dependent runtime gates above. Do not begin Phase 2 until they pass.
