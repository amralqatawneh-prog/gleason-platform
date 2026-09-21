# Gleason Scale Profiles and Restored-Raster Calibration

Date: 2026-09-21  
Status: **IMPLEMENTED / VERIFIED + MERGED — owner baseline `e96712975fc9f54f2615e235bb6976136efe8a2d` · #783 SUCCESS · 6/6 manual PASS · final head `1d84ba85ba21d320a0de0ed16d87006c5ef80c84` · #784 SUCCESS · merge `6a2666112e56514051ea62fbe1c25f5a8016f1ae`**

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
