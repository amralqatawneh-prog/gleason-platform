# Gleason Scale Profiles and Restored-Raster Calibration

Date: 2026-09-21  
Status: **IMPLEMENTED / VERIFIED / MERGED WITH PR #31 — #783 + owner 6/6 + final closure #784**

## Scale profiles

### gleason-fig43-circle-derived — preferred historical profile

`1 NRU = 21600/pi = 6875.493541569879 historical-fig43-mile`.

Basis: 60 miles per longitude degree at the Equator, 360 degrees around the
circle, and `C=2*pi*r`. Evidence classification:
`DERIVED_FROM_DOCUMENTED`.

### gleason-radial-60nm-legacy

`1 NRU = 10800 nautical-mile-legacy`.

This is retained only to reproduce the earlier secondary-video assumption. It
is `SECONDARY_OBSERVED` and is not the historical default.

### walter-eq-configurable

`1 NRU = 2*EQ`, where EQ is caller-supplied north-pole-to-Equator distance.
This is `EXTERNAL_COMPARATIVE`.

## Raster calibration

Source PDF and embedded image hashes are locked in
`data/sources/gleason-restored-map.yaml`.

The current fit identifies the center and outer map ring only. No historical
city label has been converted into an authoritative coordinate. The transform
is visualization-only and may later be refined with non-fabricated control
points and residual reports.

Computation/raster transform foundation:

- north pole -> fitted raster center;
- Greenwich ray -> right;
- positive/east longitude -> counterclockwise/upward;
- normalized radius -> fitted outer-ring radius.

The calibration is explicitly `provisional-geometric-fit`.

## Ruler and frame foundation

The measurement laboratory now separates:

1. direct normalized map-plane chord;
2. preferred Fig.43/circle-derived scale;
3. legacy radial-60 comparison scale;
4. same-latitude parallel arc versus straight chord;
5. longitude/time frame conversion;
6. provisional raster ruler in pixels.

No one of these is silently substituted for another.

## Owner-supplied 8K successor bundle — 2026-09-22

A higher-resolution Gleason-map source was supplied by the owner for future
label, graticule, ruler and outer-frame research. The material currently
received in the repository is the companion world file only:

- `data/sources/artifacts/8k-Flat-Earth-map.jgw`
- source registry: `data/sources/gleason-owner-8k-map.yaml`
- SHA-256:
  `0ec28720f782561377aea0a23909336b707584e1ceade4cbeb382bdfd6c95a43`

The six JGW coefficients are:

```text
A =  5014.54829148701719532
D =  0
B =  0
E = -5014.54829148701719532
C = -19423852.80707496032118797
F =  19448678.93866851553320885
```

Therefore the file records square pixels, zero rotation and a north-up affine
grid. For zero-based pixel indices `(column,row)`, the world-file transform is:

`X = C + A*column + B*row`

`Y = F + D*column + E*row`

A JGW does **not** encode the CRS, named units, raster width/height, city/country
labels, longitude/latitude artwork, bottom ruler, or outer time dial. Those
items cannot be audited until the companion 8K image bytes are received.

When the companion raster is supplied, preserve it at original resolution and
hash it before any derivative processing. The audit must then compare:

1. city/country/ocean/sea labels;
2. longitude rays and latitude rings;
3. bottom printed ruler and its legends;
4. outer boundary/time dial;
5. circle centre/radius and graticule geometry;
6. the applicable passages/figures already registered from Gleason:
   Figs. 37–38 and Fig. 43.

No JGW coordinate unit is to be silently interpreted as metres, historical
miles or a named EPSG CRS until independent metadata or geometric evidence
supports that interpretation.

