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

P5.1 and the Arabic city correction are closed after owner-reported successful testing (2026-09-19). P5.2 independent adapters are closed following CI #198 and owner-reported success of all delivered tests; see `PHASE_5_P5_2_REPORT.md`. P5.3 is closed after CI #204 and owner-reported successful retest. P5.4 Basic Model Laboratory is closed after refined implementation CI #236 SUCCESS and owner-reported functional/clarity PASS. P5.5 Comparability Contract is next but NOT STARTED; P5.5–P5.9 remain pending.
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

P5.3 review update (2026-09-19): owner reports correct shared readings but missing projection markers and requests a non-hollow globe. Current correction is documented in `PHASE_5_P5_3_VISUAL_FIX.md`: isolate OpenLayers pixel layout from RTL and add an opaque ellipsoid surface. At that review P5.3 was not accepted; the later acceptance closure below supersedes this status. Satellite imagery/terrain are not included.

## P5.3 acceptance closure — 2026-09-19

Owner reported «نجحت الاختبارات كلها» after the marker/opaque-surface correction.
Manual result: **PASS — REPORTED BY OWNER**; device/browser/local checkout SHA
were not supplied. P5.3 is closed, including both reported visual issues.
Implementation evidence: commit `3ca3989868b6bcc42e8f1aae8d09f035b1c7a98e`,
[CI #204 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35441426643),
including 58 core tests and 10 Chromium scenarios. This is evidence for that
implementation revision, not a claim of a new test run for this documentation.
P5.4 remains the next implementation slice. Full Phase 5 acceptance is pending;
accepted application version stays 0.4.0. No merge, tag or release.

The owner also requested navigation controls, multi-stop paths and distance/area
measurement, then instructed «اكمل». Scheduling and acceptance requirements are
recorded in `NAVIGATION_MEASUREMENT_REQUIREMENTS.md`; those tools are not yet
implemented by this documentation update.


## P5.4 start — 2026-09-19

The owner explicitly instructed «ابدأ» after review of the current handoff.
P5.4 is now the only active implementation slice. Its implementation/report is
`PHASE_5_P5_4_REPORT.md`. P5.5 is not authorized by this start instruction.


## P5.4 acceptance closure — 2026-09-19

P5.4 is closed. The initial functional checklist passed, but the owner found the
technical-first results insufficiently understandable. An approved same-slice UX
refinement added plain-language meaning while preserving all model calculations,
units, source evidence and adapter contracts under expandable technical details.

Owner final clarification result: **PASS — REPORTED BY OWNER** («القسم اصبح
واضحا، اكمل التوثيق»).

Implementation head `29fa6190185ec7901c14f586ad26213337190272` passed
[CI #236](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35458166222)
on attempt 6 after transient npm-registry 400 responses blocked the audit gate
on earlier attempts. The successful run found 0 vulnerabilities and completed
62 core tests, 2 PWA tests, 11 Chromium scenarios and all remaining release
acceptance gates.

P5.5 Comparability Contract is **CLOSED** after CI #266/#271 SUCCESS and owner-reported manual PASS. The owner then instructed «أكمل» and P5.6 Optional Geographic Focus / Navigation is **CLOSED** after CI #329/#340 SUCCESS and owner-reported manual PASS. Full Phase 5 acceptance remains pending; no merge/tag/release is authorized.


## P5.5 start — 2026-09-19

After P5.4 closure, the owner explicitly instructed «أكمل». P5.5 Comparability
Contract is now the only active slice. It must reject direct comparison when
quantity meaning/dimensionality, coordinate space, units or scale basis are not
compatible, and it must distinguish structural incompatibility from missing
output. No normalization or unit conversion is allowed to force agreement.

Implementation/report: `PHASE_5_P5_5_REPORT.md`. P5.5 is now closed after owner-reported PASS. P5.6 and Phase 6 remain NOT STARTED. No merge, tag or release is authorized.


## P5.5 acceptance closure — 2026-09-19

The owner reported «نجحت جميع اختبارات P5.5» after the delivered manual
checklist. Manual result: **PASS — REPORTED BY OWNER**.

Automated evidence:
- CI #266 SUCCESS on implementation/documentation head
  `1bf01cda0a1b4273b14f7d1c06a844021e575648`;
- CI #271 SUCCESS on later documentation head
  `4c9e2eb6d955331345ae73f2029b2cd0c4764664`.

P5.5 is **CLOSED**. The owner subsequently instructed «أكمل», authorizing P5.6. P5.6 Optional Geographic Focus / Navigation is now **IN PROGRESS / awaiting owner manual verification**. Full Phase 5 acceptance remains pending. No merge, tag or release.


## P5.6 start and automated verification — 2026-09-19

After P5.5 closure the owner explicitly instructed «أكمل», authorizing P5.6 only.
At the start audit, P5.6 navigation commits were already present on the working
branch while the handoff/plan still described the slice as NOT STARTED. The
repository state was therefore reconciled and reviewed instead of duplicating
the implementation.

Delivered scope is documented in `PHASE_5_P5_6_REPORT.md`: independent
Gleason/AE/WGS84 navigation with zoom controls, wheel/pinch support, explicit
zoom-to-area, rotation/view-direction controls where meaningful, reset, fit-full
and optional focus-selected. Camera navigation preserves the canonical
geographic selection and numeric zoom values are never equated across models.

Final audited implementation head
`378f0a8ed6710195cb1e48e0ebcd4518116a5d0d` passed
[CI #329](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35462318226):
0 npm vulnerabilities, 71 frontend core tests, 2 PWA tests, 14 Chromium
scenarios, production build, parity, Docker/PostGIS/Redis and source/search gates
all PASS.

P5.6 is **CLOSED** after owner-reported manual PASS. P5.7 is next and remains NOT STARTED; Phase 6 remains NOT STARTED.


## P5.6 acceptance closure — 2026-09-19

The owner reported «نجحت كل الاختبارات» after completing the delivered P5.6
manual checklist. Manual result: **PASS — REPORTED BY OWNER**.

Automated evidence:
- P5.6 implementation head
  `378f0a8ed6710195cb1e48e0ebcd4518116a5d0d` — CI #329 SUCCESS;
- later documented branch head
  `3de1169c0f1534b9f0417dda81de8176f8f99b2c` — CI #340 SUCCESS.

P5.6 is **CLOSED**. P5.7 Homogeneous Differences and future time/layer/route
contracts is next and remains **NOT STARTED** until the owner explicitly
instructs continuation. Phase 6 remains NOT STARTED. Full Phase 5 acceptance
remains pending. No merge, tag or release.
