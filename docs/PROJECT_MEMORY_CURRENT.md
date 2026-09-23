# Gleason-platform — Project Memory / Current Handoff
Last reconciled: 2026-09-23
Project key: `Gleason-platform`

## Purpose
This is the canonical cross-conversation handoff for the Gleason-platform project. It records current implementation state, governance, sources, accepted/manual-test evidence, unresolved items, experimental proposals, generated artifacts, and next steps.

When continuing in a new conversation, use this file together with:
- `docs/PROJECT_HANDOFF_CURRENT.md`
- `docs/PHASE_6_PLAN.md`
- `docs/ROADMAP_CURRENT.md`
- `docs/PHASE_6_P6_C3_CALIBRATION_FIXTURE_LABORATORY.md`
- `docs/PHASE_5_ACCEPTANCE_PACKAGE.json`

Do not treat an experimental proposal as implemented unless explicitly marked IMPLEMENTED / VERIFIED / MERGED.

## Repository and governance
Repository: `amralqatawneh-prog/gleason-platform`

Current accepted main baseline:
`90d03c98d3345d563dd3a6721be4542c1d35af9f` (PR #38 / P6.C2 merge)

Current functional branch:
`feat/p6.c3-calibration-fixture-laboratory`

Current PR: #39 — DRAFT / OPEN / UNMERGED
Runtime refinement head analyzed under CI #936:
`a0e8436c307c9384c06413bcf8264f7c57c8ec13`

Persistence/documentation commits may advance the PR head without changing runtime logic. Always query PR #39 fresh before making any code change.

Governance:
1. One phase/slice at a time.
2. Owner manual PASS only when explicitly reported by owner.
3. Never merge without a separate explicit owner authorization.
4. P6.C4/P6.C5 stay NOT STARTED while P6.C3 remains open under current governance.
5. P6.7B remains PAUSED / NOT STARTED until P6.C1–P6.C5 close.
6. No tag, GitHub Release, or deployment unless explicitly authorized.
7. Preserve source/provenance/calculation-space identities; no hidden normalization.
8. Missing evidence/data stays fail-closed.
9. Experimental ideas are not runtime changes until explicitly approved.

Accepted application version remains `0.5.0`; accepted phase remains Phase 5; Phase 6 is IN PROGRESS.

## Closed corrective slices
### P6.C1
CLOSED / VERIFIED / MERGED through PR #37.
Merged checkpoint: `3096d963b75478682923c20925e3eac974bbfb69`

### P6.C2
CLOSED / VERIFIED / MERGED through PR #38.
Owner-tested head: `b1dacada7cb84c715b71c654c7abe465d370cc0b`
CI #876 SUCCESS; owner manual 6/6 PASS — REPORTED BY OWNER.
Closure head `d698c88b43cd75f7925551d323c10836cac41ab8` passed #877.
Final recording head `b70c78cd5bde41ab5ebe72a042115a1754491f54` passed #878.
Merged main: `90d03c98d3345d563dd3a6721be4542c1d35af9f`.

## P6.C3 — Calibration & Fixture Laboratory
### Original manual verification
Exact owner-tested head:
`acb232c9ab78bcd8c84e16fd666b37200b5d1c57`
Pre-manual CI: #904 SUCCESS.
Owner manual result: **6/6 PASS — REPORTED BY OWNER**.

Original fixture set `P6.C3-fixtures-v1`, count 9:
1. `book-fig43-equator-one-degree`
2. `video-dNBxb-spreadsheet-chord`
3. `video-dNBxb-australia-chord`
4. `video-dNBxb-australia-north-south`
5. `video-SuHnvvYEfok-ruler-triangle`
6. `walter-pole-equator-default`
7. `reference-equator-one-degree-wgs84-vs-walter`
8. `raster-restored-outer-ring-fit`
9. `raster-owner-8k-jgw`

### Owner instruction after manual PASS
Original full-resolution raster is unavailable. Owner authorized use of the lower-quality received image as a reference and adoption of metre/mile after verification.

Recovered exact received proxy:
- `Gleason-map-8k.jpg`
- 1361×2048 px
- 1,233,904 bytes
- SHA-256 `884e9b2473eac5929b25375bc2a1be9907866e03653722b6a3bbc2dd9a62ef1d`
- Library id `libfile_59fd00b0a9908191b5a57473d3b40383`

This is the owner-authorized visual/ruler proxy. It is not claimed to be the unavailable original 8K pixel matrix. The separate 1464×2048 JPEG remains a separate reference.

### Historical ruler units preserved
English/Land/Statute mile:
`5280 ft × 0.3048 = 1609.344 m`

Chapter XVII Nautical/Sea/Solar mile:
`6075 ft × 0.3048 = 1851.66 m`

Figure 37 ratio:
`208 English miles = 180 nautical/sea/geographical miles`
Ratio-derived nautical/geographical mile:
`(208/180) × 1609.344 = 1859.6864 m`

Historical conflict:
`1859.6864 - 1851.66 = 8.0264 m per mile`
Keep both; no hidden reconciliation.

Chapter XIX comparison:
`6070 ft × 0.3048 = 1850.136 m`

Generic Figure-43 mile remains unresolved as a direct automatic SI identity.

### JGW refinement
World file: `data/sources/artifacts/8k-Flat-Earth-map.jgw`
Affine values:
A=5014.54829148701719532; D=0; B=0; E=-5014.54829148701719532; C=-19423852.80707496032118797; F=19448678.93866851553320885.

Current refinement policy:
- affine working unit accepted as metre under owner-authorized proxy verification;
- one JGW affine pixel step = `5014.548291487017 m`;
- = `3.115895850413 international statute miles`;
- = `2.707639466246 international nautical miles`;
- CRS remains UNKNOWN / NOT ENCODED;
- exact original-raster pixel pairing remains GATED;
- do not fabricate control points or infer EPSG/CRS from JGW alone.

Key docs:
- `docs/GLEASON_PROXY_JGW_UNIT_VERIFICATION_2026-09-22.md`
- `data/sources/gleason-owner-8k-proxy-verification.yaml`

### Current P6.C3 CI issue
Current refinement head:
`a0e8436c307c9384c06413bcf8264f7c57c8ec13`
Release Acceptance Gates #936: **FAILURE**.

All steps through production build/PWA were green. Failure was Browser/E2E only.
Specific mismatch:
expected `data-p6c3-visual-reference="gleason-owner-8k-received-proxy-2026-09-22"`
but rendered UI returned `gleason-owner-hires-jpeg-reference-2026-09-22`.

Therefore P6.C3 refinement is not technically green yet. Targeted owner retest has not started. Fix the browser/UI identity mismatch, then rerun complete Release Acceptance Gates on a new exact head before any targeted retest or closure.

## Current runtime measurement model before experimental redesign
Current normalized Gleason plane:
`r = (90 - latitude_deg) / 180`
`x = r * sin(longitude)`
`y = -r * cos(longitude)`
Straight projected chord:
`d = hypot(x2-x1, y2-y1)`

`NRU = normalized-radius-unit` is a project computational normalization, not a historical unit printed by Gleason, and it has no single universal km value across all profiles.

Current P6.C2 executable SI profiles include Walter direct-SI plus explicit Figure43 assumption profiles (6075 ft, Fig37 ratio, 6070 ft) and the legacy radial-60 international-NM comparison. Direct historical Figure43→SI remains fail-closed.

## Experimental proposals — RESEARCH ONLY / NOT IMPLEMENTED
### Proposal A — remove NRU + Great Circle
Discussed: eliminate NRU from final/user-facing calculation; compute Great-Circle angular distance from lat/lon; use profile-specific equivalent radius.
Approximate discussed radii:
- Walter: 6371.291 km
- 6075-ft: 6365.538 km
- Fig37 ratio: 6393.131 km
- 6070-ft: 6360.299 km
This was not approved for runtime implementation.

### Proposal B — Gleason-only azimuthal planar test
Owner then requested an experimental Gleason-style north-polar azimuthal layout using direct kilometres and straight planar chord.
First test standard used North Pole→South Pole = 12731 km.
That standard is superseded for current experiments by **12720.6 km**.

## Current experimental standard — 12,720.6 km
**Research/test space only; not runtime code.**

Radial formula:
`r_km = 12720.6 × (90° - latitude) / 180°`

Therefore:
- North Pole radius = 0 km
- Equator radius = 6360.3 km
- South Pole outer radius = 12720.6 km

Projected coordinates:
`x = r_km × sin(longitude)`
`y = -r_km × cos(longitude)`

Straight map distance:
`D = sqrt((x2-x1)^2 + (y2-y1)^2)`

Modern coastline/country-boundary data were reprojected onto this test projection for visualization. The reconstructed test map is not claimed to be the original historical Gleason raster.

### Current experimental map artifacts
Latest 12,720.6-km standard:
- `gleason_repositioned_countries_12720_6km.png`
- `gleason_repositioned_countries_12720_6km.svg`

Historical/superseded 12,731-km standard:
- `gleason_repositioned_countries_12731km.png`
- `gleason_repositioned_countries_12731km.svg`

## Current 12,720.6-km distance-test results
Coordinates used:
- Perth `(-31.9523, 115.8613)`
- Sydney `(-33.8688, 151.2093)`
- Johannesburg `(-26.2041, 28.0473)`
- Santiago `(-33.4489, -70.6693)`
- Dubai `(25.2048, 55.2708)`
- Doha `(25.2854, 51.5310)`
- Amman `(31.9539, 35.9106)`
- Cairo `(30.0444, 31.2357)`

Spherical comparison used in the experiments:
Great Circle on mean-radius sphere `R = 6371.0088 km`.

Sydney→Santiago:
- azimuthal test = 16323.694 km
- spherical Great Circle = 11346.731 km
- difference = +4976.964 km
- approximately 43.86% longer on experimental projection.

Perth→Johannesburg:
- azimuthal test = 11675.459 km
- spherical Great Circle = 8313.868 km
- difference = +3361.591 km
- approximately 40.43% longer.

Perth→Dubai:
- azimuthal test = 7515.757 km
- spherical Great Circle = 9037.894 km
- difference = -1522.137 km
- approximately 16.84% shorter.

Latitude radial tests:
`12720.6 / 180 = 70.67 km per latitude degree`
So, on the same longitude:
- 65°N→66°N = 70.67 km
- 65°S→66°S = 70.67 km

## Superseded 12,731-km experiment history
Retained only as historical research output:
- Perth→Sydney ≈ 5280.10 km planar vs 3290.46 km spherical
- Sydney→Santiago ≈ 16337.04 km planar vs 11346.73 km spherical
- Perth→Johannesburg ≈ 11685.004 km planar vs 8313.868 km spherical
- Perth→Dubai ≈ 7521.902 km planar vs 9037.894 km spherical

## Main source files
Primary book:
`Alex Gleason - Is the Bible From Heaven.pdf`
Library id `libfile_0a6ef4a2e4708191916af58f37067c98`

Important locators:
- Figs.37–38 / Chapter XVII: PDF pp.376–377 / printed pp.349–350
- Fig.43: PDF p.429 / printed p.402

Owner proxy:
`Gleason-map-8k.jpg`
Library id `libfile_59fd00b0a9908191b5a57473d3b40383`

Other key source registries:
- `data/sources/gleason-book.yaml`
- `data/sources/gleason-measurement-unit-audit-2026-09-22.yaml`
- `data/sources/gleason-video-measurement-audit.yaml`
- `data/sources/gleason-restored-map.yaml`
- `data/sources/gleason-owner-8k-map.yaml`
- `data/sources/gleason-owner-hires-jpeg-reference.yaml`
- `data/sources/gleason-owner-8k-proxy-verification.yaml`
- `data/sources/walter-bislin-comparative-models.yaml`
- `data/sources/gleason-calibration-fixtures.yaml`

## Next work steps
### Immediate implementation path
1. Fix P6.C3 browser/UI visual-reference identity mismatch from CI #936.
2. Run complete Release Acceptance Gates on the new exact head.
3. After full CI success, run targeted owner retest of affected proxy/ruler/JGW presentation.
4. If owner passes targeted retest, record closure state and run closure-state CI.
5. Wait for separate explicit owner authorization before merging PR #39.
6. Reconcile main after merge.
7. P6.C4 remains NOT STARTED until P6.C3 closes.

### Experimental research path
Continue owner-requested distance tests using the current 12,720.6-km azimuthal standard. For each test record exact endpoints/lat-lon, projected radii, planar chord, spherical Great-Circle comparison, absolute difference, percentage difference, and model/version identity.
Do not modify runtime calculations from these experiments until owner explicitly approves a final proposal.

## New-conversation restart protocol
Safest restart instruction:

`تابع مشروع Gleason-platform. اقرأ أولًا docs/PROJECT_MEMORY_CURRENT.md وdocs/PROJECT_HANDOFF_CURRENT.md من مستودع amralqatawneh-prog/gleason-platform، ثم تحقق من PR #39 وCI الحالي قبل أي تعديل.`

Also check the persistent Library project folder `/Gleason-platform/`.
Do not rely on a chat title alone as the sole source of project state.

## Persistence policy
Owner requested continuous preservation of inputs, outputs, files, sources, proposals, accepted decisions, superseded proposals, implementation progress, manual tests, CI evidence, generated experiment maps, and next steps.
This file is the canonical current snapshot. Future material changes should update this file and the handoff docs during the active chat. There is no background/asynchronous update process.