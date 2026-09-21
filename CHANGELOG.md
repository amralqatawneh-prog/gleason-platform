# Changelog

## [Unreleased] — Post-PR #28 merge reconciliation (2026-09-21)

- PR #28 — Post-PR27 Merge Documentation Reconciliation — is now **MERGED / CLOSED**.
- Exact final PR #28 head `8f6b69c90148e0c5e9200ebab2dfab88ed0f5789` passed Release Acceptance Gates **#744 — SUCCESS** before merge.
- Earlier PR #28 verification head `018e6a7984dcf682e94f36668333ea00ccbaf085` passed **#738 — SUCCESS**.
- PR #28 merge commit / current integration baseline: `a96f47b95c542c2eafb21771bc7c53e7ab40d170`.
- No post-merge workflow run/conclusion is claimed because none is independently observed for that merge commit.
- The owner instructed **«أبدأ العمل»** after review of the current handoff; the agreed next task is post-PR28 documentation/state reconciliation.
- Draft PR #29 on `docs/post-pr28-merge-reconciliation` is **IN PROGRESS** for this reconciliation.
- P6.6 remains **NOT STARTED**; accepted phase remains **5** and accepted application version remains **v0.5.0**.
- No runtime astronomy/Saros/eclipse/observer-dome implementation, tag, GitHub Release or deployment is introduced.

## [Unreleased] — Post-PR #27 merge reconciliation (2026-09-21)

- Owner explicitly authorized **«قم بدمج PR #27 إلى main»**.
- PR #27 — Roadmap & Astronomy Architecture Amendment — was **MERGED / CLOSED**.
- Exact final PR head `8d84c2e83a148a359fd0d75da7e5f3b21570ac22` passed Release Acceptance Gates **#726 — SUCCESS** before merge.
- Prior amendment verification head `eebf162e3dd1cf35e15933ff4622e7915bf0cd97` passed **#720 — SUCCESS**.
- PR #27 merge commit / current integration baseline: `5442852ef4bc2e760db39743d0bc7b3bc57d0b11`.
- No post-merge push-run number is claimed because none is independently visible through the available workflow view.
- Astronomy Architecture Amendment remains **CLOSED / VERIFIED + MERGED**.
- P6.6 remains **NOT STARTED**; runtime astronomy/Saros/eclipse/observer-dome implementation remains **NOT STARTED**.
- Accepted phase remains **5** and accepted application version remains **v0.5.0**.
- No tag, GitHub Release or deployment is created by this reconciliation.
- Reconciliation verification head `018e6a7984dcf682e94f36668333ea00ccbaf085` passed Release Acceptance Gates **#738 — SUCCESS**.
- Reconciliation is **CLOSED / VERIFIED**; PR #28 remains **OPEN / DRAFT / UNMERGED** pending separate owner merge authorization.

## [Unreleased] — Roadmap & Astronomy Architecture Amendment (2026-09-21)

- Owner approved the comparative-astronomy roadmap proposal and explicitly instructed implementation of the documentation/architecture amendment.
- Register Shane's Personal Celestial Sphere model and Walter Bislin's upstream FE-Dome implementation as separate external comparative/provenance sources; neither becomes sole numerical validation truth.
- Register NASA solar/lunar Saros pages as modern cycle references, Brack-Bernsen & Steele (2005) as historical-method scholarship for Babylonian 223-month eclipse prediction, and the British Museum Map of the World as historical cosmography context only.
- Add planning source registry `data/sources/astronomy-comparative-sources.yaml`.
- Reserve `CelestialComputationProvider` and `EclipsePredictionProvider`.
- Add calculation classes `reference-ephemeris`, `historical-cycle`, `external-comparative-model`, `model-native`, and `display-only`.
- Separate `ObserverCelestialSphere` from any future `PhysicalHeavensModel`.
- Expand future Phases 9–12, 17 and 20 with comparative astronomy, Personal Celestial Sphere comparison, Babylonian 223-Month/Saros historical-cycle work, reproducible experiment URLs/IDs, and provider-by-provider validation.
- No functional astronomy engine, Saros calculator, observer dome, eclipse path, P6.6 start, tag, GitHub Release or deployment is introduced.
- PR #26 was separately authorized and **MERGED** at `6bbfe92e8a4c0b66415eb888598cace5b7b15102` after exact final head `24aba98192483dc8fc3d60cacbb8eac96f0fa5aa` passed Release Acceptance Gates **#718 — SUCCESS**. PR #27 can now be retargeted to `main` for full remote verification.
- PR #27 verification head `eebf162e3dd1cf35e15933ff4622e7915bf0cd97` passed Release Acceptance Gates **#720 — SUCCESS**; exact final closure head `8d84c2e83a148a359fd0d75da7e5f3b21570ac22` passed **#726 — SUCCESS** and PR #27 was subsequently **MERGED** at `5442852ef4bc2e760db39743d0bc7b3bc57d0b11` by separate owner authorization.

## [Unreleased] — Post-PR #25 merge reconciliation (2026-09-21)

- Owner explicitly authorized **«قم بدمج PR #25 إلى main»**.
- PR #25 — Phase 6 P6.5 Gleason Native Measurement — was **MERGED / CLOSED**.
- Exact final PR head `03a04679cfa4955340fa91f5f9d75aeeb268b0d7` passed Release Acceptance Gates **#699 — SUCCESS** before merge.
- P6.5 owner manual verification remains **6/6 PASS — REPORTED BY OWNER**.
- PR #25 merge commit / current integration baseline: `bdff76e765c78108e96fd0e644df850be22f8eed`.
- No post-merge push-run number is claimed because it has not been independently observed through the available workflow view.
- Reconcile current-state documentation and machine-readable governance to the post-PR25 truth.
- P6.5 remains **CLOSED + MERGED**; P6.6 remains **NOT STARTED**.
- Accepted phase remains **5** and accepted application version remains **v0.5.0**.
- No tag, GitHub Release or deployment is created by this reconciliation.
- Reconciliation verification head `6b7b1e9cc2e809f4485626171d69c18366c89fe5` passed Release Acceptance Gates **#713 — SUCCESS**.
- Reconciliation is **CLOSED / VERIFIED**; PR #26 remains **OPEN / DRAFT / UNMERGED** pending separate owner merge authorization.

## [Unreleased] — Phase 6 / P6.5 Gleason Native Measurement (2026-09-21)

