# Phase 2 Acceptance Record — v0.2.0

**Phase:** 2  
**Version:** v0.2.0  
**Candidate commit:** `d7159fec11a0ec0493a7ba6d96a370de23702227`  
**Acceptance method:** Technical + source-integrity + functional + owner visual/manual acceptance  
**Status:** ACCEPTED

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

## D. Owner manual acceptance

The project owner reported that Phase 2 was tested and works excellently. The manual acceptance items are therefore recorded as PASS.

- [x] **D1 — Desktop visual check:** Both Gleason Historical and AE maps render without overlap, clipping, or unusable controls.
- [x] **D2 — Mobile/tablet responsive check:** The maps, source viewer, inspector, and Arabic RTL layout remain usable.
- [x] **D3 — Interaction check:** Clicking/tapping several points on both maps returns sensible latitude/longitude values and the interface remains stable.
- [x] **D4 — Source transparency check:** `DOCUMENTED`, `DERIVED`, and `REFERENCE` are visually distinguishable and understandable.
- [x] **D5 — Offline check:** The bundled core world map/PWA shell remains available without requiring a live tile API where supported.

## E. Explicitly accepted Phase 2 limitations

The following are **not defects in Phase 2** and remain scheduled for later phases:

- WGS84 3D globe is not yet implemented.
- Cross-model synchronized navigation/selection is not yet implemented.
- Astronomy engine, Sun/Moon/planet motion, twilight, and eclipse comparison are not yet implemented.
- The historical standalone Gleason map scan is not embedded; georeferencing is therefore implemented as an engine only, without invented control points.
- Flight, cable, elevation, river, experiment-notebook, and advanced comparison laboratories are later-phase work.

## F. Final owner decision

```text
Technical acceptance: PASS
Source integrity: PASS
Numerical/functional acceptance: PASS
Owner manual acceptance: PASS
Known limitations: ACKNOWLEDGED
Final Phase 2 decision: ACCEPTED
Accepted implementation commit: d7159fec11a0ec0493a7ba6d96a370de23702227
Acceptance record branch: chore/phase2-acceptance
Tag after merge: v0.2.0
```

Phase 2 is formally accepted. Phase 3 may begin only after this acceptance record is merged to `main` and the final release gates remain green.
