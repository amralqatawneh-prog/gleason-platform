# Phase 2 Acceptance Record — v0.2.0

**Phase:** 2  
**Version:** v0.2.0  
**Candidate commit:** `d7159fec11a0ec0493a7ba6d96a370de23702227`  
**Acceptance method:** Technical + source-integrity + functional + owner visual/manual acceptance  
**Status:** TECHNICAL PASS — OWNER MANUAL CHECKS PENDING

## Decision rule

Phase 2 is accepted only when:

1. every automated/technical item below is PASS;
2. source-derived statements are correctly classified as `DOCUMENTED`, `DERIVED`, `REFERENCE`, or `DISPLAY_CONVENTION`;
3. the owner completes the manual visual/device checks;
4. known limitations are explicitly accepted rather than hidden;
5. the accepted commit is recorded and tagged `v0.2.0` only after final owner approval.

## A. Automated technical acceptance

| # | Acceptance item | Status | Evidence mechanism |
|---|---|---|---|
| A1 | Permanent repository structure remains valid | PASS | GitHub Actions structure gate |
| A2 | Python backend test suite passes | PASS | `pytest -q` in release gates |
| A3 | TypeScript/frontend core tests pass | PASS | `npm run test:core` |
| A4 | Production frontend build succeeds | PASS | `npm run build` |
| A5 | PWA/offline production artifacts exist | PASS | release artifact checks |
| A6 | Docker Compose validates | PASS | `docker compose config` |
| A7 | Full Docker stack starts successfully | PASS | `docker compose up --build -d` |
| A8 | Backend readiness succeeds on PostgreSQL | PASS | `/api/v1/ready` runtime check |
| A9 | PostGIS is installed and reachable | PASS | runtime SQL extension check |
| A10 | Redis responds | PASS | `redis-cli ping` |
| A11 | Projection API works in Docker runtime | PASS | release gate API smoke test |
| A12 | Frontend is served successfully over Docker HTTP | PASS | HTTP smoke test |

## B. Source-integrity acceptance

| # | Acceptance item | Status | Required interpretation |
|---|---|---|---|
| B1 | Gleason circular map description is tied to the uploaded book source | PASS | `DOCUMENTED` |
| B2 | 24-hour dial and radiating latitude arms are source-backed | PASS | `DOCUMENTED` |
| B3 | Figure 43 longitude-mile rule is isolated from modern WGS84 measurements | PASS | `DOCUMENTED` historical rule |
| B4 | Analytic Gleason forward/inverse formula is not falsely attributed to the book | PASS | `DERIVED` |
| B5 | Prime-meridian screen orientation is not attributed to Gleason | PASS | `DISPLAY_CONVENTION` |
| B6 | AE model is kept independent from the historical Gleason model | PASS | `REFERENCE` |
| B7 | Figure 30 is not presented as an exact astronomical equation | PASS | source explicitly states no claim of exact design/construction |
| B8 | Historical scan/control points are not fabricated | PASS | scan unavailable => calibration remains blocked |

## C. Numerical and functional spot checks

These are covered by automated projection tests and must continue to pass:

| # | Case | Expected behavior | Status |
|---|---|---|---|
| C1 | `90°N, 0°` in historical reconstruction | normalized radius = 0 | PASS |
| C2 | `0°, 0°` | normalized radius = 0.5 | PASS |
| C3 | `90°S, 0°` | normalized radius = 1.0 | PASS |
| C4 | Qatar / Cape Town / London / Equator sample points | forward → inverse round-trip within test tolerance | PASS |
| C5 | Figure 43 at `90°N` | historical longitude-degree miles = 0 | PASS |
| C6 | Figure 43 at Equator | historical longitude-degree miles = 60 | PASS |
| C7 | Figure 43 at `90°S` | historical longitude-degree miles = 120 | PASS |
| C8 | AE sample point | forward → inverse round-trip within reference tolerance | PASS |
| C9 | Point outside historical map circumference | inverse is rejected rather than silently normalized | PASS |

## D. Owner manual acceptance — required before final acceptance

These checks are intentionally not marked PASS by automation.

- [ ] **D1 — Desktop visual check:** Open the app on a desktop/laptop browser. Both Gleason Historical and AE maps render without overlap, clipping, or unusable controls.
- [ ] **D2 — Mobile/tablet responsive check:** Open the app on at least one phone or tablet. The maps, source viewer, inspector, and Arabic RTL layout remain usable.
- [ ] **D3 — Interaction check:** Click/tap several points on both maps. Latitude/longitude values appear sensibly and the interface remains stable.
- [ ] **D4 — Source transparency check:** Open the Source Viewer and confirm that `DOCUMENTED`, `DERIVED`, and `REFERENCE` are visually distinguishable and understandable.
- [ ] **D5 — Offline check:** Load the application once, disconnect the network, reopen/refresh where supported, and confirm the bundled core world map/PWA shell remains available without requiring a live tile API.

## E. Explicitly accepted Phase 2 limitations

The following are **not defects in Phase 2** and remain scheduled for later phases:

- WGS84 3D globe is not yet implemented.
- Cross-model synchronized navigation/selection is not yet implemented.
- Astronomy engine, Sun/Moon/planet motion, twilight, and eclipse comparison are not yet implemented.
- The historical standalone Gleason map scan is not embedded; georeferencing is therefore implemented as an engine only, without invented control points.
- Flight, cable, elevation, river, experiment-notebook, and advanced comparison laboratories are later-phase work.

## F. Final owner decision

Complete only after D1–D5 have been performed.

```text
Technical acceptance: PASS
Source integrity: PASS
Numerical/functional acceptance: PASS
Owner manual acceptance: PENDING
Known limitations: ACKNOWLEDGED
Final Phase 2 decision: PENDING
Accepted commit: d7159fec11a0ec0493a7ba6d96a370de23702227
Tag after acceptance: v0.2.0
```

When the owner confirms D1–D5, update this record to `ACCEPTED`, record the final commit, create/tag `v0.2.0`, and do not begin Phase 3 before that acceptance is recorded.