- Owner explicitly instructed **«ابدأ P6.5»**.
- Start from verified `main @ fc42af3cd97706ddc3f92b44f7e784ba86fc7536` after PR #24 merged; PR #24 exact final head `2c3b12ceabdf374d587c96f49f23d097de8d8d1d` passed Release Acceptance Gates **#684 — SUCCESS** before merge.
- Add Gleason adjacent-segment and open-polyline distance with method identity `gleason-native-normalized`, unit `normalized-radius-unit`, scale basis `gleason-normalized-model-radius`, semantic type `COMPUTED_RESULT`.
- Reuse the registered GH-0.2.0 DERIVED normalized reconstruction; do not claim the historical book prints the analytic formula verbatim.
- Add backend API `POST /api/v1/measurement/gleason/route-distance`.
- Add independent browser/offline implementation and a deterministic backend/browser parity gate.
- Add bilingual live P6.5 panel bound to P6.2 route state with explicit no-metre/km warning.
- Preserve WGS84 and AE identities; provider-backed routing, perimeter and area remain unavailable.
- Exact pre-manual head `a733f81d922963a385357becf69dafd8b6d576be` passed Release Acceptance Gates **#691 — SUCCESS**.
- Owner manual verification: **6/6 PASS — REPORTED BY OWNER**.
- Manual coverage includes basic normalized distance, multi-point live recomputation, repeated zero-length segment, reverse-route total invariance, backend-stop browser fallback, and Arabic/mobile layout.
- P6.5 is **CLOSED** in closure-state documentation; P6.6 remains **NOT STARTED**. Final closure-state CI is required before separate merge authorization.


## [Unreleased] — Post-PR #23 merge reconciliation (2026-09-21)

- Owner explicitly authorized **«قم بدمج PR #23 إلى main»**.
- Roadmap/Architecture Amendment PR #23 was **MERGED**.
- Exact final PR head `c73ca4cdd41b2e3cd745df5412be30a44d2bda9c` passed Release Acceptance Gates **#676 — SUCCESS** before merge.
- PR #23 merge commit / current integration baseline: `de2cf9b0a8a48a788323373eb2b9c72622c288f8`.
- A post-merge push-run number is not recorded because it was not independently visible through the available GitHub workflow view at reconciliation start; no CI result is fabricated.
- Reconcile current-state documentation and machine-readable governance records to the post-PR23 truth.
- Phase 5 remains **ACCEPTED** at **v0.5.0**; Phase 6 remains **IN PROGRESS**; P6.1–P6.4 remain **CLOSED**; P6.5 remains **NOT STARTED**.
- No tag, GitHub Release or deployment is created by this reconciliation.
- Reconciliation verification head `89b634d49eb802c17f9978fee7065ca958c3b592` passed Release Acceptance Gates **#679 — SUCCESS**; reconciliation is CLOSED/VERIFIED. PR #24 remains open/unmerged pending separate owner merge authorization.


## [Unreleased] — Roadmap & Architecture Amendment — New Requirements (2026-09-21)

- Owner approved the expanded roadmap before starting P6.5.
- Start documentation/architecture-only amendment from `main @ ba44ae59410e02ae748b235ed9792c8d4ee31b02` after PR #22 merged.
- Add formal future scope for solar/lunar analemmas, ObserverContext/current-location/pin workflows, observer dome, eclipse top/observer views, accurate day/night/twilight events, high-detail map layers, Aviation Laboratory, OSIRIS-inspired provider architecture and turn-by-turn routing.
- Add shared design contracts for `ObserverContext`, `TimeContext`, `ExternalLayerProvider` and `RouteProvider`.
- Add living `DEVELOPER_GUIDE.md`, `USER_GUIDE.md` and `CALCULATION_REFERENCE.md`; future relevant slices must keep them synchronized.
- Add P6.7B Route Provider & Turn-by-Turn Directions without changing the status of P6.5/P6.6/P6.7A.
- Expand Phases 9–12, 15–16, 19 and 21 with explicit slices and acceptance criteria.
- No astronomy, aviation, detailed-map, routing-provider or P6.5 functional implementation is introduced by this amendment.
- Accepted phase remains 5; accepted application version remains v0.5.0; Phase 6 remains IN PROGRESS.
- Amendment initial verification head `cb4b4681bd359e29b08542856b7bff144a239796` passed Release Acceptance Gates **#673 — SUCCESS**. Exact final head `c73ca4cdd41b2e3cd745df5412be30a44d2bda9c` passed **#676 — SUCCESS**. PR #23 was subsequently authorized and merged at `de2cf9b0a8a48a788323373eb2b9c72622c288f8`.


## [Unreleased] — Post-PR #21 merge reconciliation (2026-09-21)

- PR #21 was separately authorized and **MERGED** into `main`.
- Final P6.4 closure head `ced5649c3c2d6e1c8e1d96af35fb0775637719a3` passed pre-merge Release Acceptance Gates **#668 — SUCCESS**.
- PR #21 merge commit / current integration baseline: `11b571f08f72732b509f049f1a2ab1be92292938`.
- Post-merge `main` Release Acceptance Gates **#669 — SUCCESS**.
- Reconcile current-state documentation and machine-readable governance records to the post-PR21 truth; preserve historical dated statements as historical evidence.
- Reconciliation verification head `ae23478c53b51520d708ddfabff90a5867a03152` passed Release Acceptance Gates **#670 — SUCCESS**; closure state is recorded for final exact-head verification.
- P6.4 remains **CLOSED**; P6.5 remains **NOT STARTED**; accepted phase remains **5** and accepted application version remains **v0.5.0**.
- No Phase 6 tag, GitHub Release or deployment is created by this reconciliation.

## [Unreleased] — Phase 6 / P6.4 AE Native Measurement (2026-09-20)

