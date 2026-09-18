# Phase 4 Delivery Plan — v0.4.0

**Current update — 2026-09-18:** v0.4.0 is the target release, not an accepted release. Owner-approved M1–M6 corrections are implemented locally; new remote browser/Docker gates remain pending permission to push. See `APPROVED_CORRECTIONS_2026-09-18.md` and `PHASE_4_CORRECTIONS_TEST_REPORT.md`. Historical slice completion below does not certify the changed build. M7/M8 roadmap: `ROADMAP_CURRENT.md`.

## Scope from accepted architecture

Phase 4 introduces the independent **WGS84 Reference Model** and its reference-geodesy visualization/runtime. It remains strictly separate from the existing **Gleason Historical Model** and **AE Visualization Model**.

Phase 4 is limited to:

1. WGS84 geodetic reference engine.
2. WGS84 geodetic ↔ ECEF coordinate conversion.
3. Reference geodesic distance and bearing calculations.
4. A dedicated WGS84 globe/reference view with graceful 2D fallback when 3D/WebGL is unavailable.
5. Rendering/selecting Phase 3 place data on the WGS84 reference view.
6. Provenance and reproducibility metadata for all reference results.
7. Regression coverage that keeps Phases 1–3 green.

Phase 4 explicitly does **not** include:

- Cross-model synchronization between Gleason, AE and WGS84; that remains Phase 5.
- Solar/lunar/planetary astronomy, ephemerides, eclipses, twilight laboratories, or day/night overlays.
- Hidden normalization intended to make different models agree.
- Reclassification of any Gleason historical claim as a modern reference result.

## Semantic and provenance rules

Every WGS84 numeric output introduced in this phase must be emitted as `REFERENCE_RESULT` and include enough metadata to reproduce the result, including where applicable:

- model/provider id and version,
- CRS/reference frame identifier,
- algorithm or operation name,
- input coordinates,
- output units,
- library/provider version when material,
- precision/known limitation notes.

Existing source semantics remain unchanged:

- `SOURCE_TEXT`
- `SOURCE_CLAIM`
- `COMPUTED_RESULT`
- `REFERENCE_RESULT`

No Phase 4 code may silently convert a historical claim into a reference fact.

## Technical reference policy

The WGS84 engine will use standard geodetic reference definitions and established geospatial libraries already compatible with the project stack. Backend calculations are authoritative for Phase 4 acceptance; 3D rendering is a visualization layer and must not become the source of geodetic truth.

Reference coordinate domains:

- Geographic latitude/longitude/ellipsoidal height using WGS84.
- Earth-Centered, Earth-Fixed (ECEF) Cartesian coordinates for deterministic 3D positioning.
- Geodesic inverse calculations for ellipsoidal distance and forward/reverse azimuths.

The existing AE model remains an independent visualization/projection engine even though it also consumes WGS84 geographic coordinates.

## Delivery slices

### P4.1 — WGS84 provider foundation

Backend provider with a stable model id and version.

Required operations:

- Validate latitude, longitude and ellipsoidal height inputs.
- Normalize longitude only through an explicit documented operation.
- Geodetic → ECEF conversion.
- ECEF → geodetic conversion.
- Ellipsoidal inverse geodesic: distance, initial bearing and final/reverse bearing.
- Deterministic result envelopes carrying `REFERENCE_RESULT` provenance.

Candidate backend locations:

- `backend/app/providers/reference/wgs84.py`
- `backend/app/models/reference.py`
- focused API/service modules under the existing backend architecture.

### P4.2 — Reference API

Add explicit WGS84 reference endpoints without changing the semantics of Phase 2 projection endpoints.

Minimum API surface:

- provider metadata,
- geodetic-to-ECEF,
- ECEF-to-geodetic,
- geodesic inverse between two geographic points.

Requirements:

- schema-validated inputs,
- deterministic JSON output,
- explicit units,
- provenance object on every numeric result,
- documented error behavior for invalid coordinates.

### P4.3 — Reference globe and fallback UI

Add a dedicated WGS84 reference workspace/view.

Requirements:

