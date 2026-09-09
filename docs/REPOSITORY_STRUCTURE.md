# Repository Structure Policy

This document defines the permanent repository layout for the Gleason Comparison Platform.

## Principles

1. Keep runtime code separated by responsibility.
2. Keep the repository root limited to project-level configuration and high-level documentation.
3. Keep historical delivery reports and verification artifacts under `docs/`.
4. Keep source registries and future datasets under `data/`.
5. Keep database bootstrap/migrations under `database/`.
6. Do not duplicate application files at the repository root.
7. CI must fail if flattened backend/frontend files reappear at the root.

## Canonical layout

```text
backend/
  app/
    api/
    services/
  tests/
  Dockerfile
  pyproject.toml

frontend/
  public/
    icons/
  src/
    offline/
    platform/
    shared/
  tests/
  Dockerfile
  package.json
  vite.config.ts
  tsconfig*.json

data/
  sources/

database/
  init/

docs/

.github/
  workflows/
```

## Root allowlist

The repository root is reserved for project-level files such as:

- `.env.example`
- `.gitignore`
- `README.md`
- `PROJECT_ARCHITECTURE.md`
- `CHANGELOG.md`
- `VERSION`
- `docker-compose.yml`

## Future growth

As later phases are implemented, new code should be added inside the existing domain folders instead of creating unrelated root-level files. Backend domains should live under `backend/app/`; frontend features should live under `frontend/src/`; data ingestion and generated assets should remain under `data/`; database migrations/bootstrap belong under `database/`; operational and technical reports belong under `docs/`.

Changes to this structure should be deliberate, documented, and validated in CI.