- Owner explicitly instructed **«أبدأ P6.4»**.
- Start from verified `main @ 35fda15508973340669220a20ee1c5bf6bbaa39a`; post-PR20 Release Acceptance Gates **#651 — SUCCESS**.
- Add AE projected-plane adjacent-segment and open-polyline distance with method identity `ae-projected-plane`, unit `metre`, scale basis `ae-projected-plane-si-metre`.
- Backend uses the existing north-polar AE pyproj/PROJ provider; browser/offline uses the existing proj4 definition.
- Keep AE projected-plane metres semantically separate from WGS84 geodesic metres; expose distortion limitations explicitly.
- Add a separate bilingual live AE measurement panel bound to P6.2 ordered route state.
- Add backend/core/browser tests for reference radial geometry, antimeridian projected chord, repeated points, reverse routes, invalid input and live recalculation.
- CI #652 failed at the acceptance-package checker before implementation gates because a historical P6.3 current-slice assertion had not been separated from the new current P6.4 state.
- Corrected implementation head `bd73fa0f6aa4cfd9c1d415c915f0ad35bd4c3476` passed Release Acceptance Gates **#653 — SUCCESS**.
- Current documentation/state head `59d19a96c6a7af443429d8ba7585386d4f491dee` passed Release Acceptance Gates **#661 — SUCCESS**.
- Owner reported all six P6.4 manual checks **6/6 PASS — REPORTED BY OWNER** on 2026-09-21.
- P6.4 is **CLOSED**; P6.5/P6.7 remain **NOT STARTED**. At this closure moment PR #21 remained draft/unmerged; it was subsequently authorized and merged as recorded in the post-PR21 entry above. No tag/release/deployment authorization was implied by closure itself.

## [Unreleased] — Post-PR #19 merge reconciliation (2026-09-20)

- PR #19 was separately authorized and merged into `main`.
- Final PR head `c775aac8a97a6782915782ed2118c3018cfe5a1a` passed pre-merge Release Acceptance Gates **#642 — SUCCESS**.
- Merge commit / current integration baseline: `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`.
- Post-merge `main` passed Release Acceptance Gates **#643 — SUCCESS**.
- Reconcile README, current handoff, Phase 6 plan, P6.3 report, acceptance package and checker to the post-merge truth.
- P6.3 remains **CLOSED**; P6.4 and P6.7 remain **NOT STARTED**.
- Accepted phase remains **5** and accepted application version remains **v0.5.0**.
- No tag, GitHub Release or deployment is created by this documentation reconciliation.
- Reconciliation verification head `813d2268d74dd0b7ff1a1336b461e6281b71d392` passed Release Acceptance Gates **#644 — SUCCESS**; reconciliation status is CLOSED.

## [Unreleased] — Phase 6 / P6.3 WGS84 Ruler / Distance (2026-09-20)

- Owner explicitly instructed **«ابدأ في الخطوة P6.3»**.
- Start from verified `main @ 645a27c5ea92febd78c3bdd823281ff496a742b3`; post-PR18 Release Acceptance Gates #561 SUCCESS.
- Add authoritative backend WGS84 open-polyline distance using pyproj/PROJ per adjacent segment.
- Add independent offline/browser WGS84 distance using `geographiclib-geodesic 2.2.0`.
- Add live segment and total ruler UI bound to transient P6.2 ordered route state.
- Preserve method identity `wgs84-geodesic`, contract unit `metre`, scale basis `wgs84-ellipsoid`, semantic type `REFERENCE_RESULT`.
- Do not fabricate unknown height in P6.3 route inputs.
- Add backend/API/core/browser/parity coverage for antimeridian, near-polar, repeated, reversed and invalid routes.
- Keep route drawing/provider paths, AE/Gleason distance, perimeter/area and persistence unavailable for later slices.
- Final pre-refinement implementation head `06f2397f63648d879d6271064f3297608a59c333` passed Release Acceptance Gates **#565 — SUCCESS**, including **20/20 Chromium acceptance tests** and the Docker P6.3 API smoke test.
- Owner reported the P6.3 manual checklist **6/6 PASS** and additionally confirmed browser-local GeographicLib distance works after stopping the backend and restarting it afterward.
- Documentation head `a65ca1af84c5bed1e7b0584da2b38cd3c8cbdad9` passed Release Acceptance Gates **#572 — SUCCESS**.
- Owner-requested same-slice refinement: add a **visual-only** ordered route guide line and A/B/C markers to WGS84, Gleason and AE.
- The guide does not alter `wgs84-geodesic` computation identity and does not enable provider routes or start P6.7.
- Route-guide refinement head `483b123277f62e219937298b4fb7ca104809d420` passed Release Acceptance Gates **#587 — SUCCESS** including 20/20 Chromium acceptance tests.
- Current route-guide documentation head `df9227a831e4b90940cea70dde902f64684a0bf4` passed Release Acceptance Gates **#595 — SUCCESS**.
- Owner reported targeted route-guide refinement **5/5 PASS** and repeated backend-stop line/browser-local fallback **PASS**.
- Owner-requested second same-slice refinement: on Gleason and AE, each route segment is now one exact straight projected chord using only the two projected endpoints; WGS84 visualization is unchanged.
- Straight-line implementation head `f837f8af9c56309156540f28cdf5e60456642b69` passed Release Acceptance Gates **#607 — SUCCESS**.
- Straight-line refinement retest: **4/4 PASS — REPORTED BY OWNER**.
- Owner-requested next P6.3 refinement: explicit mouse/touch free pan on Gleason/AE and Great Circle reference rendering on the WGS84 globe.
- Numeric WGS84 distance remains `wgs84-geodesic`; Great Circle rendering is visual-only and is not observed flight-track data.
- Pan/great-circle implementation/documentation head `f67a69c78547330f273fc65bf3de4bb7379a09bf` passed Release Acceptance Gates **#627 — SUCCESS**.
- Pan/great-circle targeted retest: **6/6 PASS — REPORTED BY OWNER**.
- Pre-closure head `746e71b261747132bec49f33348cd42870092643` passed Release Acceptance Gates **#635 — SUCCESS**.
- Final closure head `c775aac8a97a6782915782ed2118c3018cfe5a1a` passed Release Acceptance Gates **#642 — SUCCESS**.
- PR #19 was separately authorized and **MERGED** into `main` at `4aac199646f3a899b45e241bf8995e8ba7c8f2a0`.
- Post-merge Release Acceptance Gates **#643 — SUCCESS**.
- P6.3 remains **CLOSED**; P6.4 and P6.7 remain **NOT STARTED**; no tag, GitHub Release or deployment was created.

## [Unreleased] — Post-PR #17 GitHub state synchronization (2026-09-20)

