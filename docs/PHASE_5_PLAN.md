# Phase 5 — shared selection and model comparison

Started: 2026-09-19, by explicit owner instruction: **«ابدأ المرحله الخامسة»**.
This supersedes the previous Phase 5 hold. Phase 4 stays accepted at v0.4.0.
Base commit: `1e46b8c38a5834f56d3ed70d8a396e8902e3efe3`.
Working branch: `feat/phase5-shared-state`, uploaded with owner permission; draft PR #9. No merge/tag/release authorization is implied.

## Execution and acceptance

Implement one slice at a time, record changed files/functions, actual test evidence,
manual checklist, limitations and acceptance criteria before moving on. Phase 5
acceptance requires its own owner decision; do not infer acceptance from the start
instruction. Never carry historical CI/manual PASS over to a new revision.

Canonical scope: `ROADMAP_CURRENT.md`. Phase 6 measurement/navigation labs and
later astronomy/time services are excluded. Backend reference calculations remain
authoritative. Shared state uses geographic degrees, never screen coordinates.
Do not normalize model outputs to make them agree. Historical source evidence,
place provenance and numerical result provenance remain separate.

## Ordered slices

| Slice | Delivery | Acceptance gate |
|---|---|---|
| P5.1 | Typed geographic selection: lat/lon, optional ellipsoidal height, place ID and source metadata | Preserve online/offline identity; every free pick clears old identity; reject invalid coordinates; no fabricated height or legacy provenance |
| P5.2 | Independent Gleason, AE and WGS84 adapters | Explicit domains/units/model versions; round trips and invalid-domain tests; no inter-engine dependencies or pixel interchange |
| P5.3 | Search/pick/marker synchronization | A single event updates canonical selection; no echo loops/stale updates; geographically matching markers in each supported view |
| P5.4 | Basic Model Laboratory inspector | Each output has model/version/input/unit/evidence; incomplete or unsupported output is explicit |
| P5.5 | Comparability contract | Reject comparisons across different meanings, units or undefined scales; no radius-to-km conversion without a declared basis |
| P5.6 | Optional geographic focus | Explicit user control; independent cameras/zoom; selection is preserved during navigation |
| P5.7 | Homogeneous differences and future time/layer/route contracts | Differences only for compatible quantities; future services explicitly unavailable |
| P5.8 | Versioned local state persistence | Offline restore from installed packs; invalid/old state safely handled; no silently invented identity |
| P5.9 | Phase regression and owner acceptance package | Browser/offline/AR/EN/mobile/poles/antimeridian tests, source visibility, manual results and known limitations |

P5.1 and the Arabic city correction are closed after owner-reported successful testing (2026-09-19). P5.2 independent adapters are closed following CI #198 and owner-reported success of all delivered tests; see `PHASE_5_P5_2_REPORT.md`. The owner then instructed «اكمل»: P5.3 selection/marker synchronization is the current delivery; see `PHASE_5_P5_3_REPORT.md`. P5.4–P5.9 remain pending.
This is not an assertion of 1/9 of total effort: slices have different sizes.

## P5.1 contract decisions

- `GeographicSelection` is a discriminated union: `place` from search, or `free-point` from a map.
- One immutable snapshot holds the point, originating model, schema version,
  reference frame, angular unit and nullable place metadata. Place metadata has no
  second copy of the coordinates.
- `ellipsoidalHeightM` is optional. Absence means unknown, not zero or orthometric
  height. Lat/lon use inclusive [-90,90]/[-180,180]; both antimeridian signs remain
  intact. Source classification is preserved rather than inferred from WGS84.
- A free pick never inherits place identity, even if numerically coincident with
  the last searched place. Applying search focus is not a new user pick.
- Existing search still focuses WGS84. Projection markers and camera synchronization
  are later slices. Geodesic capture remains restricted to the existing WGS84 flow.
- Schema version 1 reserves an explicit contract version; persistence/decoding is
  P5.8 and is not claimed here. React state remains transient across reloads.
- Package version 0.4.0 remains the last accepted version during this unreleased
  slice. Implementation phase is 5, accepted phase is 4, status is `in_progress`.

## Sources

- `PROJECT_HANDOFF_CURRENT.md`: current acceptance and implementation discipline.
- `ROADMAP_CURRENT.md`: approved P5.1–P5.9 scope and Phase 5/6 boundary.
- `PHASE_4_ACCEPTANCE.md`: accepted baseline and historical hold.
- `frontend/src/search/placeSelection.ts`: existing online/offline provenance contract.
- `frontend/src/models/projectionTypes.ts`, `reference/referenceMath.ts`: existing geographic inputs.
- No new historical claims, external datasets or dependencies are introduced.
