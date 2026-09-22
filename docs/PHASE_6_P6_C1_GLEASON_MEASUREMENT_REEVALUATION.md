# Phase 6 / P6.C1 — Gleason Measurement Re-evaluation

Status: **CLOSED / VERIFIED / MERGED — owner manual 6/6 PASS; #859 closure; exact recording head #864 SUCCESS; PR #37 merged at `3096d963b75478682923c20925e3eac974bbfb69`**

Owner authorization:
**«انا اعتمد هذه الخارطة، أبدأ أولًا بإنشاء وثيقة Architecture Amendment رسمية على GitHub تجمع هذه القرارات والمعادلات ومصادرها، ثم نبدأ P6.C1 منها.»**

## 1. Baseline and post-merge retargeting

P6.C1 was intentionally started stacked on the verified architecture amendment:

- historical stacked base branch:
  `docs/measurement-ux-celestial-architecture-amendment-2026-09-22`;
- historical stacked base head:
  `06b9d4ad2b8c13fabed90fdd76d1e50faed2c2d1`;
- amendment initial verification:
  Release Acceptance Gates **#832 — SUCCESS**;
- amendment exact closure-state verification:
  Release Acceptance Gates **#837 — SUCCESS**.

The owner then explicitly authorized **«قم بدمج PR #36.»**. PR #36 was merged
into `main` at:

`7e398ebab7841f0b5e6ced9f9437f144efc318e7`.

PR #37 was retargeted to `main` and synchronized with that merge through:

`16b122f77ffbfd02129448a57f5096e1973a7e45`.

Final P6.C1 PR state: **#37 — MERGED / CLOSED**. Merge commit: `3096d963b75478682923c20925e3eac974bbfb69`.

P6.7B remains **PAUSED / NOT STARTED**.

## 2. P6.C1 goal

Replace the earlier "one preferred Gleason multiplier" interpretation with a
versioned measurement-profile contract that preserves source identity and fails
closed on unsupported SI conversions.

P6.C1 does **not** implement the final SI runtime engine. That belongs to P6.C2.

## 3. New profile contract

Implementation:

`frontend/src/measurement/gleasonMeasurementProfiles.ts`

Required fields include:

- profile id/version;
- calculation space;
- source class;
- evidence level;
- native unit;
- SI conversion status;
- SI unit when direct SI is supported;
- scale rule;
- direction dependency;
- latitude dependency;
- provenance;
- limitations;
- fixture-set version;
- runtime status.

Source classes:

- `GLEASON_PRIMARY_HISTORICAL`;
- `OWNER_SECONDARY_OBSERVED`;
- `EXTERNAL_COMPARATIVE_MODEL`;
- `REFERENCE_SOURCE`.

## 4. Initial profiles

### 4.1 gleason-book-historical

- source class: `GLEASON_PRIMARY_HISTORICAL`;
- calculation space: `GLEASON_HISTORICAL_LONGITUDE_SCALE`;
- Figure 43 remains local longitude-scale evidence;
- SI conversion: **unresolved-unit-identity**;
- arbitrary slanted-route distance is not defined by Figure 43 alone.

### 4.2 walter-flat-plane-eq-10008

- source class: `EXTERNAL_COMPARATIVE_MODEL`;
- direct SI profile;
- default north-pole-to-Equator parameter:
  `E = 10008 km`;
- normalized-project equivalent:
  `1 NRU = 2E = 20016 km`;
- never relabeled as a Gleason historical rule.

### 4.3 gleason-video-ruler-calibrated

- source class: `OWNER_SECONDARY_OBSERVED`;
- calibration-gated;
- requires explicit fitted parameters, fixture set, residuals and validity region.

### 4.4 gleason-raster-calibrated

- historical-raster calculation space;
- calibration-gated;
- exact SI promotion waits for original source bytes/hash/dimensions and verified
  JGW/control geometry.

### 4.5 gleason-fig43-circle-derived-diagnostic

The former preferred `gleason-fig43-circle-derived` interpretation is demoted
to a diagnostic/regression role.

Current derived multiplier retained for regression:

`1 NRU = 21600/pi historical Fig.43 miles`.

It must not be presented as the one universal Gleason route-distance truth.

### 4.6 gleason-radial-60nm-legacy

Retained as secondary/legacy comparison only.

## 5. Historical mile unit audit

Audit registry:

`data/sources/gleason-measurement-unit-audit-2026-09-22.yaml`.

The source material contains multiple mile relationships which P6.C1 keeps
separate instead of silently reconciling.

### Chapter XVII / Figures 37–38

Registered source statements include:

- 208 English miles = 180 nautical/sea/geographical miles;
- 1 degree longitude = 4 minutes time;
- 1 minute arc is called one mile in the comparison table;
- English/statute mile = 5280 ft;
- nautical/sea/Solar mile = 6075 ft.

### Figure 43

The Figure 43 passage says it is convenient for obtaining longitude "in miles"
and gives 60 at the Equator, with the latitude-dependent divergence table.

P6.C1 conclusion:

**the exact Figure 43 mile identity remains unresolved for automatic SI
conversion**.

