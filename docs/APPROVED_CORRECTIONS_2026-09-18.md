# Approved audit corrections — 2026-09-18

Owner decision: «نعم موافق، وموافق على المقترحات» — all eight proposals approved.

This is approval of corrections and planning, **not Phase 4 acceptance**. Phase 5 remains NOT STARTED. Historical acceptance evidence remains historical; manual checks on the changed build must be recorded separately.

| ID | Approved scope | Execution/status |
|---|---|---|
| M1 | Geodetic ellipsoid rendering/picking; correct geographic marker; reject outside clicks | IMPLEMENTED; automated checks PASS |
| M2 | Offline WGS84 geodesics and coordinate conversion; PROJ parity; complete versioned PWA precache | PENDING |
| M3 | Accessible mobile layer controls and legible, decluttered labels | PENDING |
| M4 | Consistent application version/capabilities; retain v0.3.0 accepted release until Phase 4 acceptance | PENDING |
| M5 | Preserve source identity/version/record/classification through search, packs and selection | PENDING |
| M6 | Locked installations and meaningful offline/browser/regression acceptance gates | PENDING |
| M7 | One roadmap through Phase 22; precise Phase 5/6 boundary; documented renderer decision | PENDING |
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
