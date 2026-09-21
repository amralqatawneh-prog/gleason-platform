# Gleason Platform — Current Project Handoff

_Last updated: 2026-09-22_

## Purpose

This document is the canonical continuity handoff for the Gleason Platform project. It records the agreed roadmap, implementation rules, completed phases, accepted Phase 5 baseline, validation evidence, known boundaries, and the next permitted steps.

## Repository and working branch

- Repository: `amralqatawneh-prog/gleason-platform`.
- Current integration base: `main @ 1c64285b92c093365b74f3256aa9557b9a48268e` (PR #30 merge).
- Current integration baseline: `main @ 6a2666112e56514051ea62fbe1c25f5a8016f1ae` — PR **#31** merged after exact final head `1d84ba85ba21d320a0de0ed16d87006c5ef80c84` passed Release Acceptance Gates **#784 — SUCCESS**.
- PR **#21**: **MERGED** into `main` with explicit owner authorization on 2026-09-21.
- PR #21 final head: `ced5649c3c2d6e1c8e1d96af35fb0775637719a3`; pre-merge Release Acceptance Gates **#668 — SUCCESS**.
- PR #21 merge commit / current integration baseline: `11b571f08f72732b509f049f1a2ab1be92292938`.
- Post-merge Release Acceptance Gates **#669 — SUCCESS** on that exact `main` baseline.
- PR **#20**: **MERGED** into `main` with explicit owner authorization on 2026-09-20 at `35fda15508973340669220a20ee1c5bf6bbaa39a`; post-merge CI #651 SUCCESS.
- PR **#19**: **MERGED** into `main` at `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`; CI #643 SUCCESS.
- PR **#18**: **MERGED** into `main` at `645a27c5ea92febd78c3bdd823281ff496a742b3`; CI #561 SUCCESS.
- PR **#17**: **MERGED** into `main` at `660a7908dd9e3c2f073155a5394d5dfb60ee67e8`; CI #558 SUCCESS.
- PR **#16**: **MERGED** into `main` at `c1d72e1d1536cf1aba9376e4ada76b7fc31056f5`; CI #554 SUCCESS.
- PR **#15**: **MERGED** into `main` with explicit owner authorization on 2026-09-20 at `143532248f707380b980e787051e7decc3c91086`; CI #530 SUCCESS.
- PR **#14**: **MERGED** into `main` at `3e5afcd9b95766bd18af59df88c9154f51567e8c`; CI #517 SUCCESS.
- PR **#13**: **MERGED** at `913ec67c195ac5971e0f63d9acfe94dba8de60bf`; its final accepted head `9d6dbbc3cbf2756d59cc0d1bd9d3fbe1f3483e8c` passed CI #514 and its post-merge `main` passed CI #515.
- PR **#9**: **MERGED** into `main` with explicit owner authorization on 2026-09-19 at `97f043174b07cef9884075b1c37a4e4394f6f8bb`.
- PR #11 (P5.8): **MERGED** into `main` at `7d490d6bf207a1d919cb01f5f99ac8a7275f0fd4`.
- PR #12: **CLOSED / SUPERSEDED / NOT MERGED**.
- Accepted Phase 4 baseline: `1e46b8c38a5834f56d3ed70d8a396e8902e3efe3`.
- Accepted application version: **v0.5.0**.
- Implementation phase: **6**; accepted phase: **5**; phase status: **in_progress**.
- PR **#22** Post-PR21 reconciliation: **MERGED**; final head `a76fcff0ac7ad366143645ad722ff5d91183561e` passed Release Acceptance Gates **#671 — SUCCESS** before merge.
- Roadmap amendment branch: `docs/roadmap-architecture-amendment-2026-09-21`; amendment **CLOSED**. Initial verification head `cb4b4681bd359e29b08542856b7bff144a239796` passed CI **#673**, and exact final head `c73ca4cdd41b2e3cd745df5412be30a44d2bda9c` passed CI **#676**.
- PR **#23**: **MERGED** with explicit owner authorization at `de2cf9b0a8a48a788323373eb2b9c72622c288f8` on 2026-09-20T22:39:36Z. No independently verified post-merge push-run number is recorded.
- Post-PR23 reconciliation branch: `docs/post-pr23-merge-reconciliation`; **CLOSED + MERGED** through PR #24. Exact final head `2c3b12ceabdf374d587c96f49f23d097de8d8d1d` passed Release Acceptance Gates **#684 — SUCCESS** and merged at `fc42af3cd97706ddc3f92b44f7e784ba86fc7536`.
- Owner-approved roadmap amendment: `docs/ROADMAP_ARCHITECTURE_AMENDMENT_2026-09-21.md`.
- Owner-approved astronomy roadmap addendum: `docs/ROADMAP_ASTRONOMY_ARCHITECTURE_AMENDMENT_2026-09-21.md` — **CLOSED / VERIFIED + MERGED** through PR #27. Exact final head `8d84c2e83a148a359fd0d75da7e5f3b21570ac22` passed Release Acceptance Gates **#726 — SUCCESS** before merge; merge commit `5442852ef4bc2e760db39743d0bc7b3bc57d0b11`. P6.6 remains NOT STARTED.
- Comparative astronomy planning source registry: `data/sources/astronomy-comparative-sources.yaml`.
- Historical post-PR27 reconciliation: `docs/POST_PR27_MERGE_RECONCILIATION_2026-09-21.md`.
- Post-PR27 reconciliation: **CLOSED + MERGED** through PR #28. Initial verification head `018e6a7984dcf682e94f36668333ea00ccbaf085` passed Release Acceptance Gates **#738 — SUCCESS**; exact final head `8f6b69c90148e0c5e9200ebab2dfab88ed0f5789` passed **#744 — SUCCESS**; merge commit `a96f47b95c542c2eafb21771bc7c53e7ab40d170`. No post-merge run is claimed without independent observation.
- Historical post-PR28 reconciliation: `docs/POST_PR28_MERGE_RECONCILIATION_2026-09-21.md`.
- Post-PR28 reconciliation: **CLOSED + MERGED** through PR #29. Initial verification head `3e23d2074a65ce6422e378b7a62211627157c968` passed Release Acceptance Gates **#753 — SUCCESS**; exact final head `7751e76c1d3fe3e8c129436717042a49040ead4b` passed **#754 — SUCCESS**; merge commit `8ac38042050f24c0ec30e30b32d37cd1900abf92`. No post-merge run is claimed without independent observation.
- Historical post-PR29 reconciliation: `docs/POST_PR29_MERGE_RECONCILIATION_2026-09-21.md`; **CLOSED + MERGED** through PR #30. Initial head `0ccd24dbbc665c81dfa8cddec82ffde4ca9ef448` passed **#758 — SUCCESS**; exact final head `14c69a8cb1aaae2b375803e6400efe24aa83fd03` passed **#759 — SUCCESS**; merge commit `1c64285b92c093365b74f3256aa9557b9a48268e`. No post-merge CI result is claimed without independent observation.
- P6.6 is **CLOSED / VERIFIED / MERGED**. Corrected-contract owner-tested head `e96712975fc9f54f2615e235bb6976136efe8a2d` passed #783 before owner manual **6/6 PASS**; final closure head `1d84ba85ba21d320a0de0ed16d87006c5ef80c84` passed #784; PR #31 merged at `6a2666112e56514051ea62fbe1c25f5a8016f1ae`.
- Historical post-PR25 reconciliation: `docs/POST_PR25_MERGE_RECONCILIATION_2026-09-21.md`.
- Historical post-PR23 reconciliation: `docs/POST_PR23_MERGE_RECONCILIATION_2026-09-21.md`.
- PR **#25**: **MERGED** into `main` with explicit owner authorization on 2026-09-21.
- PR **#26**: **MERGED** into `main` with explicit owner authorization; final head `24aba98192483dc8fc3d60cacbb8eac96f0fa5aa`, Release Acceptance Gates **#718 — SUCCESS**, merge commit `6bbfe92e8a4c0b66415eb888598cace5b7b15102`.
- PR **#27**: **MERGED** into `main` with explicit owner authorization; final head `8d84c2e83a148a359fd0d75da7e5f3b21570ac22`, Release Acceptance Gates **#726 — SUCCESS**, merge commit `5442852ef4bc2e760db39743d0bc7b3bc57d0b11`.
- PR **#28**: **MERGED / CLOSED**; final head `8f6b69c90148e0c5e9200ebab2dfab88ed0f5789`, final pre-merge Release Acceptance Gates **#744 — SUCCESS**, merge commit `a96f47b95c542c2eafb21771bc7c53e7ab40d170`. Post-merge workflow result: **not independently observed**.
- PR **#29**: **MERGED / CLOSED**; initial verification head `3e23d2074a65ce6422e378b7a62211627157c968` / **#753 — SUCCESS**; final head `7751e76c1d3fe3e8c129436717042a49040ead4b` / **#754 — SUCCESS**; merge commit `8ac38042050f24c0ec30e30b32d37cd1900abf92`. Post-merge workflow result: **not independently observed**.
- PR **#30**: **MERGED / CLOSED**; initial verification head `0ccd24dbbc665c81dfa8cddec82ffde4ca9ef448` / **#758 — SUCCESS**; final head `14c69a8cb1aaae2b375803e6400efe24aa83fd03` / **#759 — SUCCESS**; merge commit `1c64285b92c093365b74f3256aa9557b9a48268e`. Post-merge workflow result: **not independently observed**.
- PR #25 final head: `03a04679cfa4955340fa91f5f9d75aeeb268b0d7`; pre-merge Release Acceptance Gates **#699 — SUCCESS**.
- PR #25 merge commit / current integration baseline: `bdff76e765c78108e96fd0e644df850be22f8eed`.
- Post-merge push-run: **not independently observed through the available workflow view**; no run number/conclusion is fabricated.
- Latest closed slice: **P6.6 — Polygon / Perimeter / Area**, corrected contract owner manual **6/6 PASS — REPORTED BY OWNER** on `e96712975fc9f54f2615e235bb6976136efe8a2d`; pre-manual Release Acceptance Gates **#783 — SUCCESS**; final closure CI pending on the closure-state head.
- P6.6 is **CLOSED** after Release Acceptance Gates **#769 — SUCCESS** on owner-tested head `4cb8c04b40fbea35745f4091a4bf5e849c34b299` and **6/6 manual checks PASS — REPORTED BY OWNER**. Closure report: `docs/PHASE_6_P6_6_REPORT.md`. PR #31 remains open/unmerged; P6.7A remains **NOT STARTED**.
- P6.1 automated evidence: Release Acceptance Gates **#519/#520/#529 — SUCCESS**.
- P6.1 owner manual verification: **5/5 PASS — REPORTED BY OWNER**.
- P6.2 automated evidence: Release Acceptance Gates **#532/#546 — SUCCESS**.
- P6.2 owner manual verification: **6/6 PASS — REPORTED BY OWNER**.
- P6.2 direct-map / >3-points refinement retest: **PASS — REPORTED BY OWNER**.
- P6.2 supports a transient ordered route of up to **50 points**, plus an explicit direct-map add mode for short picks on Gleason, AE and WGS84; normal map picking remains selection-only while that mode is off.
- P6.3 — WGS84 Ruler / Distance is **CLOSED**. Base manual checklist 6/6 PASS; route-guide refinement 5/5 PASS; straight-line refinement 4/4 PASS; Pan/Great Circle refinement 6/6 PASS — all REPORTED BY OWNER.
- P6.3 start baseline: `main @ 645a27c5ea92febd78c3bdd823281ff496a742b3`; CI #561 SUCCESS.
- P6.3 final pre-refinement implementation head: `06f2397f63648d879d6271064f3297608a59c333`; Release Acceptance Gates **#565 — SUCCESS**; **20/20 browser acceptance tests PASS**.
- P6.3 owner manual verification: **6/6 PASS — REPORTED BY OWNER**; backend-stop browser-local GeographicLib fallback also **PASS — REPORTED BY OWNER**.
- CI #572: **SUCCESS** on the documentation head tested before the visual refinement.
- First route-guide refinement head `483b123277f62e219937298b4fb7ca104809d420` passed CI #587; current pre-retest head `df9227a831e4b90940cea70dde902f64684a0bf4` passed CI #595; owner reported targeted route-guide retest 5/5 PASS and repeated backend-stop line/fallback PASS.
- P6.3 final closure head `c775aac8a97a6782915782ed2118c3018cfe5a1a` passed Release Acceptance Gates **#642 — SUCCESS**.
- PR #19 merged to `main` at `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`; post-merge Release Acceptance Gates **#643 — SUCCESS**.
- Gleason/AE route-guide segments remain exact straight projected chords; flat models support mouse/touch pan; WGS84 guide remains a display-only Great Circle reference; numeric distance remains `wgs84-geodesic`; P6.7 remains NOT STARTED.
- PR #16, PR #19, PR #20, PR #24, PR #25 and PR #30 are **MERGED**. P6.2–P6.6 are CLOSED. PR #31 is open/unmerged. No tag, GitHub Release or deployment has been created. P6.7A remains **NOT STARTED**.
- Phase 5 started by explicit owner instruction on 2026-09-19. **P5.1–P5.9 are CLOSED** after their recorded automated evidence and owner-reported manual PASS.
- **P5.9 owner manual regression: PASS — REPORTED BY OWNER (10/10 checks)** on the clean P5.9 branch after clean-head CI #487 SUCCESS.
- **Phase 5 is ACCEPTED BY OWNER** by explicit decision «أعتمد المرحلة الخامسة» on 2026-09-20.
- **Phase 6 is IN PROGRESS**. P6.1–P6.6 are CLOSED; P6.7A remains NOT STARTED.
- Current Phase 5 report: `docs/PHASE_5_P5_9_REPORT.md`.
- Formal Phase 5 acceptance record: `docs/PHASE_5_ACCEPTANCE.md`.
- Canonical Phase 5 plan: `docs/PHASE_5_PLAN.md`.
- Canonical Phase 6 plan: `docs/PHASE_6_PLAN.md`.
- Canonical future roadmap: `docs/ROADMAP_CURRENT.md`.
- GitHub/documentation/data audit: `docs/GITHUB_SYNC_AUDIT_2026-09-19.md`.
- Post-PR16 reconciliation: `docs/POST_PR16_MERGE_RECONCILIATION_2026-09-20.md`.
- Post-PR17 GitHub state sync: `docs/POST_PR17_GITHUB_SYNC_2026-09-20.md`.
- Closed P6.3 report: `docs/PHASE_6_P6_3_REPORT.md`.
- Closed P6.4 report: `docs/PHASE_6_P6_4_REPORT.md`.
- Closed P6.6 report: `docs/PHASE_6_P6_6_REPORT.md`.
- Post-PR19 reconciliation: `docs/POST_PR19_MERGE_RECONCILIATION_2026-09-20.md`.
- Post-PR21 reconciliation: `docs/POST_PR21_MERGE_RECONCILIATION_2026-09-21.md`.
- Approved roadmap/architecture amendment: `docs/ROADMAP_ARCHITECTURE_AMENDMENT_2026-09-21.md`.
- Shared future contracts: `docs/SHARED_CONTEXT_PROVIDER_CONTRACTS.md`.
- Living documentation: `docs/DEVELOPER_GUIDE.md`, `docs/USER_GUIDE.md`, `docs/CALCULATION_REFERENCE.md`.

Historical Phase 4 commits, PR #8, CI runs and correction evidence remain below as
chronological evidence. They do not override this current snapshot.

## Documentation chronology note

This file contains historical phase/slice evidence below. Statements such as
“next”, “pending”, or “not started” inside an older dated subsection describe
the project **at that historical moment**. The current snapshot above and the
latest dated acceptance closure take precedence for current execution status.
Historical reports are preserved rather than rewritten.

## Project architecture agreed with owner

The platform is a web-first, PWA, offline-first comparative geospatial platform with three strictly independent model engines:

1. **Gleason Historical Model**
   - Source-faithful historical reconstruction.
   - Claims/rules classified as DOCUMENTED / DERIVED / ASSUMED / DISPLAY_CONVENTION / REFERENCE.
   - Historical claims must never be silently presented as modern scientific facts.

2. **AE Visualization Model**
   - Independent modern Azimuthal Equidistant visualization.
   - Must not be automatically attributed to Gleason.

3. **WGS84 Reference Model**
   - Modern geodetic reference model.
   - Numeric outputs are `REFERENCE_RESULT`.
   - Backend calculations are authoritative; rendering is only visualization.

Canonical WGS84 geographic coordinates are the shared geographic state for later synchronization work. Pixel coordinates are never used as the cross-model synchronization contract.

Semantic separation:
- `SOURCE_TEXT`
- `SOURCE_CLAIM`
- `COMPUTED_RESULT`
- `REFERENCE_RESULT`

## Phase 6 start — 2026-09-20

The owner explicitly instructed: **«ابدأ بتنفيذ Phase 6»**.

Execution begins from `main @ 3e5afcd9b95766bd18af59df88c9154f51567e8c`
after Release Acceptance Gates #517 SUCCESS. The accepted application version
remains v0.5.0 and accepted phase remains 5 while implementation phase becomes
6 / in_progress.

P6.1 is now CLOSED. It defined explicit endpoints, method/model/unit/scale
identity and cross-model visualization identity without enabling route drawing,
numeric ruler/distance/perimeter/area, or durable route persistence.

## P6.2 start — 2026-09-20

After PR #15 merged to `main` at
`143532248f707380b980e787051e7decc3c91086` and post-merge CI #530 SUCCESS,
the owner instructed **«اكمل»**.

P6.2 is limited to transient ordered geographic route state:
A→B→C…, explicit point/segment identities, add/remove/reorder/undo/clear, and
bilingual responsive UI. It does not calculate multi-stop distance, perimeter,
area, road/flight routing or persist routes. Those remain later slices.

## Owner-approved 2026-09-21 roadmap expansion

The owner approved the formal addition of: solar/lunar analemmas; ObserverContext with device/current location and map-pin sources; virtual observer dome; eclipse top/observer views; high-detail global streets/cities/buildings; accurate visual/numerical day/night and twilight events; an Aviation Laboratory; OSIRIS-inspired provider architecture; and RouteProvider turn-by-turn routing. These are scheduled future capabilities, not claims of current implementation.

The amendment also makes living developer/user/calculation documentation a continuous acceptance requirement. Future code comments explain non-obvious **why/assumptions/invariants**, not every obvious line.

## Governance and execution rules

The owner explicitly requires:

- Execute one phase/slice at a time.
- Do not jump ahead.
- Do not start the next phase until the current phase is technically closed and, where required, explicitly accepted by the owner.
- Every phase/slice includes:
  - implementation summary,
  - files/functions changed,
  - run/update instructions,
  - automated test results,
  - manual test checklist/results,
  - known issues/limitations,
  - status and completion percentage,
  - acceptance criteria.
- Never fabricate PASS/FAIL.
- Mocks are allowed only when explicitly labeled.
- Every release-relevant change should have:
  - changelog update,
  - clear Git commit,
  - test report,
  - documentation update.
- Manual checks that are not performed are `NOT RUN`. Use `WAIVED BY OWNER` only when the owner explicitly waives that particular check; never infer a waiver or PASS.
- Phase 4 is accepted. The explicit 2026-09-19 instruction starts Phase 5; continue one slice at a time. It does not authorize Phase 6, PR merges, tags or releases.

## Gleason source rules and verified historical basis

Primary source reviewed:
- `Alex Gleason - Is the Bible From Heaven.pdf`
- 432 PDF pages.
- Second Edition revised/enlarged.
- Copyright 1890; rewritten/revised/enlarged 1893.
- SHA-256:
  `03e429285376c7fcd21659116f43a8da7d6e363169e7c7841c9b31518effbe60`

Important verified source notes:
- Ch. XIII–XIX cover geodetic arguments, sun motion, distance, longitude, time, navigation, eclipses, rivers.
- Ch. XVII describes “A New Circular Map of the World, and Longitude and Time Calculator.”
- PDF p.377 describes the 14¼-inch circle, 24-hour dial, and detached radiating arms marked with latitude degrees.
- PDF p.429 / Fig.43 states the historical longitude-line divergence claim.
- The current computational formula for historical longitude-degree miles is a DERIVED reconstruction:
  `60 - (2/3) * latitude`
  and must not be represented as WGS84.
- PDF p.360 / Fig.30 explicitly says exactness is not claimed for the illustrated sun spiral.
- The current Gleason forward/inverse provider is a DERIVED computational reconstruction; do not claim the book prints a modern analytic projection formula.

## Phase history

### Phase 0 — ACCEPTED ✅

Project framing, source policy, semantic categories, roadmap, and acceptance discipline established.

### Phase 1 — ACCEPTED ✅

Delivered:
- monorepo skeleton,
- FastAPI + React/Vite,
- responsive RTL/LTR,
- PWA manifest/service worker app shell,
- IndexedDB abstraction and offline pack manifest,
- Capacitor Android/iOS,
- Docker/config/logging/CI/tests,
- capability detection,
- WebGL/3D fallback shell.

Canonical normalized structure enforced by CI.

### Phase 2 — ACCEPTED ✅

Final accepted release line: v0.2.0.

Delivered:
- Gleason historical projection engine,
- independent AE engine,
- independent OpenLayers maps,
- source viewer,
- affine georeferencing baseline,
- source catalog,
- core-world offline map,
- projection APIs/tests,
- source-faithful metadata.

Explicitly deferred:
- WGS84 globe to Phase 4,
- synchronization to Phase 5.

### Phase 3 — ACCEPTED ✅

Final accepted version: v0.3.0.

Delivered:
- PostGIS/pg_trgm place catalog,
- unified search,
- offline search index and regional packs,
- production-source lock and SHA-256 validation,
- Natural Earth + OurAirports import pipeline,
- country/city/sea/ocean/river/mountain/airport taxonomy,
- Arabic/English search,
- offline core-world search pack,
- country/regional packs,
- canonical place IDs and provenance.

Locked source category counts enforced in CI:
- country 177
- city 243
- sea 16
- ocean 7
- river 12
- mountain 632
- airport 86,089

Owner manual Phase 3 acceptance passed.

## Phase 4 — WGS84 Reference Model

Overall Phase 4 status:
**ACCEPTED BY OWNER — P4.1–P4.7 and corrections M1–M6 complete. Automated gates PASS; the owner reported all corrected-build manual checks PASS and explicitly accepted Phase 4 on 2026-09-18. Application version: v0.4.0.**

## Owner approval — 2026-09-18

The owner approved all eight audit proposals: «نعم موافق، وموافق على المقترحات».
This authorizes M1–M6 implementation, M7 roadmap reconciliation and M8 future backlog planning. It does not constitute Phase 4 acceptance, release/merge authorization or permission to start Phase 5.

The owner subsequently answered «نعم اسمح» to the specific request to upload the seven commits to this repository/branch and run CI without merge or release. This upload is complete. See the correction report for the original/uploaded commit mapping and exact CI evidence.

See `docs/APPROVED_CORRECTIONS_2026-09-18.md` for scope, progress and validation. Previous manual PASS records below refer to the historical implementation, not to the corrected revision.

### Historical Phase 4 acceptance and Phase 5 hold (superseded by explicit start)

The owner subsequently stated:

> قمت بالاختبار ونجحت كل الاختبارات، يمكنك اعتماد المرحلة الرابعة، وتوثيق ذلك، ولا تبدأ بالمرحلة الخامسة حتى اخبرك

This is explicit Phase 4 acceptance after owner-reported successful testing. Record manual results as **PASS — REPORTED BY OWNER**; device/browser details were not supplied. The authoritative record is `docs/PHASE_4_ACCEPTANCE.md`. Phase 5 was **NOT STARTED / ON HOLD** at acceptance; the owner explicitly lifted this hold on 2026-09-19: «ابدأ المرحله الخامسة». No merge, tag or GitHub Release is implied by this acceptance.

### P4.1 — COMPLETE ✅

WGS84 provider foundation.

Delivered:
- `WGS84GeodeticPoint`
- `ECEFPoint`
- geodetic ↔ ECEF
- geodesic inverse
- explicit longitude normalization function
- provenance metadata
- `REFERENCE_RESULT` semantics

Reference identifiers:
- geographic CRS: EPSG:4979
- ECEF CRS: EPSG:4978
- frame: WGS 84
- provider/model: `wgs84-reference`
- version: `WGS84-0.4.0`

Important rule:
- ellipsoidal height is not orthometric/geoid/mean-sea-level height.
- backend authoritative API does not silently normalize out-of-domain longitude.

### P4.2 — COMPLETE ✅

Reference API delivered:
- `GET /api/v1/models/reference/wgs84`
- `POST /api/v1/reference/wgs84/geodetic-to-ecef`
- `POST /api/v1/reference/wgs84/ecef-to-geodetic`
- `POST /api/v1/reference/wgs84/geodesic-inverse`

Invalid latitude/longitude returns explicit validation error.

### P4.3 — COMPLETE ✅

WGS84 globe and 2D fallback.

Delivered:
- interactive WebGL2 WGS84 ellipsoid,
- drag rotation,
- click-to-coordinate selection,
- automatic 2D fallback,
- responsive UI,
- Arabic/English,
- `REFERENCE_RESULT` labeling.

Manual PASS:
- WebGL2 mode,
- drag,
- click,
- mobile-size layout,
- WebGL-disabled fallback,
- 2D click.

### P4.4 — COMPLETE ✅

Phase 3 place integration.

Delivered:
- canonical Phase 3 place selection shown on WGS84 view,
- same canonical place ID, category, country, source, online/offline state,
- focus marker in 3D and 2D,
- corrected globe orientation,
- corrected CORS for localhost/127.0.0.1.

Manual PASS:
- Qatar
- Doha
- DOH
- globe orientation
- API connectivity

No Phase 5 synchronization was introduced.

### P4.5 — COMPLETE ✅

WGS84 Geodesic Inspector.

Historical P4.5 used backend WGS84 geodesic inverse. Approved M2 adds an independent GeographicLib JS offline engine, tested against backend PROJ; it is not a spherical approximation.

Delivered:
- capture A/B,
- backend calculation,
- distance,
- initial bearing,
- final arrival forward bearing,
- reverse endpoint-to-start bearing,
- null bearing for identical point,
- provenance,
- Arabic/English,
- `REFERENCE_RESULT`.

Manual PASS:
- Doha → Doha = 0 distance and no fake bearings.
- Doha → Amman returned valid reference geodesic values.

### P4.6 — COMPLETE ✅

Offline/persistence + detailed globe layers.

Delivered:
- IndexedDB-persisted layer visibility,
- country boundaries,
- Phase 3 cached oceans/seas/rivers/cities,
- saved regional airports,
- continent/country/marine/city/airport labels,
- front-hemisphere label filtering,
- label collision suppression,
- responsive label sizing,
- 2D fallback layer rendering,
- corrected east/west globe orientation,
- source/identity preservation.

Important agreed behavior:
- airports remain optional and regional/offline-pack based; do not load all ~86k airports globally by default.
- continent label anchors are `DISPLAY_CONVENTION`, not authoritative source coordinates.

Owner manual PASS:
- country/continent orientation,
- layer toggles,
- persistence,
- seas/oceans/rivers/cities,
- saved regional airports,
- labels,
- hidden rear labels,
- label sizing,
- overlap suppression,
- Arabic/English,
- 2D fallback,
- offline behavior.

Final P4.6 closure CI: run #158 SUCCESS.

### P4.7 — COMPLETE ✅ technically

Validation / release hardening.

Added/verified:
- geodetic/ECEF anchors,
- round-trip tolerances,
- antimeridian handling,
- near-antimeridian round trip,
- poles/equator,
- identical-point geodesic,
- invalid coordinate rejection,
- provenance completeness,
- frontend reference-globe tests,
- Phase 2/3 regressions,
- npm high-severity security audit,
- production build,
- service-worker syntax,
- PWA cache rotation,
- Docker Compose runtime,
- PostGIS/pg_trgm,
- Redis,
- real production-source imports,
- real search regression,
- offline pack generation.

Historical P4.7 cache namespace: `gleason-shell-v0.4.0-rc1`.
Approved M2 replaces it with `gleason-shell-v{accepted app version}-{content hash}` and precaches compiled assets.

Final interaction request from owner:
- horizontal globe drag direction was inverted.
- New behavior:
  - drag pointer right → globe moves left,
  - drag pointer left → globe moves right.
- Vertical behavior unchanged.
- Click-to-select preserved.
- Automated regression test added.
- Owner manual test: PASS.

Historical P4.7 closure CI:
- run #177
- final conclusion: SUCCESS
- initial attempt failed only because Docker Hub token/image metadata requests reset/EOF; retry succeeded.
- frontend/backend/security/build checks were already green before the transient Docker failure.

## Current acceptance state

Historical slice state (new correction evidence is separate):
- P4.1 COMPLETE ✅
- P4.2 COMPLETE ✅
- P4.3 COMPLETE ✅
- P4.4 COMPLETE ✅
- P4.5 COMPLETE ✅
- P4.6 COMPLETE ✅
- P4.7 COMPLETE ✅

Overall:
- Phase 4: **COMPLETE AND ACCEPTED BY OWNER**, including M1–M6 corrections; manual checklist **PASS — REPORTED BY OWNER**.
- Accepted application version: **v0.4.0**. This is version metadata, not a claim that a GitHub Release/tag exists.
- Phase 5: **IN PROGRESS — P5.1 through P5.9 CLOSED; awaiting separate full Phase 5 owner acceptance**. Full Phase 5 owner acceptance has not occurred.

## Required next steps

1. Keep P5.1–P5.9 and Phase 5 acceptance closed unless a concrete regression or source error is found.
2. Treat `913ec67c195ac5971e0f63d9acfe94dba8de60bf` plus post-merge CI #515 SUCCESS as the accepted `main` baseline for the next functional work.
3. Phase 6 route drawing, multi-stop state, ruler, distance, perimeter and area remain **NOT STARTED** until the owner explicitly starts Phase 6.
4. Do not create a tag, GitHub Release or deployment without separate authorization.
5. Preserve Phase 5 source/model boundaries and use locked source manifests; never fabricate historical scan control points, coordinates, ellipsoidal height, scale conversions, or provenance.
6. When Phase 6 is explicitly started, begin from the accepted Phase 5 baseline and define measurement semantics before drawing routes or reporting distance/area.

## Local Windows / Git Bash workflow

The following commands retrieve the Phase 5 development branch, including for a checkout previously configured to fetch only Phase 4:

```bash
git remote set-branches --add origin feat/phase5-shared-state
git fetch origin
git switch feat/phase5-shared-state
git pull --ff-only origin feat/phase5-shared-state
docker compose up --build -d
docker compose ps
```

Open:
`http://127.0.0.1:8080`

Let the online build install its service-worker update, close all existing app tabs/windows, then reopen. The worker intentionally waits for old clients to close; a hard refresh alone does not guarantee activation. Complete installation before the offline checklist.

Important:
- Do NOT run `docker compose down -v` locally unless the owner explicitly intends to delete local Docker volumes/data.
- Git Bash/MSYS may rewrite container absolute paths. For Docker commands using absolute container paths, use `MSYS_NO_PATHCONV=1` where needed.

WebGL-disabled Chrome fallback test:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --disable-webgl --user-data-dir="$TEMP/gleason-no-webgl" http://127.0.0.1:8080
```

## Non-negotiable implementation rules

- No fabricated source claims.
- No fabricated georeferencing control points.
- No invented geometry.
- No fake PASS/FAIL.
- No hidden cross-model normalization.
- No historical claim promoted to modern reference truth.
- Backend reference calculations remain authoritative.
- Visualization is not a substitute for geodetic computation.
- Source provenance remains visible and separate from computed/reference provenance.
- One phase/slice at a time.

P5.3 review update (2026-09-19): owner reports correct shared readings but missing projection markers and requests a non-hollow globe. Current correction is documented in `PHASE_5_P5_3_VISUAL_FIX.md`: isolate OpenLayers pixel layout from RTL and add an opaque ellipsoid surface. At that review P5.3 was not accepted; the later acceptance closure below supersedes this status. Satellite imagery/terrain are not included.

## P5.3 acceptance closure — 2026-09-19

Owner reported «نجحت الاختبارات كلها» after the marker/opaque-surface correction.
Manual result: **PASS — REPORTED BY OWNER**; device/browser/local checkout SHA
were not supplied. P5.3 is closed, including both reported visual issues.
Implementation evidence: commit `3ca3989868b6bcc42e8f1aae8d09f035b1c7a98e`,
[CI #204 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35441426643),
including 58 core tests and 10 Chromium scenarios. This is evidence for that
implementation revision, not a claim of a new test run for this documentation.
P5.4 was the next implementation slice at this closure point; it is now in progress under the later owner start instruction. Full Phase 5 acceptance is pending;
accepted application version stays 0.4.0. No merge, tag or release.

The owner also requested navigation controls, multi-stop paths and distance/area
measurement, then instructed «اكمل». Scheduling and acceptance requirements are
recorded in `NAVIGATION_MEASUREMENT_REQUIREMENTS.md`; those tools are not yet
implemented by this documentation update.


## P5.4 start update — 2026-09-19

After reviewing the current project handoff, the owner explicitly instructed
«ابدأ». P5.4 Basic Model Laboratory is now the active slice. It exposes each
adapter's same canonical geographic input, model/version, output, units,
semantic/evidence classification, source, notes and limitations, while reporting
missing/unsupported operations explicitly. It does not implement P5.5 numeric
comparability, P5.6 navigation tools or Phase 6 measurement tools.

Implementation/report: `docs/PHASE_5_P5_4_REPORT.md`. P5.3 remains accepted;
the accepted application version remains 0.4.0; no merge, tag or release is
authorized by this instruction.


## P5.4 usability refinement — 2026-09-19

The owner reported all initial P5.4 functional tests PASS, but also reported
that the Model Laboratory's results were not understandable or useful in their
technical-first presentation. This means the functional mechanics passed while
the P5.4 comprehension acceptance criterion remained unmet, so P5.4 is still
open.

The owner approved a same-slice UX correction. The laboratory now leads with a
plain-language explanation of what each model result means and explicitly states
that the displayed X/Y(/Z) values are model coordinates rather than a generic
distance between places. Existing technical provenance is retained under a
collapsed advanced-details control. Calculations and P5.2 adapter contracts are
unchanged. WGS84 still refuses ECEF when ellipsoidal height is missing and does
not fabricate 0 m.

Next action: validate the refined branch by CI, then ask the owner to retest
understanding/clarity. Do not begin P5.5 until P5.4 is explicitly closed.


## P5.4 acceptance closure — 2026-09-19

The initial P5.4 functional manual checklist passed, but the owner reported that
the technical-first Model Laboratory output was not understandable enough to be
useful. The owner approved a same-slice UX refinement that added plain-language
meaning for Gleason, AE and WGS84 while retaining technical model/version/unit/
source/limitation details under an expandable control. No calculation, adapter
contract, dependency or dataset changed.

After retesting the refinement, the owner reported «القسم اصبح واضحا، اكمل
التوثيق». Final manual result: **PASS — REPORTED BY OWNER**.

Exact refined implementation head:
`29fa6190185ec7901c14f586ad26213337190272`.

Automated evidence:
[Release Acceptance Gates #236 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35458166222),
successful on attempt 6 after transient npm registry 400 errors had blocked the
audit endpoint on earlier attempts. The successful attempt found 0 npm
vulnerabilities, ran 62 frontend core tests, 2 PWA tests and 11 Chromium
acceptance scenarios, and completed numerical parity, production build,
Docker/PostGIS/Redis, locked-source and search gates.

P5.4 is **CLOSED**. P5.5 Comparability Contract is next and **NOT STARTED**.
Full Phase 5 acceptance remains pending. Accepted application version remains
0.4.0. Draft PR #9 remains open/unmerged. No merge, tag or release.


## P5.5 start — 2026-09-19

Following P5.4 closure, the owner instructed «أكمل». P5.5 Comparability Contract
is now active. Its scope is limited to deciding whether quantities are
structurally comparable, with explicit reasons for rejection or unavailable
output.

Non-negotiable P5.5 rules:
- matching numeric appearance is not evidence of comparability;
- matching unit text alone is not sufficient;
- quantity meaning/dimensionality and coordinate/reference space must match;
- Gleason `normalized-radius` is never silently converted to metre/kilometre;
- missing output remains missing rather than receiving fabricated inputs;
- no numeric difference is computed in P5.5; that belongs to P5.7 after a valid
  comparability decision.

Report: `docs/PHASE_5_P5_5_REPORT.md`. P5.6 and Phase 6 are not started. Draft
PR #9 remains unmerged; no tag or release.


## P5.5 automated verification update — 2026-09-19

P5.5 Comparability Contract implementation head
`1bf01cda0a1b4273b14f7d1c06a844021e575648` passed
[CI #266](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35459843476).
The successful run reported 0 npm vulnerabilities, 67 frontend core tests,
2 PWA tests and 12 Chromium scenarios, with all parity/build/Docker/PostGIS/
Redis/source/search gates green.

P5.5 is **CLOSED** after owner-reported PASS. P5.6 is next and remains NOT STARTED. No merge, tag or release.


## P5.5 acceptance closure — 2026-09-19

The owner reported «نجحت جميع اختبارات P5.5» after completing the delivered
manual checklist. Record manual result as **PASS — REPORTED BY OWNER**.

P5.5 final evidence:
- implementation/documentation head
  `1bf01cda0a1b4273b14f7d1c06a844021e575648` — CI #266 SUCCESS;
- later documentation head
  `4c9e2eb6d955331345ae73f2029b2cd0c4764664` — CI #271 SUCCESS;
- owner manual checklist PASS.

P5.5 Comparability Contract is now **CLOSED**. P5.6 Optional Geographic Focus /
Navigation is the next ordered slice and remains **NOT STARTED** until the owner
instructs continuation. Full Phase 5 acceptance remains pending. Accepted app
version remains 0.4.0. Draft PR #9 remains open/unmerged; no merge, tag or
release.


## P5.6 implementation reconciliation and CI — 2026-09-19

After P5.5 closure, the owner instructed «أكمل». P5.6 is therefore authorized.
During the start audit, navigation code/tests were already present on the branch
while the canonical documentation still said P5.6 was NOT STARTED. The
repository was reviewed as-is, the remaining WGS84 wheel regression/build typing
issues were corrected, and the actual implementation state was reconciled in
`docs/PHASE_5_P5_6_REPORT.md`.

Delivered P5.6 behavior:
- independent zoom/wheel/touch navigation on Gleason and AE;
- zoom-to-area rectangle, rotation, reset, fit-full and focus-selected on both
  2D model views;
- WGS84 bounded zoom, wheel, pinch, yaw/pitch controls, rectangle zoom, reset,
  fit-full and focus-selected;
- 2D WGS84 fallback supports zoom/pinch/pan/area/focus while 3D rotation/tilt
  controls are explicitly disabled;
- camera navigation does not increment or replace canonical geographic
  selection;
- zoom/picking math remains reciprocal after WGS84 zoom/rotation and is covered
  near poles and the antimeridian.

Exact audited implementation head:
`378f0a8ed6710195cb1e48e0ebcd4518116a5d0d`.

[Release Acceptance Gates #329 — SUCCESS](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35462318226):
0 npm vulnerabilities, 71 frontend core tests, 2 PWA tests, 14 Chromium
acceptance scenarios, production build, WGS84 parity, Docker/PostGIS/Redis and
locked-source/search gates all PASS.

P5.6 status: **CLOSED / OWNER MANUAL PASS**. P5.7 and Phase 6 remain NOT STARTED. No merge, tag or release.


## P5.6 acceptance closure — 2026-09-19

The owner reported «نجحت كل الاختبارات» after completing the delivered P5.6
manual navigation checklist. Record manual result as **PASS — REPORTED BY
OWNER**.

P5.6 final evidence:
- implementation head
  `378f0a8ed6710195cb1e48e0ebcd4518116a5d0d` — CI #329 SUCCESS;
- documented branch head
  `3de1169c0f1534b9f0417dda81de8176f8f99b2c` — CI #340 SUCCESS;
- owner manual checklist PASS.

P5.6 Optional Geographic Focus / Navigation is now **CLOSED**. P5.7 Homogeneous
Differences and future time/layer/route contracts is the next ordered slice and
remains **NOT STARTED** until explicit owner continuation. Phase 6
routes/ruler/polygon area remains NOT STARTED.

Full Phase 5 acceptance remains pending. Accepted application version remains
0.4.0. Draft PR #9 remains open/unmerged. No merge, tag or release.


## P5.7 start — 2026-09-19

After P5.6 closure, the owner instructed «أكمل». P5.7 is the active slice.

P5.7 implementation boundary:
- signed numeric differences are allowed only when the accepted P5.5 contract
  says the two quantities are comparable;
- the difference stays in the declared compatible unit and never invents a
  conversion or scale;
- current Gleason↔AE, Gleason↔WGS84 and AE↔WGS84 laboratory pairs are
  heterogeneous and therefore expose no numeric delta;
- versioned contracts are reserved for time/astronomy, shared cross-model layer
  synchronization and route/measurement services, each explicitly unavailable;
- existing per-view layers are not removed by declaring future shared layer sync
  unavailable;
- route drawing, distance, ruler and area remain Phase 6;
- P5.8 persistence is not started.

Report: `docs/PHASE_5_P5_7_REPORT.md`. Full Phase 5 acceptance remains pending.
Accepted app version remains 0.4.0. Draft PR #9 remains open/unmerged. No merge,
tag or release.


## P5.7 acceptance closure — 2026-09-19

The owner reported «نجحت جميع اختبارات P5.7» after completing the delivered
manual checklist. Record manual result as **PASS — REPORTED BY OWNER**.

P5.7 final evidence:
- implementation/documentation head
  `6b21fbf78494335ca5cbec4c4c75a634b475cfac` — CI #383 SUCCESS;
- later documentation head
  `c3d97aac01a4b72706b2479001f35fed3bd830a1` — CI #387 SUCCESS;
- owner manual checklist PASS.

P5.7 is now **CLOSED**. P5.8 Versioned Local State Persistence is the next
ordered slice and remains **NOT STARTED** until explicit owner continuation.
P5.9 and Phase 6 routes/ruler/polygon area remain NOT STARTED.

Full Phase 5 acceptance remains pending. Accepted application version remains
0.4.0. Draft PR #9 remains open/unmerged. No merge, tag or release.


## PR #9 merge update — 2026-09-19

The owner explicitly authorized: «افق على دمج PR #9 إلى main».

PR #9 was marked ready and merged into `main` with merge commit
`97f043174b07cef9884075b1c37a4e4394f6f8bb`.

The merge carries the documented Phase 5 work through P5.7 into the default
branch. P5.8 remains NOT STARTED. Full Phase 5 acceptance remains pending.
No tag, GitHub Release or deployment was created by this merge.


## P5.8 start — 2026-09-19

The owner explicitly instructed «أبدأ P5.8».

A new working branch was created from the current `main` baseline:

`feat/phase5-p5-8-state-persistence`

P5.8 scope is limited to versioned local persistence/restoration of the Phase 5
shared geographic selection state. It uses the existing IndexedDB key/value
store and does not change source datasets, projection engines or database
schema.

Saved place identity is trusted only when an unchanged canonical record is
available in installed offline search packs. Otherwise the valid geographic
coordinate is restored as a free point with an explicit degraded-status result.
Malformed/unsupported state is discarded. Missing ellipsoidal height is never
coerced to zero.

Report: `docs/PHASE_5_P5_8_REPORT.md`.

P5.9 and Phase 6 remain NOT STARTED. Full Phase 5 acceptance remains pending.
Accepted app version remains 0.4.0. No tag or GitHub Release.


## P5.8 automated verification — 2026-09-19

P5.8 implementation head
`3e4dd65500591c43b5fd95f3b3f259d519a6c0ef` passed
[CI #439](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35468911842).

Evidence: 0 npm vulnerabilities, 86 frontend core tests, 2 PWA tests and 16
Chromium scenarios PASS, plus production build, WGS84 parity,
Docker/PostGIS/Redis, locked-source import and online/offline/Arabic search
gates.

P5.8 status: **IN PROGRESS / TECHNICALLY GREEN / awaiting owner manual
verification**. P5.9 and Phase 6 remain NOT STARTED. No tag or GitHub Release.


## P5.8 acceptance closure — 2026-09-20

The owner reported «نجحت جميع اختبارات P5.8». Record manual result as
**PASS — REPORTED BY OWNER**.

Final accepted P5.8 evidence before this closure:
- implementation head
  `3e4dd65500591c43b5fd95f3b3f259d519a6c0ef` — CI #439 SUCCESS;
- documentation head
  `06e01a842ce51c77c721ca7cf2c61a4a819af714` — CI #442 SUCCESS;
- owner manual checklist PASS.

P5.8 is now **CLOSED**.

Current ordered state:
- P5.1–P5.8: CLOSED;
- P5.9 Phase 5 Regression and Owner Acceptance Package: NEXT / NOT STARTED;
- full Phase 5: IN PROGRESS / NOT YET ACCEPTED;
- Phase 6: NOT STARTED.

Draft PR #11 remains open/unmerged. Accepted application version remains 0.4.0.
No tag, GitHub Release or deployment.


## P5.9 start — 2026-09-20

After P5.8 closure and CI #449 SUCCESS, the owner explicitly instructed «ابدأ».

A new stacked working branch was created from the closed P5.8 head:

`feat/phase5-p5-9-acceptance`

P5.9 scope:
- final Phase 5 regression package;
- explicit browser coverage for polar/antimeridian selections;
- machine-readable acceptance package;
- repository consistency gate;
- source visibility and known-limitations evidence;
- owner manual regression checklist.

P5.9 does not add Phase 6 route/ruler/distance/area functionality.

Report: `docs/PHASE_5_P5_9_REPORT.md`.
Machine package: `docs/PHASE_5_ACCEPTANCE_PACKAGE.json`.

Full Phase 5 acceptance remains pending and requires an explicit owner decision
after P5.9 regression testing. Accepted application version remains 0.4.0 and
accepted phase remains 4 until that decision. No tag or GitHub Release.


## P5.9 automated verification — 2026-09-20

P5.9 implementation head
`802a46ac3a1adce95fa9730e135ec5e377567631` passed
[CI #451](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35485918516).

Evidence:
- Phase 5 package consistency gate PASS;
- 0 npm vulnerabilities;
- 86 frontend core tests PASS;
- 2 PWA tests PASS;
- 17 Chromium scenarios PASS;
- production build, WGS84 parity, Docker/PostGIS/Redis, locked sources,
  online/offline search and Arabic search gates PASS.

The new P5.9 browser regression explicitly covers polar/antimeridian points and
source visibility. P5.9 status is **IN PROGRESS / TECHNICALLY GREEN / awaiting
owner manual regression**.

Full Phase 5 is still NOT YET ACCEPTED. Owner manual P5.9 PASS and owner Phase 5
acceptance remain separate pending decisions. Phase 6 remains NOT STARTED.


## P5.9 clean-branch reconciliation — 2026-09-20

P5.8 PR #11 is merged into `main` at
`7d490d6bf207a1d919cb01f5f99ac8a7275f0fd4`.

P5.9 continues on:
`feat/phase5-p5-9-acceptance-clean`.

The clean branch intentionally stops at the last verified pre-owner-acceptance
state. CI #451 passed the P5.9 implementation/regression package with 86 core,
2 PWA and 17 Chromium scenarios plus the full release suite.

A superseded PR #12 branch contains unverified owner-acceptance/version claims
and must not be used as acceptance evidence or merged.

Current truth:
- P5.1–P5.8 CLOSED;
- P5.9 TECHNICALLY GREEN / awaiting owner manual regression;
- Phase 5 NOT YET ACCEPTED;
- accepted app version 0.4.0;
- accepted phase 4;
- Phase 6 NOT STARTED.


## P5.9 owner manual closure — 2026-09-20

The owner completed the ten-item P5.9 manual regression checklist in sequence and
reported every item successful. Manual result: **PASS — REPORTED BY OWNER
(10/10 checks)**.

The exact owner-tested pre-closure branch head was
`4a5181c6fc8e4ed19f08f2281644cd40ee0282e0`, which had Release Acceptance Gates
#487 SUCCESS before the manual run. P5.9 is therefore **CLOSED**.

This is not full Phase 5 acceptance. Accepted application version remains
**v0.4.0**, accepted phase remains **4**, implementation phase remains **5 /
in_progress**, PR #13 remains unmerged, and Phase 6 remains **NOT STARTED**.


## Phase 5 whole-phase owner acceptance — 2026-09-20

After P5.1–P5.9 were closed and the P5.9 manual regression passed 10/10 checks,
the owner explicitly stated **«أعتمد المرحلة الخامسة»**.

Result: **PHASE 5 ACCEPTED BY OWNER**.

Accepted application version: **v0.5.0**. Accepted phase: **5**. Phase status:
**accepted**. The formal record is `docs/PHASE_5_ACCEPTANCE.md` and the
machine-readable state is `docs/PHASE_5_ACCEPTANCE_PACKAGE.json`.

This acceptance does not merge PR #13 and does not authorize a tag, GitHub
Release, deployment or Phase 6 start. Phase 6 remains **NOT STARTED**.


## Post-PR #13 merge reconciliation — 2026-09-20

This is the current status update after the historical acceptance sections above.

- PR #13 was separately authorized and **MERGED** into `main`.
- Merge commit: `913ec67c195ac5971e0f63d9acfe94dba8de60bf`.
- Final pre-merge accepted head: `9d6dbbc3cbf2756d59cc0d1bd9d3fbe1f3483e8c`.
- Release Acceptance Gates #514: **SUCCESS** on the final PR head.
- Release Acceptance Gates #515: **SUCCESS** on the post-merge `main` commit.
- Phase 5 remains **ACCEPTED BY OWNER — v0.5.0**.
- Phase 6 remains **NOT STARTED**.
- No tag or GitHub Release exists; deployment remains separately authorized.
- Historical statements that PR #13 was unmerged are retained as dated evidence
  of the state at the time they were written and do not override this snapshot.


## P6.3 latest owner refinement — 2026-09-20

Owner reported the straight-line retest **4/4 PASS** on the current P6.3 branch.
The next same-slice refinement is now in progress:

- Gleason + AE: explicit free pan using mouse drag or touch;
- WGS84: display-only spherical Great Circle reference between adjacent route
  points;
- numeric WGS84 distance remains the existing ellipsoidal geodesic result;
- Great Circle visualization must not be represented as observed flight data;
- P6.4 and P6.7 remain NOT STARTED;
- PR #19 remains unmerged.


### P6.3 pan + Great Circle automated result

- implementation/documentation head:
  `f67a69c78547330f273fc65bf3de4bb7379a09bf`
- Release Acceptance Gates **#627 — SUCCESS**
- Gleason + AE: explicit free pan by mouse drag or touch input
- WGS84: display-only spherical Great Circle reference
- numeric WGS84 identity remains `wgs84-geodesic`
- observed/live flight-track claim remains false
- owner targeted retest: **NOT RUN**
- P6.4/P6.7: NOT STARTED
- PR #19: unmerged


## P6.3 final closure — 2026-09-20

P6.3 is **CLOSED** after:
- base manual 6/6 PASS;
- route-guide targeted retest 5/5 PASS;
- straight-line targeted retest 4/4 PASS;
- pan + Great Circle targeted retest 6/6 PASS;
- pre-closure Release Acceptance Gates #635 SUCCESS on
  `746e71b261747132bec49f33348cd42870092643`.

The final closure-documentation head is subject to one complete Release Acceptance
Gates run. No merge is implied by closure.

Current boundaries:
- P6.3 CLOSED;
- P6.4 NOT STARTED;
- P6.7 NOT STARTED;
- PR #19 OPEN / DRAFT / UNMERGED;
- no tag / GitHub Release / deployment.


## Post-PR19 merge reconciliation — 2026-09-20

Current integration truth after the separately authorized PR #19 merge:

- PR #19 final head: `c775aac8a97a6782915782ed2118c3018cfe5a1a`;
- pre-merge Release Acceptance Gates: **#642 — SUCCESS**;
- merge commit on `main`: `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`;
- post-merge Release Acceptance Gates: **#643 — SUCCESS**;
- documentation reconciliation head: `813d2268d74dd0b7ff1a1336b461e6281b71d392`;
- documentation reconciliation Release Acceptance Gates: **#644 — SUCCESS**;
- P6.3: **CLOSED**;
- P6.4: **NOT STARTED**;
- P6.7: **NOT STARTED**;
- accepted phase remains **5**;
- accepted application version remains **v0.5.0**;
- no tag, GitHub Release or deployment has been created.

This reconciliation is documentation-only. It does not start P6.4 and does not
modify source locks, numerical engines, database content, package version or
accepted-phase state.


## P6.4 start — 2026-09-20

Owner instruction: **«أبدأ P6.4»**.

Verified baseline:
- `main @ 35fda15508973340669220a20ee1c5bf6bbaa39a`;
- PR #20 merged;
- post-merge Release Acceptance Gates **#651 — SUCCESS**.

P6.4 scope is AE native projected-plane distance for adjacent P6.2 ordered
route segments and the open-polyline total. The method identity is
`ae-projected-plane`, unit `metre`, scale basis
`ae-projected-plane-si-metre`. Backend uses pyproj/PROJ; browser/offline uses
the existing proj4 AE definition. WGS84 geodesic identity remains separate.

P6.5 and P6.7 remain **NOT STARTED**. The owner subsequently reported all six
P6.4 manual checks successful. No merge, tag, GitHub Release or deployment is
implied by closing the slice.


## P6.4 — AE Native Measurement — current state

Owner explicitly started P6.4 on 2026-09-20.

Verified baseline:
- `main @ 35fda15508973340669220a20ee1c5bf6bbaa39a`;
- PR #20 MERGED;
- post-merge Release Acceptance Gates #651 SUCCESS.

Current implementation:
- adjacent ordered route points are projected through the independent north-polar AE provider;
- each adjacent segment is measured as a straight Euclidean chord in projected x/y metres;
- open-polyline total is the sum of those projected segments;
- method identity remains `ae-projected-plane`;
- scale basis remains `ae-projected-plane-si-metre`;
- backend authority: pyproj/PROJ;
- independent browser/offline implementation: proj4 2.22.0;
- explicit distortion notice: AE radial distances from the north-pole center are preserved, arbitrary pairwise surface distances are not;
- provider-backed road/flight routes remain unavailable;
- WGS84 geodesic and AE projected-plane results remain semantically separate.

Automated evidence:
- implementation head `bd73fa0f6aa4cfd9c1d415c915f0ad35bd4c3476`;
- Release Acceptance Gates #653: **SUCCESS**;
- CI #652 was a checker-only failure caused by a stale historical P6.3 current-slice assertion.

Owner manual closure:
- owner-tested head: `59d19a96c6a7af443429d8ba7585386d4f491dee`;
- pre-manual Release Acceptance Gates #661: **SUCCESS**;
- owner result: **6/6 PASS — REPORTED BY OWNER**.

Current governance state:
- P6.4: **CLOSED**;
- P6.5: NOT STARTED;
- P6.7: NOT STARTED;
- PR #21: OPEN / DRAFT / UNMERGED;
- no tag / GitHub Release / deployment.


## Owner-approved 2026-09-21 comparative astronomy addendum

The owner approved a second architecture-only expansion after reviewing Shane's
Personal Celestial Sphere model, Walter Bislin's upstream FE-Dome implementation,
modern NASA Saros references and historical scholarship on Babylonian eclipse
prediction.

New future architecture:
- `CelestialComputationProvider`;
- `EclipsePredictionProvider`;
- calculation classes: reference-ephemeris / historical-cycle /
  external-comparative-model / model-native / display-only;
- `ObserverCelestialSphere` kept distinct from any `PhysicalHeavensModel`;
- Shane/Walter registered as separate comparative/provenance sources;
- Phase 12 future Babylonian 223-Month Eclipse Cycle (later called Saros);
- Phase 17 reproducible experiment URLs/IDs;
- Phase 20 provider-by-provider astronomy validation matrix.

No astronomy engine is currently implemented by this amendment. P6.6 remains
NOT STARTED. Source/code snapshots must be pinned and audited before runtime reuse.


### 2026-09-21 Gleason scale/raster audit update

PR #31 now targets the owner-approved corrected scale architecture:
`gleason-fig43-circle-derived` default, radial-60 legacy comparison, Walter
configurable comparison, same-latitude arc/chord separation, and provisional
georeferencing for the owner-supplied 4653x6506 restored Gleason raster.
P6.7A remains NOT STARTED.


### P6.6 corrected-contract closure state — 2026-09-21

The owner completed the corrected Gleason contract checklist **6/6 PASS —
REPORTED BY OWNER** on `e96712975fc9f54f2615e235bb6976136efe8a2d`,
which had Release Acceptance Gates **#783 — SUCCESS**. P6.6 is **CLOSED / VERIFIED / MERGED** after final closure-state CI #784 and the separately authorized PR #31 merge. P6.7A remains NOT STARTED. A documentation/state reconciliation was explicitly requested by the owner on 2026-09-22 before any next implementation slice
closure.
