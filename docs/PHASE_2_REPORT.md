# Phase 2 Delivery Report — v0.2.0

## Delivered
- Versioned Gleason source catalog and verified uploaded-book SHA-256.
- Source-grounded `GleasonHistoricalProjectionProvider` with explicit evidence levels.
- Independent WGS84 north-polar Azimuthal Equidistant provider using pyproj/proj4js.
- Forward/inverse projection APIs and Figure 43 historical-rule endpoint.
- Independent OpenLayers 2D maps; synchronization is intentionally deferred to Phase 5.
- Offline Core World Pack baseline using Natural Earth through world-atlas.
- Historical Source Viewer baseline.
- Generic affine georeferencing engine and residual computation.
- Explicit `historical_scan_embedded=false`; no control points are fabricated.
- Python and TypeScript validation cases.

## Source-grounding
The historical provider is a project derivation, not a claim that the book prints an analytic equation. The source describes a circular map with a 24-hour dial and center-to-circumference latitude arms, and Figure 43 states straight longitude lines and continuing divergence southward. Prime-meridian screen rotation is a display convention only.

## Known limitation
The repository does not contain a verified distributable scan of the standalone historical world map. The georeferencing engine is implemented, but scan calibration remains data-blocked rather than filled with guessed control points.

## Acceptance targets
- Historical map visible.
- AE reference map visible.
- Forward/inverse transforms pass validated cases.
- No guessed model constants.
- Core world map usable without a live tile API.
- Source/evidence metadata visible.