- PR #17 was separately authorized and **MERGED** into `main`.
- Merge commit / current integration baseline: `660a7908dd9e3c2f073155a5394d5dfb60ee67e8`.
- Final PR #17 head `edfe36c98a48dfe6443d82f875ac53951a59a6a1` passed Release Acceptance Gates **#557**.
- Post-merge `main` passed Release Acceptance Gates **#558 — SUCCESS**.
- Synchronize README, handoff, roadmap, Phase 6 plan, measurement requirements and machine-readable GitHub state.
- P6.1/P6.2 remain CLOSED; P6.3 remains NOT STARTED.
- Accepted phase remains 5 and accepted application version remains v0.5.0.
- No tag, GitHub Release or deployment is created by this state synchronization.
- Initial synchronization head `2314a247560d463ef03cd6438ea932da37813d73` passed Release Acceptance Gates **#559 — SUCCESS**; synchronization state is CLOSED.

## [Unreleased] — Post-PR #16 documentation reconciliation (2026-09-20)

- Reconcile current-status documentation with the separately authorized PR #16 merge.
- Current integration baseline is `main @ c1d72e1d1536cf1aba9376e4ada76b7fc31056f5`.
- PR #16 is MERGED; post-merge Release Acceptance Gates #554 succeeded.
- P6.1 and P6.2 remain CLOSED; P6.3 remains NOT STARTED.
- Accepted phase remains 5 and accepted application version remains v0.5.0.
- No tag, GitHub Release or deployment is created by this documentation-only reconciliation.
- Historical reports retain the status that was true when they were written.
- Initial reconciliation head `df212e45758b18b742ad03f76123dd190ae0f45e` passed Release Acceptance Gates **#555 — SUCCESS**; reconciliation state is CLOSED.

## [Unreleased] — Phase 6 / P6.2 Ordered Route State (2026-09-20)

- Continue Phase 6 after the owner instructed **«اكمل»**.
- Baseline: PR #15 merged to `main @ 143532248f707380b980e787051e7decc3c91086`; post-merge Release Acceptance Gates #530 SUCCESS.
- Add transient ordered route-point state A→B→C… built only from explicit P6.1 geographic endpoints.
- Add stable in-session point IDs, derived segment IDs, add/remove/reorder, undo and clear.
- Owner-requested refinement: add an explicit direct-map route-point mode for short picks on Gleason, AE and WGS84.
- Make the multi-point capability explicit in the UI; P6.2 supports up to 50 transient points rather than only A/B/C.
- Reject country records as implicit point endpoints; no centroid/capital/boundary guess is introduced.
- Keep route state transient: it is not stored in the P5.8 IndexedDB shared-selection record.
- Add bilingual responsive Ordered Route panel and browser/core tests.
- Keep route drawing/provider paths and numeric route/ruler/perimeter/area engines unavailable for later Phase 6 slices.
- P6.2 final implementation/refinement head `1d37a70f376fbe8a8974274dac48c04e2fa36807` passed Release Acceptance Gates #546.
- Owner reported the original P6.2 manual checklist **6/6 PASS** and the direct-map / >3-points refinement retest **PASS**.
- P6.2 is **CLOSED**; P6.3 remains **NOT STARTED**.
- PR #16 was subsequently authorized and **MERGED** into `main` at `c1d72e1d1536cf1aba9376e4ada76b7fc31056f5`; post-merge Release Acceptance Gates #554 succeeded. Accepted phase remains 5 and accepted application version remains v0.5.0; no tag, GitHub Release or deployment.

## [Unreleased] — Phase 6 / P6.1 Measurement Semantics Contract (2026-09-20)

- Owner explicitly instructed **«ابدأ بتنفيذ Phase 6»**.
- Start Phase 6 from `main @ 3e5afcd9b95766bd18af59df88c9154f51567e8c` after Release Acceptance Gates #517 SUCCESS.
- Accepted application version remains **v0.5.0** and accepted phase remains **5**; implementation phase becomes **6 / in_progress**.
- Add a versioned measurement semantics contract for explicit endpoints, calculation method/model/space, quantity, units and scale basis.
- Reject a country record as an implicit point-to-point endpoint; future centroid/boundary semantics must be explicit.
- Keep WGS84 geodesic, AE projected-plane and Gleason normalized-native methods distinct.
- Preserve computation identity when a path/result is visualized on another model.
- Keep route operations fail-closed during P6.1; numeric route/ruler/perimeter/area engines are not implemented yet.
- P6.1 implementation verification passed Release Acceptance Gates #519 and documentation verification passed #520.
- Owner reported all five P6.1 manual checks PASS; P6.1 is CLOSED.
- P6.2 Ordered Route State remains NOT STARTED.
- No tag, GitHub Release, deployment or PR #15 merge authorization is implied.

## [Unreleased] — Post-PR #13 merge documentation reconciliation (2026-09-20)

- PR #13 was separately authorized and **MERGED** into `main`.
- Merge commit / accepted main baseline: `913ec67c195ac5971e0f63d9acfe94dba8de60bf`.
- Final pre-merge PR head `9d6dbbc3cbf2756d59cc0d1bd9d3fbe1f3483e8c` passed Release Acceptance Gates **#514**.
- The post-merge `main` commit passed Release Acceptance Gates **#515**.
- Reconcile current-status documentation without rewriting historical phase/slice evidence.
- Phase 5 remains accepted at **v0.5.0**; Phase 6 remains **NOT STARTED**.
- No tag, GitHub Release or deployment is created by this documentation reconciliation.

## [0.5.0] - 2026-09-20

### Accepted
- Owner explicitly accepted Phase 5 as a whole: **«أعتمد المرحلة الخامسة»**.
- P5.1–P5.9 are closed; P5.9 manual regression is **10/10 PASS — REPORTED BY OWNER**.
- Accepted application version advances from **0.4.0** to **0.5.0**.
- Accepted phase advances from **4** to **5**; Phase 5 status becomes **accepted**.

### Boundaries
- Phase 6 remains **NOT STARTED**.
- At the moment of the Phase 5 acceptance decision, PR #13 remained open/draft and unmerged pending a separate merge authorization; that later authorization and merge are recorded in the post-merge entry above.
- No tag, GitHub Release or deployment is authorized by Phase 5 acceptance.
- Historical-source, missing-height, undefined-scale and future-service fail-closed boundaries remain unchanged.

## [Unreleased] — P5.9 owner manual closure (2026-09-20)

- Owner completed the P5.9 manual regression checklist and reported all **10/10** checks successful.
- Record P5.9 manual result as **PASS — REPORTED BY OWNER** and close P5.9.
- Clean pre-closure head `4a5181c6fc8e4ed19f08f2281644cd40ee0282e0` had Release Acceptance Gates #487 SUCCESS.
- Full Phase 5 remains **NOT YET ACCEPTED** pending a separate explicit owner decision.
- Accepted application version remains **0.4.0**; accepted phase remains **4**; implementation phase remains **5 / in_progress**.
- PR #13 remains open/draft and unmerged. Phase 6 remains NOT STARTED. No tag, GitHub Release or deployment is authorized.