The surrounding chapter strongly connects longitude/time with
nautical/geographical miles, but the Figure 43 passage does not itself explicitly
declare that every Figure 43 "mile" is identical to the Chapter XVII
nautical/sea/Solar mile.

Therefore automatic Figure43→metre conversion fails closed.

### Chapter XIX navigator correspondence

A reproduced navigator letter states 6070 ft to the nautical mile, while Chapter
XVII says 6075 ft.

P6.C1 preserves both statements separately. It does not silently select one.

## 6. Historical unit scenarios

The contract therefore exposes separate scenarios:

- `fig43-mile-unresolved`;
- `chapter17-nautical-6075ft-context-assumption`;
- `fig37-208english-180nautical-context-assumption`;
- `chapter19-navigator-6070ft-context`.

There is intentionally **no default scenario**.

P6.C2 may implement explicit SI presentation profiles from one or more scenarios,
but each result must name the selected scenario.

## 7. Current runtime compatibility

P6.C1 changes contract/semantic metadata without replacing P6.5/P6.6 numerical
APIs.

The existing runtime alias:

`gleason-fig43-circle-derived`

is retained for compatibility but its registry role changes from
`historical-default` to:

`diagnostic-derived`.

The Gleason Measurement Laboratory text is updated accordingly so the UI no
longer calls it the default historical calibration.

No P6.C2 SI route output is introduced by P6.C1.

## 8. Automated contract tests

New test:

`frontend/tests/gleason-measurement-profiles.test.mjs`

It verifies:

1. six approved profiles exist with unique IDs;
2. Figure 43 historical profile fails closed for direct SI;
3. circle-derived is diagnostic only;
4. Walter profile is external/direct-SI and 1 NRU = 20016 km;
5. video/raster profiles remain calibration-gated;
6. all profiles carry version/provenance/limitations/fixture identity;
7. conflicting historical mile statements remain separate and no automatic
   default exists.

Existing historical measurement tests are updated to expect the diagnostic role.

## 9. Boundaries

P6.C1 does not:

- choose a final "best" Gleason distance profile;
- force agreement with WGS84;
- implement P6.C2 metre/km runtime output;
- implement the calibration lab;
- implement ellipsoidal elevation;
- implement Map-First UI;
- start P6.7B;
- create a tag, GitHub Release or deployment.

## 10. Closure verification

Owner-tested head:

`0fe9a18943fd6404773d6604c5ee901fd6773589`

Pre-manual Release Acceptance Gates:

**#850 — SUCCESS**

Owner manual result:

**6/6 PASS — REPORTED BY OWNER**

Closure-state head after recording the owner result:

`4e08520df5a8bbe5ed10e5f2ebc9ae8b8d4dac22`

Release Acceptance Gates:

**#859 — SUCCESS**

A stale checker assertion caused the preceding #857 run to fail before functional
gates; it incorrectly still required P6.C1 to be `in_progress`. The stale
assertions were corrected to the owner-verified `closed` state, and #859 then
passed the complete gate set.

The files now record #859, so this recording head must itself pass one final
complete gate run. No additional file commit is required after that pass; the
final exact-head evidence will be recorded in PR #37 comments so the verified
head remains unchanged.

## 10. Automated verification

Exact implementation/state head:

`1d316618163a26c4647aec63682b0a4c7bd39a26`

Release Acceptance Gates:

**#845 — SUCCESS**

The complete gate set passed, including repository/source-state validation,
backend/frontend tests, WGS84 and Gleason parity, P6.6 polygon parity,
production build/PWA/offline, browser acceptance, Docker runtime, PostGIS
catalog/import/search checks and Redis.

Owner manual verification completed successfully on exact tested head:

`0fe9a18943fd6404773d6604c5ee901fd6773589`

That head had already passed Release Acceptance Gates **#850 — SUCCESS**.

Owner statement:

**«اختبارات P6.C1 الستة نجحت كلها على الرأس
`0fe9a18943fd6404773d6604c5ee901fd6773589`»**

Manual result: **6/6 PASS — REPORTED BY OWNER**.

Verified checks:

1. Fig.43 / circle-derived remains explicitly diagnostic/derived;
2. unresolved Figure 43 mile identity fails closed for SI;
3. Figure 43 remains local/latitude-dependent and is not generalized across different latitudes;
4. Figure 37 frame/time and historical conversion relations remain separate;
5. Arabic/English source/evidence boundaries remain intact;
6. P6.C2 and P6.7B boundaries remain preserved / not started.

## 10. Closure record

P6.C1 completed its full acceptance path:

1. implementation/source-contract verification passed;
2. owner manual verification: **6/6 PASS — REPORTED BY OWNER** on `0fe9a18943fd6404773d6604c5ee901fd6773589` after #850 SUCCESS;
3. closure-state head `4e08520df5a8bbe5ed10e5f2ebc9ae8b8d4dac22` passed #859 SUCCESS;
4. exact recording head `385a04bc032fd7f3e0609a501a826023ea0a627e` passed #864 SUCCESS;
5. the owner separately authorized merge;
6. PR #37 merged to `main @ 3096d963b75478682923c20925e3eac974bbfb69`.

P6.C2 subsequently started from that merge baseline; P6.7B remains paused until P6.C1–P6.C5 close.
