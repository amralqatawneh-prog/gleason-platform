# Approved audit corrections — 2026-09-18

Owner decision: «نعم موافق، وموافق على المقترحات» — all eight proposals approved.

This is approval of corrections and planning, **not Phase 4 acceptance**. Phase 5 remains NOT STARTED. Historical acceptance evidence remains historical; manual checks on the changed build must be recorded separately.

| ID | Approved scope | Execution/status |
|---|---|---|
| M1 | Geodetic ellipsoid rendering/picking; correct geographic marker; reject outside clicks | IMPLEMENTED; automated checks PASS |
| M2 | Offline WGS84 geodesics and coordinate conversion; PROJ parity; complete versioned PWA precache | IMPLEMENTED; automated checks PASS |
| M3 | Accessible mobile layer controls and legible, decluttered labels | IMPLEMENTED; automated checks PASS |
| M4 | Consistent application version/capabilities; retain v0.3.0 accepted release until Phase 4 acceptance | IMPLEMENTED; automated checks PASS |
| M5 | Preserve source identity/version/record/classification through search, packs and selection | IMPLEMENTED; automated checks PASS |
| M6 | Locked installations and meaningful offline/browser/regression acceptance gates | IMPLEMENTED; local and remote CI #186 PASS, including six browser tests and Docker/source gates |
| M7 | One roadmap through Phase 22; precise Phase 5/6 boundary; documented renderer decision | COMPLETE; see ROADMAP_CURRENT.md |
| M8 | Professional comparison/research/presentation UX, export 9:16, GPU reuse and performance/context recovery | APPROVED FUTURE BACKLOG; not implemented here |

## Validation record

Each completed slice below will state the checks actually run, evidence, limitations and remaining manual checks. No unperformed check is PASS or implicitly waived.

## Implementation boundary

- Preserve independent Gleason Historical, AE Visualization and WGS84 Reference engines and source semantics.
- Use WGS84 ellipsoidal mathematics; do not substitute spherical distance approximations.
- Backend PROJ results remain the acceptance reference for independently reproducible offline calculations.
- Preserve existing Phase 3 packs; unknown legacy provenance stays explicitly unknown.
- Do not merge, tag v0.4.0, or begin Phase 5 before explicit Phase 4 acceptance.

### M1 — geographic picking and marker (implemented)

- Shared geodetic WGS84 surface formula and 0.78 clip scale for rendering, labels, marker and ray/ellipsoid picking.
- Marker follows the geographic selection during rotation and hides on the rear side; rear line/point fragments are also filtered.
- SVG fallback accounts for letterboxing; outside clicks are ignored. Pointer cancellation cannot leave a stuck drag.
- Preserved the owner-approved inverted horizontal drag.
- Validation: **32/32 frontend core tests PASS**, production build PASS. New tests cover more than 900 visible point projections across rotations/aspect ratios, an independent PROJ mid-latitude ECEF anchor, the old off-center error, the invisible outer ring, marker movement/back visibility and fallback margins.
- Manual visual check on the changed revision: **NOT RUN**. Required later with corrected build.
- Remaining build warning: existing bundle exceeds 500 kB; performance work is tracked under M8.

### M2 — independent offline WGS84 and complete precache (implemented)

- Added pinned GeographicLib JS 2.2.0 ellipsoidal inverse geodesics and existing proj4js 2.22.0 ECEF conversions, with explicit browser provenance and coordinate validation.
- Online geodesic requests retain backend results; offline/unavailable-server requests use the independent local engine. Height is ignored by surface geodesics and identified as ellipsoidal for ECEF. Exact/near-antipodal cases are supported. Local ECEF inverse explicitly rejects the undefined geocentre neighbourhood (<1 m radius).
- Current-point ECEF readout works locally. The local provider exposes both forward/inverse conversion commands.
- Build generates a precache manifest containing all compiled JS/CSS and shell assets. Cache names use the accepted application version plus a content hash. Installation is atomic; updates wait for existing clients to close; only this application's old shell caches are removed.
- Validation: **36/36 core tests PASS**, **2/2 generated-PWA tests PASS**, production build PASS. Worker tests use a clearly synthetic in-memory cache/network harness; actual browser/server-stop checks follow in M6.
- `scripts/check_reference_parity.py`: **1,082 geodesics + 27 ECEF round trips PASS** against installed pyproj 3.8.0. Maximum differences: distance 3.73e-9 m; bearing 2.51e-12 degrees; forward ECEF 0 m; inverse height 8.91e-7 m.
- Physical-device offline/manual visual checks on changed revision: **NOT RUN**.