## [Unreleased] — P5.9 clean integration reconciliation (2026-09-20)

- Owner authorized integration while P5.9 was active.
- Merge closed/owner-tested P5.8 PR #11 into `main` at `7d490d6bf207a1d919cb01f5f99ac8a7275f0fd4`.
- Continue P5.9 from the last verified pre-owner-acceptance state on `feat/phase5-p5-9-acceptance-clean`.
- Supersede PR #12 because its branch contains unverified Phase 5 owner-acceptance and v0.5.0 claims not issued in the current owner conversation.
- Keep P5.9 technically green / awaiting owner manual regression; Phase 5 remains NOT YET ACCEPTED at accepted version 0.4.0.
- No tag, GitHub Release, deployment or Phase 6 start.


## [Unreleased] — P5.9 automated verification (2026-09-20)

- P5.9 implementation head `802a46ac3a1adce95fa9730e135ec5e377567631` passed Release Acceptance Gates #451.
- CI reports acceptance-package gate PASS, 0 npm vulnerabilities, 86 frontend core tests, 2 PWA tests and 17 Chromium scenarios PASS, plus production build/parity/Docker/PostGIS/Redis/source/search gates.
- The new browser regression covers ±89.5° / ±179.9°, provenance visibility, model evidence, unavailable future services, bilingual/mobile behavior and no heterogeneous cross-model delta leakage.
- P5.9 remains open pending owner manual regression. Full Phase 5 remains unaccepted pending a separate explicit owner decision.


## [Unreleased] — Phase 5 / P5.9 regression and acceptance package (2026-09-20)

- Owner explicitly instructed «ابدأ» after P5.8 closure.
- Create `feat/phase5-p5-9-acceptance` from P5.8 closure head `99cb55da979a46810c2c61215a729b1356806ada`; CI #449 on that base is SUCCESS.
- Add machine-readable `docs/PHASE_5_ACCEPTANCE_PACKAGE.json` and fail-closed `scripts/check_phase5_acceptance_package.py`.
- Add TEST-ONLY polar/antimeridian browser fixtures at ±89.5° / ±179.9° and an explicit Playwright regression for canonical selection, provenance, model evidence, unavailable future services, bilingual/mobile layout and no heterogeneous delta leakage.
- Add the acceptance package to Release Acceptance Gates.
- P5.9 and full Phase 5 are not accepted yet. Phase 6 remains NOT STARTED.
- No merge, tag, GitHub Release or deployment is authorized by this start.


## [Unreleased] — P5.8 owner acceptance closure (2026-09-20)

- Owner reported «نجحت جميع اختبارات P5.8». Record manual result PASS — REPORTED BY OWNER.
- P5.8 closes with CI #439 and CI #442 SUCCESS.
- Accepted behavior includes versioned IndexedDB persistence, strict restore validation, installed-pack place identity verification, explicit coordinate-only degradation, no fabricated ellipsoidal height, and hydration without synthetic user revision.
- P5.9 Phase 5 Regression and Owner Acceptance Package is next / NOT STARTED.
- Full Phase 5 remains IN PROGRESS / NOT YET ACCEPTED. Phase 6 remains NOT STARTED.
- Draft PR #11 remains open/unmerged. No tag, GitHub Release or deployment.


## [Unreleased] — P5.8 automated verification (2026-09-19)

- P5.8 implementation head `3e4dd65500591c43b5fd95f3b3f259d519a6c0ef` passed Release Acceptance Gates #439.
- CI reports 0 npm vulnerabilities, 86 frontend core tests, 2 PWA tests and 16 Chromium scenarios PASS, plus build/parity/Docker/PostGIS/Redis/source/search gates.
- P5.8 remains open pending owner manual verification. P5.9 and Phase 6 remain NOT STARTED.


## [Unreleased] — Phase 5 / P5.8 versioned local state persistence (2026-09-19)

- Owner explicitly instructed «أبدأ P5.8».
- Create `feat/phase5-p5-8-state-persistence` from current `main`.
- Add schema-v1 IndexedDB persistence for the canonical Phase 5 geographic selection.
- Restore free points only after strict coordinate/model validation.
- Restore saved place identity only from an unchanged installed offline-pack record; otherwise explicitly degrade to coordinate-only WGS84 state.
- Reject malformed/unsupported saved state and never fabricate ellipsoidal height or provenance.
- Hydration is not a user selection event and does not increment the selection revision.
- Add core and browser coverage for offline restore and malformed-state rejection.
- P5.9 and Phase 6 remain NOT STARTED. Automated/owner P5.8 PASS is not claimed yet.


## [Unreleased] — PR #9 merged into main (2026-09-19)

- Owner explicitly authorized merging PR #9 into `main`.
- PR #9 merged successfully at `97f043174b07cef9884075b1c37a4e4394f6f8bb`.
- The default branch now contains the Phase 5 work through closed P5.7 plus the reconciled README/current documentation.
- P5.8 remains NEXT / NOT STARTED; P5.9 and Phase 6 remain NOT STARTED.
- Accepted application version remains 0.4.0 and full Phase 5 remains IN PROGRESS / NOT YET ACCEPTED.
- No tag, GitHub Release or deployment was created.


## [Unreleased] — GitHub documentation and metadata reconciliation (2026-09-19)

- Owner requested a comprehensive GitHub/documentation refresh before P5.8.
- Refresh `README.md`, current handoff, roadmap, Phase 5 plan, navigation/measurement boundary, dependency register, offline architecture, security baseline and repository-structure policy through the accepted P5.7 state.
- Add `docs/GITHUB_SYNC_AUDIT_2026-09-19.md` with the 186-file tracked snapshot, current-vs-historical documentation classification, version/capability verification, locked source checksums and Phase 5 status.
- Mark `PROJECT_ARCHITECTURE.md` explicitly as the accepted historical Phase 0 architecture baseline and point current execution status to the current handoff/roadmap.
- Preserve historical reports/verification artifacts rather than rewriting old status statements as if they were current.
- Production source manifests, dependency versions, numerical engines, database data and app version are unchanged.
- Baseline before this documentation-only reconciliation: `e710075531dbdbc2fdd2ed62dde07f22786e320f`, Release Acceptance Gates #397 SUCCESS.
- P5.8 and Phase 6 remain NOT STARTED. No merge, tag or release.


