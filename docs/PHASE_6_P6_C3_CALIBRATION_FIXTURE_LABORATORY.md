# Phase 6 · P6.C3 — Calibration & Fixture Laboratory

Status: **OWNER MANUAL 6/6 PASS ON `acb232c9ab78bcd8c84e16fd666b37200b5d1c57` AFTER #904 SUCCESS — OWNER-APPROVED RULER/UNIT REFINEMENT IN PROGRESS — TARGETED RETEST REQUIRED AFTER CI**

Date started: 2026-09-22

Baseline:
`main @ 90d03c98d3345d563dd3a6721be4542c1d35af9f` — PR #38 / P6.C2 merge.

Working branch:
`feat/p6.c3-calibration-fixture-laboratory`

## 1. Purpose

P6.C3 implements the owner-approved `GleasonCalibrationLaboratory` from the
measurement/UX architecture amendment. It compares source-backed fixtures
without collapsing unlike meanings, units or evidence classes into one hidden
scale.

The laboratory reports profile behavior and residuals. It does **not** select a
scientific/political winner and it does not promote secondary evidence to
primary historical authority.

## 2. Approved source classes

Fixtures preserve one of the existing source identities:

- `GLEASON_PRIMARY_HISTORICAL`;
- `OWNER_SECONDARY_OBSERVED`;
- `EXTERNAL_COMPARATIVE_MODEL`;
- `REFERENCE_SOURCE`.

The initial fixture registry is grounded only in already-audited project
sources:

- `data/sources/gleason-book.yaml`;
- `data/sources/gleason-measurement-unit-audit-2026-09-22.yaml`;
- `data/sources/gleason-video-measurement-audit.yaml`;
- `data/sources/gleason-restored-map.yaml`;
- `data/sources/gleason-owner-8k-map.yaml`;
- `data/sources/walter-bislin-comparative-models.yaml`.

No fixture may invent a city control point, raster correspondence, unit identity
or SI conversion not supported by one of those sources.

## 3. Fixture contract

Each fixture uses a versioned identity and records, where applicable:

```text
fixture_id
fixture_version
fixture_kind
endpoints
source_distance
source_unit
source_class
evidence_level
prediction_profile_id
profile_prediction
prediction_unit
residual_absolute
residual_percent
latitude_context
direction_context
status
provenance
notes
```

A fixture may be `ready`, `diagnostic-only`, or `gated`.

A numeric residual is emitted only when source and prediction quantities are
semantically compatible and use the same unit after an explicitly declared
conversion. Otherwise the comparison fails closed and the residual remains
unavailable.

## 4. Initial fixture families

### 4.1 Book / Figure 43

Primary historical fixtures preserve Figure 43 as a **local longitude-scale**
source, not a universal arbitrary-route metric.

Initial deterministic checks include:

- Equator: 60 historical Figure-43 miles per longitude degree;
- latitude-dependent rule:
  `60 - (2/3) * latitude_deg`;
- same-latitude arc and straight planar chord remain distinct quantities.

The Figure-43 mile identity remains unresolved for automatic SI conversion.

### 4.2 Owner video fixtures

The audited video registry provides deterministic secondary fixtures, including:

- `(0,-105) -> (-60,-165)`:
  `4994.930255778278 historical Fig.43 miles`;
- Australia at 30 S, `114.967 E -> 153.25 E`:
  arc `3062.64`, straight chord `3005.986408184987`;
- north-south Australia, `-2.605 -> -38.06` at the same longitude:
  `1354.281241757556`;
- ruler/protractor triangle `17.3, 10.6, 52 degrees`:
  direct chord `13.6326812223 cm`.

These are `OWNER_SECONDARY_OBSERVED`; they do not become historical truth.

### 4.3 Walter external comparison

Walter remains `EXTERNAL_COMPARATIVE_MODEL`.

The default direct-SI fixture preserves:

- north pole -> Equator = `10008 km`;
- project normalized relation = `20016 km / NRU`.

It is never relabeled as Gleason historical.

### 4.4 Raster diagnostics

The existing restored raster is available only as a visual/provisional
geometric calibration foundation:

- raster: `4653 x 6506`;
- fitted center:
  `(2315.1835844095776, 3287.4068173009764) px`;
- fitted outer-ring radius:
  `1851.8383776797139 px`;
- radial fit RMS:
  `5.768749489287826 px`;
- median absolute residual:
  `4.706116332701413 px`.

This is **not** a geographic city-control truth set.

The true owner 8K/JGW companion raster remains unavailable, so **JGW georeferencing**
stays gated. However, after the owner's 6/6 manual PASS, the owner explicitly
approved the recovered `Gleason-map-8k.jpg` received representation
(**1361 x 2048**, SHA-256 `884e9b2473eac5929b25375bc2a1be9907866e03653722b6a3bbc2dd9a62ef1d`)
as the P6.C3 visual/ruler proxy because the original full-resolution raster is unavailable.

The reference is verified in
`docs/GLEASON_LOWER_RES_REFERENCE_UNIT_VERIFICATION_2026-09-22.md`.

Verified named ruler conversion profiles are now:

- English/Land/Statute mile: `5280 ft = 1609.344 m`;
- Nautical/Sea/Solar mile — Chapter XVII: `6075 ft = 1851.66 m`;
- Figure-37 ratio-derived Nautical/Sea/Geographical mile:
  `208 English = 180 nautical` -> `1859.6864 m`.

The 6075-foot and Figure-37 ratio profiles conflict by `8.0264 m` per mile;
both remain visible and separately named. The generic `historical-fig43-mile`
identity remains unresolved for automatic SI conversion.

After numeric verification plus the owner's proxy authorization, the JGW
**affine working unit is metre**. One JGW pixel step is
`5014.548291487017 m` =
`3.115895850413 international statute miles` =
`2.707639466246 international nautical miles`.
The named CRS remains unknown/not encoded and exact proxy-to-original pixel
pairing remains gated.

The earlier JGW native unit
and CRS also remain unknown.

### 4.5 Modern reference pairs

Selected WGS84 reference pairs may be used for residual analysis only when the
comparison explicitly preserves `REFERENCE_SOURCE` identity and compatible
units. A WGS84 result is never silently reinterpreted as a Gleason historical
measurement.

## 5. Residual semantics

For compatible scalar quantities:

```text
residual_absolute = profile_prediction - source_distance
residual_percent  = 100 * residual_absolute / source_distance
```

The signed residual is preserved. UI may additionally show absolute magnitude.

For zero-valued source quantities, incompatible units, non-scalar diagnostics,
or gated fixtures, `residual_percent` is unavailable rather than fabricated.

## 6. Local scale/distortion diagnostics

P6.C3 may report:

- radial and tangential/local-longitude scale behavior;
- latitude context;
- direction context;
- Walter-vs-WGS84 reference residuals;
- fixture-specific empirical fit residuals;
- raster geometric residuals in pixels.

It must label the calculation space and unit for every diagnostic.

## 7. Research profile selection

The laboratory UI may let the user select a research profile to inspect fixture
predictions. Selection changes only the laboratory comparison view; it does not
rewrite the canonical route, the P6.C2 profile identities, or P6.7A rendering
identity.

Profiles that remain gated must be visible as gated/unavailable instead of
returning fabricated values.

## 8. Fail-closed boundaries

P6.C3 does **not**:

- declare a preferred scientific winner;
- infer Figure-43 mile identity;
- fabricate raster/city control points;
- claim the 1361x2048 proxy is the unavailable original 8K pixel matrix or exact JGW pixel companion;
- promote the provisional restored-raster fit to geographic truth;
- start P6.C4 elevation work;
- redesign the workspace for P6.C5;
- resume P6.7B.

## 9. Initial implementation order

1. lock fixture registry/schema and source provenance;
2. implement deterministic fixture prediction/residual engine;
3. add unit tests for source identities, residual arithmetic and fail-closed cases;
4. expose a bilingual research-profile laboratory UI;
5. add browser acceptance coverage;
6. add backend/parity only for calculations that need a server authority;
7. run complete Release Acceptance Gates;
8. run owner manual checklist;
9. closure-state CI;
10. merge only by separate owner authorization.