Technical sources: [GeographicLib JavaScript](https://github.com/geographiclib/geographiclib-js), [PROJ Cartesian conversion](https://proj.org/en/stable/operations/conversions/cart.html), and pinned package source in the dependency lockfile. Backend provider remains the parity authority.

### M3 — mobile controls and label legibility (implemented)

- Removed the rule that hid the layer panel on narrow screens. Native expandable controls remain available to keyboard and touch users, with 44 px minimum targets.
- Labels retain a 12 CSS px minimum; continent names remain larger than country names. Priority-based decluttering reduces density and excludes clipped labels instead of shrinking them to unreadable sizes.
- Applied the same legibility/decluttering policy to the SVG fallback, accounting for its actual display scale.
- Validation: **37/37 core tests PASS**, production build PASS. Mobile browser interaction checks are included in M6; physical-device visual checks: **NOT RUN**.

### M4 — release identity and capability truth (implemented)

- API root, health, OpenAPI and capabilities obtain the application version from backend package metadata; the UI obtains it from frontend package metadata at build time.
- CI compares VERSION, both packages and npm lock metadata; it no longer hardcodes the accepted v0.3.0 value as a permanent future gate.
- Capabilities correctly identify implemented Phase 3/4 features and separately expose `accepted_phase=3`, `phase=4`, `phase_status=awaiting-owner-acceptance`. Astronomy/synchronization remain false.
- Removed stale Phase 2/P4.6 progress language from the main interface. Independent model versions are unchanged. No v0.4.0 release, tag or merge was performed.
- Validation: **8/8 API tests PASS**, metadata consistency PASS, production build PASS.

### M5 — provenance across online/offline paths (implemented)

- Search responses preserve `coordinate_classification` from database quality metadata. Both HTTP packs and the production CLI use one serializer for source id/name/version/license/URL, source record id and coordinate classification.
- The pack schema remains backward-compatible v1, with an additive `provenanceRevision=2`. Existing packs continue to load; missing source versions/classifications are explicitly unknown in selection/readout, never inferred from category.
- The geographic inspector displays provenance fields and the source link. A new freehand geographic selection clears stale place identity.
- Validation: **14/14 focused backend tests PASS**, **40/40 frontend core tests PASS**, production build PASS. Tests compare online/offline identities, preserve derived classifications and reject malformed/mismatched source metadata. Production PostgreSQL/CLI validation subsequently passed in CI #186.

### M6 — repeatable installations and regression gates (implemented; CI PASS)

- Added complete npm/uv dependency locks; Docker/CI use `npm ci` and `uv sync --locked`. Build tools are pinned. Docker ignores host dependencies so Linux/macOS/Windows installations cannot overwrite container dependencies.
- Recapturing A/B invalidates in-flight results. Pack writes use one IndexedDB read/write transaction, and committed installations refresh the globe immediately. Obsolete async layer loads cannot replace the current layer selection.
- Added six Chromium acceptance scenarios: first install/cold offline navigation with BOTH HTTP servers stopped; geographic marker rotation/picking/back visibility; mobile keyboard controls/persistence/label legibility; saved-pack reactive refresh; delayed stale geodesic response; WebGL-disabled fallback.
- Browser fixtures use the real FastAPI routes and a disposable SQLite catalog explicitly labelled TEST-ONLY. Delayed-response interception changes timing, not calculated values. Production PostGIS/source-import gates remain separate and compare API/CLI pack entries exactly.
- Local validation: locked installs PASS; **49/49 backend tests PASS**, **40/40 core frontend tests PASS**, **2/2 generated PWA tests PASS**, **1,082 + 27 parity cases PASS**, build and worker syntax PASS, E2E discovery/typecheck PASS, npm audit **0 vulnerabilities**.
- Remote validation: **CI #186 SUCCESS** on uploaded snapshot `fb4dcab447ddbb94924df46576ab9f52f64e6c22`; all **6/6 browser scenarios PASS**, Docker/PostGIS/Redis PASS, locked production imports/search/provenance PASS and API/CLI pack entries match. CI used Python 3.13.15 and Node 22.23.2 and repeated the unit/parity/build/PWA checks. See `PHASE_4_CORRECTIONS_TEST_REPORT.md` for exact evidence.
- Remaining physical-device/manual checks: NOT RUN. Existing large bundle warning and dependency deprecation warnings are recorded, not hidden.

### M7/M8 — roadmap reconciled, future enhancements retained

- `ROADMAP_CURRENT.md` is the unified 0–22 roadmap. It defines all nine Phase 5 slices and keeps the comprehensive measurement engine in Phase 6.
- ADR-014 records the current WebGL2/SVG renderer and the evaluation required before any Cesium migration. Future work includes comparison layouts, Research/Presentation and 9:16 export, semantic badges, GPU reuse, context recovery and measured performance.
- Historical Original Mode, verified scan/control points, city-level detail, planets/zodiac definitions and separate heavens/atmosphere representations are explicitly retained with prerequisites and source/assumption rules.
- Documentation implementation: 100% of approved planning scope. This is not completion or execution approval for future phases.

### Delivery status

M1–M6 implementation and automated local/remote validation are complete. After the initial permission block, the owner explicitly authorized upload and CI with «نعم اسمح». Seven commits were uploaded to `amralqatawneh-prog/gleason-platform`, branch `feat/phase4-wgs84-reference`, with identical trees and a non-force branch update; PR #8 remains draft and unmerged. [CI #186](https://github.com/amralqatawneh-prog/gleason-platform/actions/runs/35387031277) passed. Owner/device checks remain NOT RUN, and Phase 4 acceptance remains pending. Manual screenshot review was also NOT RUN because downloading the CI artifact returned HTTP 403; automated browser results are confirmed by job logs. See `PHASE_4_CORRECTIONS_TEST_REPORT.md` for the matrix, commit mapping and manual checklist.