## [Unreleased] — P5.7 owner acceptance closure (2026-09-19)

- Owner reported «نجحت جميع اختبارات P5.7». Record manual result PASS — REPORTED BY OWNER.
- P5.7 closes with CI #383 and CI #387 SUCCESS.
- Homogeneous numeric differences remain gated by P5.5 plus matching adapter domain/output structure; incompatible cross-model pairs expose no numeric delta.
- Future time/layer/route service contracts remain explicitly unavailable; no later engine is implied.
- P5.8 Versioned Local State Persistence is next but NOT STARTED. Phase 6 route/ruler/area remains NOT STARTED.
- Full Phase 5 remains in progress; no merge, tag or release. Accepted app version remains 0.4.0.


## [Unreleased] — P5.7 automated verification (2026-09-19)

- P5.7 implementation/documentation head `6b21fbf78494335ca5cbec4c4c75a634b475cfac` passed Release Acceptance Gates #383.
- CI reports 0 npm vulnerabilities, 78 frontend core tests, 2 PWA tests and 15 Chromium scenarios PASS, plus production build/parity/Docker/PostGIS/Redis/source/search gates.
- Homogeneous differences additionally fail closed when adapter domains or output structures differ.
- Owner manual P5.7 verification remains NOT RUN; P5.7 is not closed. P5.8 and Phase 6 are not started.


## [Unreleased] — Phase 5 / P5.7 homogeneous differences and future contracts (2026-09-19)

- Owner instructed «أكمل» after P5.6 closure. Start P5.7 only.
- Add signed homogeneous differences (`right - left`) only after the P5.5 comparability contract passes; incompatible pairs expose no numeric delta.
- Keep Gleason differences in `normalized-radius` and AE/WGS84 compatible differences in their declared units; no normalization or unit conversion is introduced.
- Add versioned future-service boundaries for time/astronomy, cross-model layer synchronization and route/measurement. All are explicitly unavailable in Phase 5.
- Existing per-view layers remain available; only the future shared layer-sync service is unavailable.
- Route drawing, distance, ruler and area remain Phase 6; P5.8 persistence is not started.
- Add core/browser regression coverage and `docs/PHASE_5_P5_7_REPORT.md`. Automated/owner PASS is not claimed until verification completes.


## [Unreleased] — P5.6 owner acceptance closure (2026-09-19)

- Owner reported «نجحت كل الاختبارات». Record manual result PASS — REPORTED BY OWNER.
- P5.6 closes with CI #329 and CI #340 SUCCESS.
- Independent navigation/focus/zoom/rotation behavior remains accepted for this slice; canonical geographic selection is preserved by navigation.
- P5.7 is next but NOT STARTED. Phase 6 routes/ruler/area remain NOT STARTED.
- Full Phase 5 remains in progress; no merge, tag or release. Accepted app version remains 0.4.0.


## [Unreleased] — Phase 5 / P5.6 navigation (2026-09-19)

- Owner instructed «أكمل» after P5.5 closure. P5.6 is the only active slice.
- Reconcile already-present navigation commits with the canonical documentation instead of duplicating implementation.
- Deliver independent camera navigation for Gleason/AE/WGS84: zoom controls, wheel, touch/pinch, zoom-to-area, rotation/view-direction where meaningful, reset, fit-full and focus-selected.
- Preserve canonical geographic selection during camera navigation; keep zoom scales independent across models.
- WGS84 rendering/picking is zoom-aware; fallback declares unsupported 3D rotation/tilt instead of pretending support.
- Final audited implementation head `378f0a8ed6710195cb1e48e0ebcd4518116a5d0d` passed CI #329 with 0 npm vulnerabilities, 71 frontend core tests, 2 PWA tests, 14 Chromium scenarios and all release gates.
- Owner manual verification remains NOT RUN; P5.6 is not yet closed. P5.7 and Phase 6 remain NOT STARTED.


## [Unreleased] — P5.5 owner acceptance closure (2026-09-19)

- Owner reported «نجحت جميع اختبارات P5.5». Record manual result PASS — REPORTED BY OWNER.
- P5.5 closes with CI #266 and CI #271 SUCCESS; the contract rejects incompatible model quantities without fabricated normalization or unit conversion.
- P5.6 Optional Geographic Focus / Navigation is next but NOT STARTED.
- Full Phase 5 remains in progress; no merge, tag or release. Accepted app version remains 0.4.0.


## [Unreleased] — P5.5 automated verification (2026-09-19)

- P5.5 implementation head `1bf01cda0a1b4273b14f7d1c06a844021e575648` passed Release Acceptance Gates #266.
- CI reports 0 npm vulnerabilities, 67 frontend core tests, 2 PWA tests and 12 Chromium scenarios PASS, plus parity/build/Docker/PostGIS/Redis/locked-source/search gates.
- Owner manual P5.5 verification remains NOT RUN; P5.5 is not closed and P5.6 is not started.


## [Unreleased] — Phase 5 / P5.5 Comparability Contract (2026-09-19)

- Owner instructed «أكمل» after P5.4 closure. Start P5.5 only.
- Add a typed comparability contract requiring compatible quantity meaning, coordinate space, unit, scale basis and availability; decisions are comparable/not-comparable/unavailable with explicit reasons.
- Never convert or normalize Gleason normalized-radius into metres/kilometres. AE plane metres and WGS84 ECEF metres remain structurally different quantities despite sharing the metre unit.
- Add a bilingual Model Laboratory comparability panel plus core/browser regression tests. No numeric differences, routes, measurement engine, navigation tools or new dependencies.
- Automated/owner PASS is not claimed until the exact P5.5 revision is tested.


## [Unreleased] — P5.4 owner acceptance closure (2026-09-19)

- Owner reported the refined Model Laboratory is now clear: «القسم اصبح واضحا، اكمل التوثيق». Record manual clarity PASS — REPORTED BY OWNER, following the earlier functional PASS.
- Refined implementation head `29fa6190185ec7901c14f586ad26213337190272` passed Release Acceptance Gates #236 on attempt 6 after transient npm audit registry 400 errors on earlier attempts; successful audit found 0 vulnerabilities.
- CI #236 completed 62 frontend core tests, 2 PWA tests, 11 Chromium scenarios, parity/build/Docker/PostGIS/Redis/source/search gates.
- P5.4 is CLOSED. P5.5 Comparability Contract is next but NOT STARTED. No merge, tag or release; accepted app version remains 0.4.0.


