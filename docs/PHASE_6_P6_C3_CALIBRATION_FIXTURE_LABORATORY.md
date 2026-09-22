# Phase 6 · P6.C3 — Calibration & Fixture Laboratory

Status: **IN PROGRESS — FIXTURE ENGINE + RESEARCH UI IMPLEMENTED / AWAITING COMPLETE CI**

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

The owner 8K/JGW source remains `gated`: the true companion 8K raster is still
missing. The JGW alone must not be treated as named metres/miles/CRS or as final
pixel calibration.

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
- pair the 8K JGW with the unrelated 1464x2048 JPEG;
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

Complete Release Acceptance Gates must pass before this checkpoint is considered
technically green. Owner manual verification remains **NOT RUN**.
