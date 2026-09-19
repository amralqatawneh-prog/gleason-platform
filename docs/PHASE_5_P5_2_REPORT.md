# P5.2 — independent model adapters

Date: 2026-09-19. Owner confirmed Arabic city retest PASS and authorized the next
step: «تم الاختبار ونجح وظهرت اسماء المدن باللغة العربية عند البحث عليها، يمكنك الاستمرار الان الى الخطوة القادمة».
P5.1 and its reported city-search defect are closed following owner testing.
Phase 5 as a whole remains in progress; P5.3 is not included here.

## Implementation

Three separate adapters wrap the existing independent numerical providers. Each
declares model ID/version, units, semantic/evidence classification, geographic
and inverse domains, height policy, source references and limitations. Results
and metadata are immutable. A projected coordinate carries its model/version,
kind and units; inverse conversion rejects mismatches even when two models both
use metres. No pixel coordinate is accepted as the interchange contract.

| Adapter | Provider | Output | Height and boundary rules |
|---|---|---|---|
| Gleason | Existing GH-0.2.0 forward/inverse | Unit-disk x/y, normalized-radius; COMPUTED_RESULT / DERIVED | Height not represented; north-pole longitude convention 0; south boundary longitude is a display convention |
| AE | Existing AE-0.2.0 / proj4js | Independent north-polar projected x/y, metre; REFERENCE_RESULT | Height not represented; inverse restricted to provider-derived geographic disk; pole conventions explicit |
| WGS84 | Existing WGS84-0.4.0 offline proj4js ECEF provider | EPSG:4978 x/y/z, metre; REFERENCE_RESULT | Explicit ellipsoidal height required; absent height is an error, not zero; near-geocentre inverse excluded |

All adapters reject nonfinite/out-of-range inputs before calling providers.
No longitude wrapping is introduced. A planar conversion reports when supplied
height is not represented; its inverse does not invent height. Pole longitude
is not treated as a recoverable numeric round-trip invariant. Interior ECEF
positions are not a physical subterranean model and can have nonunique geodetic
interpretations; normal surface/above-surface use is the tested use case.

Existing Gleason/AE map picks now use their adapters for inverse conversion.
The WGS84 adapter is ready for the following comparison slices and is exercised
numerically; it does not change the accepted globe rendering or geodesic UI's
existing surface conventions. There is no new laboratory UI, camera linking,
marker synchronization, distance comparison or persistence in P5.2.

## Files and operations

- `frontend/src/comparison/adapters/contract.ts`: typed results/coordinates,
  metadata, validation, explicit AdapterInputError codes and immutable results.
- `gleasonAdapter.ts`, `aeAdapter.ts`, `wgs84Adapter.ts` in that directory:
  independent forward/inverse implementations. No adapter imports another engine.
- `frontend/src/map2d/ProjectionMap.tsx`: route map inverse picks through the
  selected adapter; rejected outside-disk picks leave selection unchanged.
- `frontend/tsconfig.core.json`, `frontend/tests/model-adapters.test.mjs`:
  compilation and eight new contract/numerical regression tests.
- Current handoff, roadmap, README, changelog and prior city-fix report:
  record owner retest and current slice boundaries.

## Verification and acceptance

Local PASS: 55 frontend core tests (47 prior + 8 new), TypeScript/production
build and 2 PWA tests. New tests include 147 geographic round trips across
three adapters, seven latitude bands and seven longitudes including ±180°,
plus 1083 south-pole boundary cases across every integer longitude. Documented
inverse boundary roundoff tolerances are 1e-12 normalized-radius and 1e-7 metre;
latitude correction within those tolerances is reported in result notes. Tests cover
explicit height, independent numerical anchors, domain/model/version/unit
rejection, polar conventions and immutable metadata. Geographic tolerance
1e-7 degrees; ECEF height round-trip tolerance 1e-4 metres in tested cases.

CI for this revision must additionally pass the existing independent PROJ parity,
backend, browser, Docker and real-source Arabic city gates. At report preparation,
remote CI is pending; the final check on draft PR #9 is authoritative for its
exact head. Historical city-fix CI #196 does not validate P5.2.

P5.2 coding scope: 100% implemented. Automated verification is local PASS with
remote CI pending at preparation. Owner manual regression on P5.2: NOT RUN.
No global percentage is inferred from the number of slices.

## Update and manual regression

```bash
git switch feat/phase5-shared-state
git pull --ff-only origin feat/phase5-shared-state
docker compose up --build -d
```

Open `http://127.0.0.1:8080`; allow the online PWA update to install, close old
tabs and reopen. The Arabic city update need not be repeated if already applied.

1. Click inside Gleason and AE maps: inspector coordinates remain valid and old
   searched-place identity clears. Outside-circle picks must not replace selection.
2. Search الدوحة or القاهرة, then pick a free WGS84 point and verify existing
   reference selection and A/B calculation still work.
3. Repeat the map-pick/search regression offline after caching and in AR/EN.

This is an internal contract slice, so a new synchronized view is not expected.
Next planned delivery is P5.3 search/pick/marker synchronization with one event
per selection and no feedback loops. Model Laboratory remains P5.4.

## Sources

`PHASE_5_PLAN.md`, `ROADMAP_CURRENT.md`, `PROJECT_HANDOFF_CURRENT.md`,
`frontend/src/models/gleason.ts`, `frontend/src/models/ae.ts`,
`frontend/src/reference/offlineWgs84.ts`, `frontend/src/models/projectionTypes.ts`,
`data/sources/gleason-book.yaml` and the existing PROJ parity gate
`scripts/check_reference_parity.py`. No new historical interpretation, source
dataset or dependency is added in this slice.