## [Unreleased] — P5.4 usability clarification (2026-09-19)

- Owner functional checks passed, but the Model Laboratory was too technical to understand; P5.4 remains open pending clarity retest.
- Add plain-language model meaning before raw technical metadata: explain Gleason normalized coordinates, AE planar coordinates, WGS84 ECEF, and why missing ellipsoidal height blocks ECEF.
- Move model/version/evidence/domain/source/limitations into collapsed technical details without changing any calculation or adapter contract.
- Extend browser acceptance coverage for bilingual explanations, collapsed details and mobile overflow.


## [Unreleased] — Phase 5 / P5.4 Model Laboratory (2026-09-19)

- Owner instructed «ابدأ» after P5.3 closure. Add a bilingual read-only Model Laboratory for the shared geographic selection.
- Show independent Gleason/AE/WGS84 model versions, inputs, outputs, units, semantic/evidence classifications, source records, domains, notes and limitations.
- Missing WGS84 ellipsoidal height is explicitly unavailable (`height-required`); no 0 m value is fabricated. Numeric comparability remains P5.5.
- Add core/browser tests and `docs/PHASE_5_P5_4_REPORT.md`. Automated/owner acceptance is not claimed until the new revision is tested.


## [Unreleased] — P5.3 owner acceptance and tool scheduling (2026-09-19)

- Owner reports all retests PASS after CI #204 visual correction; P5.3 closed. Phase 5 acceptance remains pending, P5.4 next.
- Record requested navigation controls in P5.6 and multi-stop routes/ruler/polygon area in Phase 6; no new tool implementation in this documentation change.
- Details: `docs/NAVIGATION_MEASUREMENT_REQUIREMENTS.md`. No new tests claimed; accepted version remains 0.4.0.

## [Unreleased] — P5.3 visual corrections (2026-09-19)

- Owner reports correct synchronized readings but missing map markers. Set OpenLayers rendering targets to physical LTR coordinates independently of UI locale; add real marker-viewport checks in Arabic/English interfaces and searches.
- Add an opaque WGS84 ellipsoid surface with display-only shading beneath existing overlays; no satellite imagery, terrain, or solar lighting claim. Retain picking/drag/provenance behavior.
- Add mesh validation and WebGL framebuffer evidence; local 58 core/build/2 PWA gates PASS. Remote evidence on PR #9. P5.3 still awaits owner retest; P5.4 not started.

## [Unreleased] — Phase 5 / P5.3 (2026-09-19)

- Owner instructed continuation after successful P5.2 tests. One reducer now drives search and all model picks; each selection increments once, with no render-to-selection callback.
- Added geographic selection overlays/readouts to Gleason/AE; WGS84 consumes the common point. Preserve independent cameras and search focus behavior. Canonical points from any map can feed explicitly WGS84 A/B capture.
- Added reducer tests and an eighth browser scenario; expanded cold-offline and fallback checks. Local 49 backend, 57 core and 2 PWA tests/build PASS; final remote evidence is on PR #9.
- P5.4 laboratory UI remains pending. See `docs/PHASE_5_P5_3_REPORT.md`.

## [Unreleased] — P5.2 verification closure (2026-09-19)

- Owner reported «نجحت جميع الاختبارات» for the three delivered P5.2 checks. Recorded PASS — REPORTED BY OWNER; device/browser/local SHA not supplied.
- Closed P5.2 with implementation CI #198 on `ce73919`; full Phase 5 acceptance remains pending. P5.3 is next and not started. Documentation-only closure; no merge, tag or release.

## [Unreleased] — Phase 5 / P5.2 (2026-09-19)

- Owner confirmed Arabic city retest PASS and authorized the next slice.
- Added independent typed Gleason/AE/WGS84 adapters with model/version/kind/unit checks, domain validation, explicit height and polar conventions, immutable evidence metadata and forward/inverse operations. Gleason/AE map picks now use their respective adapter.
- Eight new tests cover 147 round trips, independent anchors, invalid inputs, cross-model misuse, height/poles and metadata isolation. Local 55 core tests, build and 2 PWA tests PASS; exact remote results are on draft PR #9.
- P5.3 synchronization and P5.4 laboratory UI remain pending; no merge, release or new dependency. See `docs/PHASE_5_P5_2_REPORT.md`.

## [Unreleased] — Arabic city search correction

- Owner reported all three delivered P5.1 checks PASS, plus an Arabic city search defect. The pinned simplified Natural Earth city source omitted multilingual names. Switch to the full 110m city dataset at the same source commit; preserve 243 canonical IDs and coordinates, import NAME_AR and update the source checksum/URL.
- Added a city-only upsert and Docker/Git Bash refresh script for existing databases; no volume deletion. Added real-source online/actual frontend offline search parity checks and repeated-update coverage in CI.
- See `docs/ARABIC_CITY_SEARCH_FIX.md` for evidence, update steps and limitations.

## [Unreleased] — Phase 5 / P5.1 (2026-09-19)

- Owner explicitly started Phase 5: «ابدأ المرحله الخامسة», superseding the earlier hold. Phase 4 remains accepted; no Phase 5 acceptance is implied.
- Added a versioned typed WGS84 geographic selection with optional ellipsoidal height and immutable source/place identity. Free picks clear all previous place metadata, including on Gleason/AE maps.
- Replaced separate React point/place states with one selection; focus application no longer emits a fake user pick. Reject invalid geographic domains without silent normalization.
- Fixed stale Phase 4 acceptance text in the footer. Capabilities report implementation phase 5, accepted phase 4 and in_progress, with cross-model synchronization still false.
- Added seven contract tests and a browser regression for search-to-free-point transitions across all three models. See `docs/PHASE_5_P5_1_REPORT.md` for actual results.
- Owner authorized upload and CI; implementation `e64d223` passed CI #192 including all seven Chromium scenarios (33.7s), Docker/PostGIS/Redis/production-source gates and numerical parity. Draft PR #9 is open and unmerged. No new dependencies, release/tag or merge. P5.2–P5.9 remain pending; package version remains the last accepted 0.4.0.

## [0.4.0] — accepted application version (2026-09-18)

