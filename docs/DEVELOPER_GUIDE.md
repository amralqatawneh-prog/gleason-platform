# Developer Guide

Status: **LIVING DOCUMENT — updated with future slices**

## 1. Purpose

This guide explains how to extend Gleason Comparison Platform without violating
its model-independence, provenance and fail-closed rules.

The accepted Phase 0 historical architecture remains in `PROJECT_ARCHITECTURE.md`.
Current execution truth lives in `docs/PROJECT_HANDOFF_CURRENT.md`,
`docs/ROADMAP_CURRENT.md` and the active phase plan.

## 2. Core architectural invariant

The three engines remain independent:

- Gleason Historical
- AE Visualization
- WGS84 Reference

Share only canonical geographic identity when a feature requires cross-view
coordination. Do not share screen pixels, another model's projected x/y, camera
state or native numerical output as though it belonged to another model.

## 3. Result identity

Every material numerical result should make these concepts recoverable:

- quantity;
- computation method;
- computation model;
- calculation/reference space;
- unit;
- scale basis;
- semantic class;
- source/provenance;
- algorithm/provider version;
- known limitations.

## 4. Comments and docstrings

Do not comment every line.

Add comments/docstrings when they explain:
- non-obvious mathematical reasoning;
- units/CRS/reference frames/time scales;
- historical-source interpretation;
- provenance/licensing restrictions;
- fail-closed boundaries;
- deliberate implementation trade-offs;
- difficult edge cases or browser/GPU workarounds.

Prefer expressive names and small typed functions for obvious mechanics. Update or
remove comments when behavior changes.

## 5. Provider architecture

Future external integrations should normally follow:

`Upstream Provider → Adapter → Normalizer → Provenance/Freshness → Cache/Offline
Policy → Canonical Layer/Route/Celestial State → Model Adapter → Renderer`.

Never let a normalization adapter erase timestamp, provider identity, license or
field meaning.

See `docs/SHARED_CONTEXT_PROVIDER_CONTRACTS.md`.

## 6. Measurement architecture

Current implemented measurement identities:
- WGS84: `wgs84-geodesic`
- AE: `ae-projected-plane`
- Gleason: `gleason-native-normalized`

P6.6, now closed/verified/merged through PR #31, adds closed-polygon perimeter and area to all three identities. The
canonical ring reuses ordered geographic vertices and closes implicitly from the
last vertex to the first. WGS84 uses signed ellipsoidal geodesic polygon area;
AE and Gleason use signed shoelace area after their own independent forward
projection. Self-intersection is algebraic, repeated explicit coordinates are
rejected, and zero-area method-native geometry fails closed.

Gleason distance is Euclidean distance between adjacent GH-0.2.0 projected
endpoints in the derived normalized-radius plane. Its contract unit is
`normalized-radius-unit` with scale basis `gleason-normalized-model-radius`.
Do not convert Gleason normalized units to SI units without a separately
documented scale rule/assumption.

The P6.2 ordered polyline is not automatically a road route. P6.6 may interpret
the same ordered vertices as a separately labeled closed polygon; this does not
change the P6.3–P6.5 open-polyline distance semantics. See
`docs/PHASE_6_P6_6_POLYGON_SEMANTICS.md`.

## 7. Astronomy architecture

Future astronomy must use the approved `CelestialComputationProvider` identity
envelope and distinguish:
- `reference-ephemeris`;
- `historical-cycle`;
- `external-comparative-model`;
- `model-native`;
- `display-only`.

Topocentric results depend on both `ObserverContext` and `TimeContext`.

The project also distinguishes:
- `ObserverCelestialSphere`: a mathematical/topocentric visualization surface;
- `PhysicalHeavensModel`: a separately specified physical/model-native
  interpretation, if one is later implemented.

A dome-shaped renderer does not convert a reference or external result into a
physical-dome claim.

### 7.1 Comparative astronomy sources

Planning registry:
`data/sources/astronomy-comparative-sources.yaml`.

Shane's Personal Celestial Sphere model and Walter Bislin's upstream FE-Dome
implementation are registered as separate comparative/provenance sources. Their
conflicting interpretation of the computation basis must not be collapsed into
one source claim.

Before runtime code reuse:
- pin exact source snapshot/revision;
- record hash;
- audit formulas/dependencies;
- re-check exact-file license/attribution;
- add deterministic fixtures.

### 7.2 Eclipse providers

Future eclipse calculations use `EclipsePredictionProvider` capabilities rather
than assuming every engine can produce the same fields.

A Babylonian 223-month/Saros historical-cycle engine may produce recurrence,
family and historically supported timing/possibility outputs. It may not invent a
precise local ground path merely because a modern reference provider can produce
one.

Modern reference, historical-cycle, external-comparative and model-native results
must remain separately attributable in tests, APIs and UI.

## 8. Testing expectations

A feature is not complete merely because its happy path renders.

Depending on scope, cover:
- browser + offline;
- Arabic/English;
- desktop/mobile/touch;
- polar/antimeridian edge cases;
- repeated/invalid input;
- backend/browser parity;
- provider unavailable/stale state;
- missing optional data;
- persistence/version migration;
- WebGL fallback;
- provenance/method/unit labels.

## 9. Documentation done criterion

A future slice that changes user-visible behavior, numerical semantics, provider
contracts or persistence must update the relevant living guides:
- this Developer Guide;
- `docs/USER_GUIDE.md`;
- `docs/CALCULATION_REFERENCE.md`.

Phase 21 is final consolidation and verification, not deferred first-writing.