- interactive WGS84 ellipsoid/globe visualization,
- no calculation logic hidden solely in the rendering engine,
- Phase 1 capability detection honored,
- graceful 2D reference fallback if WebGL/3D is unavailable,
- Arabic/English and RTL/LTR retained,
- responsive desktop/mobile behavior,
- selected latitude/longitude shown numerically.

The 3D library is a visualization dependency only; reference coordinate conversion remains in the shared/reference calculation layer.

### P4.4 — Phase 3 place integration

Use the canonical Phase 3 place records on the WGS84 reference view.

Requirements:

- selecting a search result can locate the same canonical place id on the reference view,
- country/city/airport and other Phase 3 categories keep their existing source provenance,
- no pixel-coordinate synchronization with Gleason/AE,
- no Phase 5 cross-model camera synchronization.

### P4.5 — Geodesic inspector

Add a focused reference inspector for two selected geographic points.

Minimum outputs:

- ellipsoidal geodesic distance,
- initial azimuth,
- reverse/final azimuth representation with clearly documented convention,
- units and provider metadata,
- reproducible input coordinates.

This is a WGS84 reference feature only; comparison against Gleason/AE outputs is deferred to the later comparison phase.

### P4.6 — Offline and persistence contract — COMPLETE

Phase 4 deterministic coordinate/geodesic commands must work without network access after the app shell is installed.

Requirements:

- no online service required for core WGS84 mathematics,
- existing offline Phase 2/3 packs remain valid,
- reference calculations do not mutate Phase 3 source records,
- any new cached visualization assets are versioned through the existing PWA/offline mechanisms.

### P4.7 — Validation and release hardening — COMPLETE

Add backend, frontend and Docker acceptance gates for Phase 4 while retaining all Phase 1–3 gates.

Test classes include:

- known geodetic/ECEF anchors,
- round-trip geodetic ↔ ECEF tolerance checks,
- antimeridian handling,
- poles and equator,
- identical-point geodesic case,
- long-distance geodesic case,
- invalid latitude/longitude rejection,
- provenance completeness,
- 3D capability fallback behavior,
- Phase 3 search regression,
- Phase 2 projection regression.

## Acceptance criteria

Phase 4 may be proposed for owner acceptance only when all of the following are satisfied:

1. WGS84 provider is independent from Gleason Historical and AE providers.
2. Geodetic ↔ ECEF conversion passes deterministic backend tests within documented tolerances.
3. Ellipsoidal distance and bearings pass locked reference tests within documented tolerances.
4. Every Phase 4 numeric output is labeled `REFERENCE_RESULT` and includes reproducibility/provenance metadata.
5. Invalid coordinate inputs fail explicitly and predictably.
6. Production frontend builds and the WGS84 reference workspace renders successfully in a supported 3D browser.
7. A tested 2D fallback is used when required 3D capability is unavailable.
8. Phase 3 place search can locate canonical place records on the WGS84 view without changing place ids or source provenance.
9. Core WGS84 math works offline.
10. Existing Phase 1, Phase 2 and Phase 3 automated gates remain green.
11. Docker/PostGIS/Redis runtime remains healthy.
12. High-severity dependency security gate remains green.
13. Owner manual checks pass on desktop and responsive/mobile-size layouts.
14. Owner explicitly accepts Phase 4 before any Phase 5 work begins.

## Manual owner acceptance checklist

At minimum the owner will verify:

1. WGS84 globe/reference view opens and is usable on desktop.
2. Responsive/mobile-size layout remains usable.
3. Search for a known country, city and airport can locate the corresponding Phase 3 place on the WGS84 view.
4. A two-point geodesic calculation returns distance/bearing data with visible units and reference provenance.
5. Offline mode still permits core WGS84 coordinate/geodesic calculations.
6. No blocking visual or functional defects are present.

## Phase boundary

Phase 5 synchronization/comparison work is forbidden on the Phase 4 implementation branch unless the owner explicitly changes the accepted roadmap.

## Status

**READY FOR OWNER ACCEPTANCE — P4.1 through P4.7 complete. Phase 4 is not accepted until the owner explicitly accepts it.**

Implementation branch: `feat/phase4-wgs84-reference`.

Release target after acceptance: `v0.4.0`.
