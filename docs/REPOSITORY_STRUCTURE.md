# Repository Structure Policy

_Last reconciled: 2026-09-19 after P5.7 closure._

This document defines the permanent layout policy for the Gleason Comparison
Platform. The release-gates workflow validates that the normalized structure
remains intact.

## Current tracked-file snapshot

At the start of the GitHub documentation reconciliation, branch
`feat/phase5-shared-state` contained **186 tracked blob files**:

| Area | Files |
|---|---:|
| repository root | 7 |
| `.github/` | 1 |
| `backend/` | 46 |
| `data/` | 3 |
| `database/` | 2 |
| `docs/` | 36 |
| `frontend/` | 82 |
| `scripts/` | 9 |

These counts are an audit snapshot, not a structural limit.

## Principles

1. Keep runtime code separated by responsibility.
2. Keep repository root limited to project-level configuration/high-level docs.
3. Keep historical delivery reports and verification artifacts under `docs/`.
4. Keep source registries and locked source metadata under `data/`.
5. Keep database bootstrap/migrations under `database/`.
6. Keep operational/import/parity helpers under `scripts/`.
7. Do not duplicate backend/frontend application files at repository root.
8. CI must fail if forbidden flattened application files reappear at root.
9. “Current” documents must be distinguishable from historical evidence.

## Canonical layout

```text
backend/
  app/
    api/
    models/
    services/
  tests/
  Dockerfile
  pyproject.toml
  uv.lock

frontend/
  public/
    icons/
  src/
    comparison/
    map2d/
    offline/
    platform/
    reference/
    search/
    shared/
  tests/
    e2e/
    pwa/
  Dockerfile
  package.json
  package-lock.json
  vite.config.ts
  tsconfig*.json

data/
  sources/
    gleason-book.yaml
    phase3-place-sources.yaml
    phase3-source-lock.json

database/
  init/

scripts/

docs/
  PROJECT_HANDOFF_CURRENT.md
  ROADMAP_CURRENT.md
  PHASE_5_PLAN.md
  PHASE_5_P5_*_REPORT.md
  historical phase reports / verification artifacts

.github/
  workflows/
    release-gates.yml
```

## Root allowlist

Repository root is reserved for project-level files such as:

- `.env.example`
- `.gitignore`
- `README.md`
- `PROJECT_ARCHITECTURE.md`
- `CHANGELOG.md`
- `VERSION`
- `docker-compose.yml`

## Current vs historical documentation

Current execution status should be read from:

- `README.md`
- `docs/PROJECT_HANDOFF_CURRENT.md`
- `docs/ROADMAP_CURRENT.md`
- `docs/PHASE_5_PLAN.md`

Files such as Phase 1–4 reports, P5.1–P5.7 slice reports, old verification JSON,
and older acceptance records are chronological evidence. They should not be
rewritten merely because a later slice has advanced.

The inventory/audit for this reconciliation is
`docs/GITHUB_SYNC_AUDIT_2026-09-19.md`.

## Growth policy

New code belongs inside the existing domain folders unless a documented
architecture decision requires another top-level domain.

- backend domains → `backend/app/`
- frontend features → `frontend/src/`
- locked source metadata → `data/sources/`
- data/import tooling → `scripts/`
- database bootstrap/migrations → `database/`
- operational/technical reports → `docs/`

Structure changes must be deliberate, documented and validated by CI.
