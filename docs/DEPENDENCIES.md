# Dependency Register — v0.2.0

| Dependency | Version | License | Purpose |
|---|---:|---|---|
| OpenLayers (`ol`) | 10.10.0 | BSD-2-Clause | Interactive 2D projection maps |
| proj4 | 2.22.0 | MIT | Client AE projection transform |
| pyproj | 3.8.0 | MIT | Backend AE projection transform |
| world-atlas | 2.0.2 | ISC | Bundled world topology derived from Natural Earth |
| topojson-client | 3.1.0 | ISC | TopoJSON to GeoJSON conversion |
| @types/topojson-client | 3.1.5 | MIT | TypeScript declarations |

Natural Earth geometry is used for the Phase 2 offline baseline. Detailed geographic datasets remain Phase 3 work.


## Approved correction M6: reproducible installation

- Frontend: `cd frontend && npm ci`; complete transitive versions/integrities are in `package-lock.json`. GeographicLib geodesics is pinned to 2.2.0; Playwright test tooling to 1.63.0.
- Backend: install `uv==0.12.15`, then `cd backend && uv sync --locked --extra dev`. Runtime-only containers omit the dev extra. `uv.lock` records universal Python >=3.12 dependency resolution, platform markers and distribution hashes. CI/containers use Python 3.13; this local audit uses Python 3.12.
- Build backend requirements are pinned to setuptools 84.0.0 / wheel 0.48.0.
- Explicit updates: change requirements as needed, regenerate the lock with `uv lock` or `npm install`, review the diff and run all acceptance gates. Do not use unconstrained installation in Docker/CI.
- Commands: `uv run --locked --extra dev pytest` in backend; `npm run test:core && npm run build && npm run test:pwa` in frontend; `backend/.venv/bin/python scripts/check_reference_parity.py` at repository root.
- Chromium CI gate: `npx playwright install --with-deps chromium && npm run test:e2e` in frontend after installing backend dev dependencies. It uses disposable TEST-ONLY records and stops its own servers; it never deletes user Docker volumes.
- Lockfiles reproduce package installations, not immutable OS container images. Pinning base-image digests and measuring GPU performance remain future hardening tasks.

Sources: [uv locking/syncing](https://docs.astral.sh/uv/concepts/projects/sync/), [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci), [GeographicLib JS](https://github.com/geographiclib/geographiclib-js).