P6.C4 and P6.C5 remain **NOT STARTED**.
P6.7B remains **PAUSED / NOT STARTED**.
No tag, GitHub Release or deployment is created by starting P6.C3.

## 10. Current implementation checkpoint

Implemented on draft PR #39:

- source registry: `data/sources/gleason-calibration-fixtures.yaml`;
- deterministic browser engine: `frontend/src/measurement/gleasonCalibrationLaboratory.ts`;
- bilingual research UI: `frontend/src/measurement/GleasonCalibrationLaboratoryPanel.tsx`;
- core tests: `frontend/tests/gleason-calibration-laboratory.test.mjs`;
- browser acceptance coverage in `frontend/tests/e2e/acceptance.spec.ts`;
- workspace integration in `frontend/src/App.tsx`.

The initial executable registry contains **9 fixtures** across the approved
book/video/Walter/reference/raster families. The restored 4653x6506 raster is
diagnostic-only and preserves its recorded pixel RMS. The owner 8K/JGW fixture
is visible but **GATED** with reason
`missing-true-companion-8k-raster`.

Exact implementation head `ed411b6f14ab1df2b406004a44a13af48dcd534a`
passed the complete Release Acceptance Gates **#897 — SUCCESS**.

Development runs retained as non-closure history:

- **#894**: initial TSX residual-percentage escape caused production-build failure;
- **#895**: selector ambiguity after adding the second Gleason laboratory plus a
  locale-formatted numeric assertion caused browser acceptance failure.

Both causes were corrected before #897. On #897 the acceptance-package checker,
backend, frontend core tests, WGS84/Gleason/P6.6 parity, production build/PWA,
browser acceptance, Docker runtime, PostGIS import/coverage, Arabic/offline
search, Redis and frontend-over-Docker all passed.

The exact recording head `acb232c9ab78bcd8c84e16fd666b37200b5d1c57`
passed Release Acceptance Gates **#904 — SUCCESS** before owner manual testing.

Owner manual verification then completed **6/6 PASS — REPORTED BY OWNER** on
that exact head.

After the manual PASS, the owner approved the lower-resolution visual/ruler
reference and requested verified metre/mile adoption. This post-manual
refinement changes source policy and UI behavior. It therefore requires:

1. complete Release Acceptance Gates on the refinement head;
2. a **targeted owner retest** limited to the affected ruler/unit/JGW
   presentation;
3. only then may P6.C3 proceed to closure-state CI.

The six original manual checks remain recorded as PASS; they are not discarded.


## 11. Owner manual verification record

Exact tested head:
`acb232c9ab78bcd8c84e16fd666b37200b5d1c57`

Pre-manual Release Acceptance Gates:
**#904 — SUCCESS**

Owner result:
**6/6 PASS — REPORTED BY OWNER**

Passed items:

1. laboratory presence and complete nine-fixture set;
2. source identity and residual semantics;
3. research-profile selector;
4. local-scale diagnostic;
5. raster diagnostic + original 8K/JGW fail-closed presentation;
6. Arabic, route regression and general stability.

## 12. Post-manual owner-approved ruler refinement

Owner instruction:
use the available lower-quality image as the reference because the higher-quality
image is unavailable, and adopt metre/mile conversions after verification.

Implementation decisions:

- `Gleason-map-8k.jpg` 1361×2048 (SHA-256 `884e9b...`) is the approved **owner-authorized visual/ruler proxy**;
- its SHA-256 remains
  `9ccbf6b304062082b813a4719654ffbca03e965e7d9ded5b8ee7b34914dd8a03`;
- three named historical ruler conversion profiles are exposed;
- the 6075-foot and Figure-37 ratio conflict is displayed explicitly;
- generic Figure-43 mile SI identity remains unresolved;
- JGW affine working unit is **metre** under owner-authorized proxy verification;
- explicit modern international statute-mile and nautical-mile conversions are exposed;
- JGW CRS remains unknown/not encoded;
- exact proxy/original pixel pairing remains gated because the original full-resolution raster is unavailable;
  georeferencing evidence exists.

Targeted owner retest status: **NOT RUN**.