- Owner reported all corrected-build manual tests PASS and explicitly accepted Phase 4. Recorded the exact decision and evidence in `docs/PHASE_4_ACCEPTANCE.md`.
- Aligned VERSION, backend/frontend package metadata and dependency locks to 0.4.0; capabilities now report `accepted_phase=4` and `phase_status=accepted` while synchronization/astronomy remain unavailable.
- Phase 5 remains NOT STARTED and ON HOLD until an explicit owner instruction to start it. Phase 4 acceptance does not lift this hold.
- No PR merge, tag or GitHub Release was created by acceptance. CI #188 on `a0a8e29` validates the build supplied for owner review; the acceptance commit has its own CI check.

### Approved Phase 4 corrections

- M1: correct geodetic WGS84 picking, geographic markers, rear visibility and fallback letterboxing; retain inverted drag.
- M2: independent offline WGS84 geodesics/ECEF, backend parity gate, compiled-asset precache with content versioning.
- M3: keep layer controls accessible on mobile and preserve legible 3D/2D labels with decluttering.
- M4: align application version surfaces and separate implemented capabilities from owner acceptance.
- M5: preserve source/version/record/classification through search, HTTP/CLI packs and selection; retain legacy packs with unknown metadata.
- M6: lock npm/Python installations, prevent stale results/pack writes, refresh installed features, and add browser acceptance gates.
- M7/M8: reconcile phases 0–22 and Phase 5/6 scope, record actual renderer and retain approved future UX/performance requirements.
- Verification: 49 backend + 40 frontend core + 2 PWA tests and numerical parity pass locally and in CI #186; all six Chromium scenarios and Docker/PostGIS/Redis/production-source/API-CLI parity gates pass on uploaded snapshot `fb4dcab`.
- Owner explicitly authorized upload and CI without merge or release; seven exact-content commits uploaded to the existing Phase 4 branch. PR #8 remains draft and unmerged; owner subsequently reported manual review PASS.
- Owner approved M1–M8 and subsequently accepted Phase 4. M8 remains planned future scope.

### Phase 4 implementation history
### Started
- Phase 4 authorized by owner on 2026-09-17.
- Added `docs/PHASE_4_PLAN.md` defining the WGS84 Reference Model scope, provenance rules, delivery slices, acceptance gates, and explicit Phase 5 boundary.
- Implementation branch: `feat/phase4-wgs84-reference`.
### Boundary
- No Phase 5 synchronization/comparison work is included.
- Solar/lunar/planetary astronomy remains outside Phase 4.

### P4.7
- Added antimeridian and near-antimeridian WGS84 regression tests.
- Added Docker runtime smoke checks for WGS84 metadata, ECEF conversion, antimeridian geodesic, and invalid-longitude rejection.
- Added service-worker syntax validation and Phase 4 PWA cache rotation to `gleason-shell-v0.4.0-rc1`.
- Added `docs/PHASE_4_REPORT.md` as the pre-acceptance hardening report.
- Added and locked inverse horizontal globe drag behavior: pointer right rotates the globe left; pointer left rotates the globe right.
- GitHub Actions run #177 passed after retrying a transient Docker Hub authorization/network failure; all code/test/build/PWA gates had passed before the transient failure.
- Owner manual regression checks passed, including the final drag-direction change.
- P4.7 was technically complete before the later acceptance recorded above. Phase 5 remains excluded under the owner's explicit hold.

### P4.6
- Added persistent WGS84 globe layer controls backed by IndexedDB.
- Added country boundaries plus cached Phase 3 oceans, seas, rivers, cities, and saved regional airports.
- Added continent/country/marine/city/airport labels with front-hemisphere filtering, responsive sizing, and collision suppression.
- Corrected external-globe east/west orientation and matching geographic picking.
- Added equivalent 2D fallback presentation for the reference layers and labels.
- Documented that global airports remain excluded from the core-world pack and appear from installed regional packs.
- Owner manual checks passed for layers, labels, saved airports, offline behavior, responsive sizing, and 2D fallback.
- GitHub Actions run #155 passed after correcting the frontend core-test Vite typing configuration.

## [0.3.0] - 2026-09-17
### Added
- Phase 3 PostGIS/pg_trgm place catalog and unified search foundation.
- Locked Natural Earth and OurAirports production-source import pipeline with SHA-256 verification and coordinate provenance classifications.
- English/Arabic search over real source-derived records.
- Deterministic core-world and country offline-search pack generation with CI artifact evidence.
- Offline-search API routes and direct regression tests.
- High-severity npm security gate in release acceptance CI.
### Changed
- Capacitor 7 dependencies updated from `7.0.0` to `7.6.9`.
- Vite updated from `6.2.0` to `6.4.3` to clear audited High severity advisories.
- Arabic CI search smoke test uses URL-encoded query parameters.
- Release version finalized from `0.3.0-dev` to `0.3.0` after owner acceptance.
### Validation
- GitHub Actions run `35226135102` (run #86) passed backend/frontend tests, `npm audit --audit-level=high`, production build, Docker/PostGIS/Redis runtime, real-source imports/search, offline pack generation and frontend HTTP checks on the pre-acceptance technical head.
- Owner manual acceptance passed for `Qatar`, `Doha`, `DOH`, English/Arabic search, offline search, and responsive/mobile-size UX.
- Owner explicitly accepted Phase 3 on 2026-09-17.
### Notes
- Local Windows acceptance testing revealed developer-experience friction around old Python aliases, Git Bash `/tmp` path conversion, occupied local ports, and the explicit production-data import workflow. These are documented in `docs/PHASE_3_REPORT.md` and are non-blocking maintenance items.
- Phase 4 is not started by this release.

## [0.2.0] - 2026-09-09
### Added
- Source-grounded Gleason Historical projection `GH-0.2.0`.
- Independent WGS84 north-polar AE provider `AE-0.2.0`.
- Projection APIs, source catalog, interactive OpenLayers maps, offline Core World Pack, Source Viewer and affine georeferencing engine.
- Python/TypeScript Phase 2 validation tests and mathematical/dependency documentation.
### Changed
- Release advanced to v0.2.0 and capabilities advertise only implemented Phase 2 features.
- Service Worker cache includes the Phase 2 offline pack manifest.
### Explicit limitation
- No verified distributable standalone historical scan is embedded; scan control points are not fabricated.

## [0.1.0] - 2026-09-09
### Added
- Phase 1 monorepo, FastAPI/React/Vite/PWA foundation, Docker/PostGIS/Redis, RTL/LTR and tests.
### Changed
- Repository permanently normalized into backend/frontend/data/database/docs domains with CI structure guard.
