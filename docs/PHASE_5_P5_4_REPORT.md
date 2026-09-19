# P5.4 — Basic Model Laboratory inspector

Started 2026-09-19 after the owner's explicit instruction «ابدأ» following the P5.3 acceptance handoff. P5.3 remains closed. Phase 5 remains in progress; P5.5 is not started by this slice.

## Scope and behavior

P5.4 adds a read-only Model Laboratory driven by the existing canonical `GeographicSelection`. Every model receives the same WGS84 latitude/longitude input independently through its P5.2 adapter. The laboratory displays:

- canonical input, selection origin and place/source identity when present;
- model ID and model version;
- output kind and numeric components;
- declared units, semantic result classification and evidence level;
- domain and height policy;
- source/evidence records, computation notes and limitations;
- explicit unavailable state and adapter error code when an operation cannot be performed for the current input.

No cross-model numeric comparison, difference calculation, unit conversion or normalization is performed here. Those rules belong to P5.5/P5.7.

## Important WGS84 height rule

Most current search/free-point selections contain latitude/longitude but no ellipsoidal height. The P5.2 WGS84 adapter requires explicit ellipsoidal metres for ECEF and rejects missing height. P5.4 therefore reports `height-required` and does **not** invent 0 m.

This intentionally differs from the older WGS84 globe readout's explicitly labeled surface-height display convention. The laboratory follows the adapter contract and exposes the missing datum rather than hiding it.

## Files

- `frontend/src/comparison/modelLaboratory.ts`
- `frontend/src/comparison/ModelLaboratory.tsx`
- `frontend/src/App.tsx`
- `frontend/src/styles.css`
- `frontend/tests/model-laboratory.test.mjs`
- `frontend/tests/e2e/acceptance.spec.ts`
- `frontend/tsconfig.core.json`

No new dependency, external dataset or historical interpretation is introduced.

## Verification state at implementation commit preparation

Automated checks are not claimed PASS before the exact remote revision runs. Owner manual checks are **NOT RUN** at this point.

## Owner manual checklist

1. Search for الدوحة/Doha and open the Model Laboratory. Verify three model cards use the same latitude/longitude input.
2. Verify Gleason is available with GH-0.2.0, normalized-radius, COMPUTED_RESULT/DERIVED and the Gleason source reference.
3. Verify AE is available with AE-0.2.0, metres and REFERENCE_RESULT.
4. Verify WGS84 ECEF is explicitly unavailable for the ordinary search point, showing missing ellipsoidal height / `height-required`; it must not display a fabricated 0 m ECEF laboratory result.
5. Pick free points on Gleason, AE and WGS84. The laboratory must update to the current shared point without changing camera behavior.
6. Switch Arabic/English and test a phone-sized window. Technical IDs, versions, units and source classifications must remain visible and the layout must not overflow horizontally.

Acceptance criterion: the user can understand the origin, meaning, unit, version, evidence and limitations of every displayed model output, and missing or unsupported operations are explicit.

Sources: `PHASE_5_PLAN.md`, `ROADMAP_CURRENT.md`, P5.2 adapter contracts, P5.3 shared selection, `MATHEMATICAL_REFERENCES.md`, and the locked Gleason source registry. No P5.5 comparability claim is made.


## UX clarification refinement — 2026-09-19

The owner reported that all delivered P5.4 functional checks passed, but the
laboratory's visible results were too technical to understand or use. Therefore
P5.4 was **not closed** at that point: the acceptance criterion requires the
meaning and limits of each displayed result to be understandable.

The owner approved an in-slice usability refinement. No formulas, adapters,
model outputs, units or source classifications are changed. The visible cards
now explain in plain Arabic/English:

- one canonical geographic point is being represented independently by three
  systems;
- Gleason X/Y are normalized map coordinates, not metres/kilometres and not an
  inter-place distance;
- AE X/Y are planar projection coordinates in metres relative to the projection
  origin, not an inter-place distance;
- WGS84 ECEF X/Y/Z are 3D position components when explicit ellipsoidal height
  exists;
- when height is missing, WGS84 ECEF remains unavailable and the app states
  that it did not assume a fictitious 0 m height.

Model/version/unit/semantic/evidence/domain/source/notes/limitations remain
available under a collapsed «إظهار التفاصيل التقنية / Show technical details»
section.

Automated regression now verifies the plain-language explanation, the collapsed
technical section, WGS84 missing-height explanation, bilingual content and
mobile horizontal overflow. Owner retest of this refined revision is still
**NOT RUN** until the new CI revision is delivered.
