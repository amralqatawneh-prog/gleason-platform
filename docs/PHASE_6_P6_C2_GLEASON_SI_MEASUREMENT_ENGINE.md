# Phase 6 · P6.C2 — Gleason SI Measurement Engine

Status: **CLOSED / VERIFIED — owner manual 6/6 PASS; final closure head `d698c88b43cd75f7925551d323c10836cac41ab8`; Release Acceptance Gates #877 SUCCESS — AWAITING SEPARATE MERGE AUTHORIZATION**

Owner instruction: **«ابدأ»**

Baseline:

`main @ 3096d963b75478682923c20925e3eac974bbfb69`

This is the merge commit of PR #37 / P6.C1.

## 1. Purpose

P6.C2 executes the measurement-profile contract approved in P6.C1.

The goal is to expose metre / kilometre / nautical-mile outputs **only where a
documented direct-SI basis or an explicit named assumption exists**.

No result may silently:
- reinterpret the unresolved Figure 43 mile;
- relabel Walter as Gleason historical;
- substitute WGS84 distance;
- calibrate video/raster profiles before P6.C3;
- normalize outputs to force agreement.

## 2. Executable SI profiles

### 2.1 Walter direct-SI profile

Profile:

`walter-flat-plane-eq-10008`

Source class:

`EXTERNAL_COMPARATIVE_MODEL`

Rule:

`E = 10008 km`

`1 NRU = 2E = 20016 km = 20,016,000 m`

For each normalized straight chord (d_{NRU}):

`d_m = d_NRU × 20,016,000`

This is direct SI inside the registered Walter comparative model. It is **not**
a Gleason-book historical result.

### 2.2 Figure 43 + Chapter XVII 6075-foot assumption

Profile:

`fig43-circle-ch17-6075ft-assumption`

The circle-derived diagnostic remains the native source value. SI conversion is
shown only under the explicit assumption that the Figure 43 mile is interpreted
as the Chapter XVII nautical/sea/Solar mile:

`1 assumed mile = 6075 ft × 0.3048 m/ft = 1851.66 m`

Evidence level:

`ASSUMPTION_PROFILE`

### 2.3 Figure 43 + Fig.37 ratio assumption

Profile:

`fig43-circle-fig37-ratio-assumption`

Assumption:

`180 nautical/geographical miles = 208 English miles`

with:

`1 English mile = 5280 × 0.3048 = 1609.344 m`

therefore the assumed nautical/geographical side of the Fig.37 ratio is:

`(208 / 180) × 1609.344 = 1859.6864 m`

This remains separate from the 6075-foot statement.

### 2.4 Figure 43 + Chapter XIX 6070-foot assumption

Profile:

`fig43-circle-ch19-6070ft-assumption`

Assumption:

`1 mile = 6070 ft × 0.3048 = 1850.136 m`

This remains separate because the historical text is not numerically identical
to the Chapter XVII 6075-foot statement.

### 2.5 Legacy radial-60 NM assumption

Profile:

`legacy-radial60-intl-nm-assumption`

The existing secondary/legacy 60-NM-per-radial-degree profile remains a legacy
comparison. P6.C2 may show SI only under the explicit display assumption:

`1 international NM = 1852 m`

It is not promoted to the preferred Gleason historical result.

## 3. Profiles that remain fail-closed

The following source profiles do not become direct SI in P6.C2:

- `gleason-book-historical`;
- `gleason-video-ruler-calibrated`;
- `gleason-raster-calibrated`;
- `gleason-fig43-circle-derived-diagnostic`.

Reasons:

- Figure 43 unit identity remains unresolved;
- video/raster fit parameters and residuals belong to P6.C3;
- diagnostic output is not silently promoted.

## 4. Runtime contract

New browser engine:

`frontend/src/measurement/gleasonSiMeasurement.ts`

New backend endpoint:

`POST /api/v1/measurement/gleason/si-route-distance`

Both return:

- source profile id;
- conversion profile id;
- source class;
- evidence level;
- explicit calculation space;
- conversion status;
- nullable explicit assumption id;
- native value/unit;
- metres;
- kilometres;
- international nautical miles for display;
- conversion basis;
- provenance;
- limitations;
- per-segment SI values.

### 4.1 Final P6.C2 output-contract decisions

The final runtime contract is version **P6.C2-1**.

Per executable profile, the normative identity/measurement fields are:

- `profile_id` and `profile_version`;
- `source_profile_id`, `source_class`, `evidence_level`;
- `calculation_space`;
- `conversion_status`;
- `assumption_id` (nullable; `null` for direct-SI profiles);
- `native_distance_value` and `native_distance_unit`;
- `distance_m`, `distance_km`, `distance_nmi`;
- `conversion_basis`, `provenance[]`, `limitations[]`;
- per-segment SI values.

Contract reconciliation decisions:

1. `profile_id` remains the primary executable conversion-profile identity.
   `assumption_id` identifies the explicit assumption source/scenario when the
   conversion is assumption-based; it is `null` for Walter direct SI.
2. `calculation_space` is explicit in every returned profile so Walter,
   Gleason-derived and legacy-comparison calculations cannot be silently
   collapsed.
3. There is no duplicate `warnings[]` field. `limitations[]` is the single
   normative warning/limitation channel; user interfaces may render those
   limitations as warnings.
4. There is no `route_revision` in the P6.C2 numerical result. The reproducible
   numerical input boundary is `input.route_id` plus the exact ordered
   `input.points` snapshot returned with the result. `OrderedRouteState.revision`
   remains UI/session state and is not a numerical input to this engine.
5. There is no duplicate generic `si_unit` field on the result profile because
   SI outputs are explicitly typed by field name (`distance_m`,
   `distance_km`, `distance_nmi`) and the provider provenance carries unit
   semantics.
6. Fail-closed source profiles remain listed in
   `unavailable_profile_ids`; an unavailable historical/calibration profile is
   never represented by a fabricated numeric zero.

These decisions reconcile the broader architecture/handoff field wishlist with
the executable P6.C2 API and prevent two parallel identity/warning/state fields
from drifting.

## 5. Browser/offline semantics

The frontend API uses backend results when available and falls back to the
independent browser implementation when offline/backend-unavailable.

The same profile ids, formulas and provenance must remain identical.

## 6. UI semantics

The Gleason Measurement Laboratory adds an SI profile section before the
historical diagnostic cards.

Each card must visibly distinguish:

- **DIRECT SI** for Walter;
- **EXPLICIT ASSUMPTION** for scenario conversions.

The unresolved direct historical Gleason → SI profile remains visibly
**FAIL CLOSED / UNRESOLVED**.

## 7. Parity and tests

Required automated coverage:

- frontend profile arithmetic;
- backend endpoint arithmetic;
- per-segment/total consistency;
- reverse-route invariance;
- antimeridian determinism inherited from the normalized base geometry;
- browser/backend parity for every executable SI profile;
- fail-closed unavailable profile list;
- bilingual UI identity/evidence labels;
- offline browser fallback.

## 8. Scope boundary

P6.C2 does **not**:
- choose a preferred empirical calibrated profile;
- compute fixture residuals;
- calibrate 8K raster/JGW;
- create local distortion diagnostics;
- add ellipsoidal-height providers;
- redesign the full map workspace;
- resume P6.7B.

Those remain:

- P6.C3 Calibration & Fixture Laboratory;
- P6.C4 Ellipsoidal Elevation Provider;
- P6.C5 Map-First Comparison Workspace;
- P6.7B paused until P6.C1–P6.C5 close.

## 9. Automated verification

Exact verified implementation head:

`e1e708ce864e97ac4dd6dc23106ecca475948080`

Release Acceptance Gates:

- **#869 — SUCCESS**;
- **#870 — SUCCESS** (authoritative verification record).

The duplicate successful run occurred because PR #38 was closed/reopened once
to refresh GitHub's stale head snapshot. Both runs executed the same exact head.

The complete gate set passed, including:
- state/source-policy validation;
- backend tests;
- frontend core tests including P6.C2 arithmetic;
- WGS84 parity;
- browser/backend Gleason parity including every executable P6.C2 SI profile;
- P6.6 polygon parity;
- production build/PWA/offline;
- browser acceptance including the new P6.C2 profile identity test;
- Docker runtime;
- live P6.C2 backend endpoint acceptance;
- PostGIS/search/offline/Redis regression gates.

Development runs #866–#868 failed before this verified head. Their causes were
fixed: TypeScript narrowing/typing and a P6.5 provenance-locator regression.
They are retained as development history and are not closure evidence.

The exact final-contract owner-test head
`b1dacada7cb84c715b71c654c7abe465d370cc0b` passed the complete Release
Acceptance Gates **#876 — SUCCESS** before manual verification.

Owner manual verification then completed **6/6 PASS — REPORTED BY OWNER** on
2026-09-22. Verified checks:

1. Walter DIRECT SI identity, external-comparative classification, calculation space and null assumption identity;
2. separate Figure 43 explicit-assumption profiles with explicit scenario ids;
3. direct Gleason historical SI remains FAIL CLOSED / UNRESOLVED and gated calibration profiles are not fabricated;
4. multi-point/live route recomputation preserves profile identity and totals;
5. backend-stop browser-local fallback preserves P6.C2 identities and outputs;
6. Arabic/mobile/provenance/limitations and WGS84/AE/P6.7A cross-slice regression remain intact.

The documentation/state closure head
`d698c88b43cd75f7925551d323c10836cac41ab8` passed the complete Release
Acceptance Gates **#877 — SUCCESS**. P6.C2 is therefore **CLOSED / VERIFIED**.
PR #38 remains draft/open/unmerged. Merge requires a separate explicit owner
authorization and the exact final recording head must itself pass the complete
gates before merge.

## 9. Acceptance path

1. implement browser/backend SI engines — **COMPLETE**;
2. pass complete Release Acceptance Gates — **#876 SUCCESS on exact owner-tested head**;
3. owner manual verification — **COMPLETE, 6/6 PASS — REPORTED BY OWNER**;
4. record owner PASS on exact tested head — **COMPLETE**;
5. final closure-state CI — **COMPLETE: #877 SUCCESS on `d698c88b43cd75f7925551d323c10836cac41ab8`**;
6. verify the exact recording head by complete gates, then merge only by separate owner authorization.

No tag, GitHub Release or deployment is created by P6.C2.
