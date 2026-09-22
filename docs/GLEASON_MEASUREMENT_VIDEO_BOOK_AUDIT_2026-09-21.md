# Gleason Measurement — Book, Five-Video, Walter and Restored-Raster Audit

Date: 2026-09-21  
Status: **IMPLEMENTED / VERIFIED / MERGED WITH P6.6 — corrected contract #783 + owner 6/6 + final closure #784**

## Source hierarchy

1. Gleason book: `PRIMARY_HISTORICAL_TEXT`.
2. Owner-supplied restored high-resolution map: `OWNER_SUPPLIED_RESTORED_HISTORICAL_RASTER`.
3. Five uploaded videos: secondary observed/interpretive evidence only.
4. Walter Bislin calculator: `EXTERNAL_COMPARATIVE_GEOMETRY`.
5. Suncalc observations in video 5: external solar calculation fixture only.

## Geometry / scale separation

The project keeps the existing GH normalized geometry:

`rho=(90-latitude)/180`

and direct planar chord:

`d_NRU=sqrt(rho1^2+rho2^2-2*rho1*rho2*cos(delta_longitude))`.

The audit changes only the default historical scale attached to that geometry.

### Preferred historical scale

Figure 43 / Chapter XVII gives 60 miles per longitude degree at the Equator.
Therefore:

- Equator circumference = `360*60 = 21600` historical Fig.43 miles.
- Equator radius = `21600/(2*pi) = 3437.74677078494`.
- Equator is `rho=0.5`.
- Therefore `1 NRU = 21600/pi = 6875.493541569879 historical Fig.43 miles`.

The unit is deliberately named `historical-fig43-mile` because Figure 43 says
"miles"; the project does not silently force statute or nautical identity.

### Legacy profile

The prior `10800 NM/NRU` profile came from treating each of 180 radial
latitude degrees as 60 nautical miles. It is retained as
`gleason-radial-60nm-legacy` for comparison only and is no longer the
historical default.

### Walter profile

Walter's polar Euclidean formula is the same normalized geometry up to scale.
For caller-supplied north-pole-to-Equator distance `EQ`:

`distance_per_NRU = 2*EQ`.

It remains external comparative evidence, not Gleason historical scale
authority.

## Figure 43 same-latitude quantities

For latitude `phi`:

`miles_per_longitude_degree = 60 - (2/3)*phi`.

For a same-latitude longitude difference `delta`:

- parallel arc = `delta * miles_per_degree`;
- parallel radius = `360*miles_per_degree/(2*pi)`;
- direct planar chord = `2*radius*sin(delta/2)`.

The UI must show arc and chord separately.

## Deterministic secondary fixtures

- New-video spreadsheet: (0,-105) to (-60,-165) -> 4994.930255778278 historical Fig.43 miles.
- Australia at 30 S, 114.967 E to 153.25 E:
  - arc = 3062.64;
  - chord = 3005.986408184987.
- North-south Australia, -2.605 to -38.06 at same longitude:
  1354.281241757556.
- Ruler/protractor video triangle 17.3, 10.6, 52 degrees:
  direct chord = 13.6326812223 cm.
- Earlier 60-per-longitude Sydney-Perth shortcut is rejected as a global rule.

## Solar video

Video 7E0aN7Ajw9U is registered for the later Observer/Sun laboratory. Its 45/45
construction and near-equinox +/-45 latitude observations do not change P6.5
distance geometry. Suncalc's astronomical distance value is not imported into
Gleason measurement.

## Restored raster

The owner supplied `hi res restored gleason map (1).pdf` as the visual map
reference.

- PDF SHA-256:
  `26105ca1f98ec9d862eb5ab52ef94b01b8b4f642a41b678cf5fbe21cff19f327`
- embedded raster SHA-256:
  `dc7f96ef7a473a4db334f721ce54963474792814280cf21dd00307f4b14619b0`
- raster dimensions: 4653 x 6506 RGB.
- provisional outer-ring fit:
  - center x = 2315.1835844095776 px
  - center y = 3287.4068173009764 px
  - south-pole/map ring radius = 1851.8383776797139 px
  - RMS radial residual = 5.768749489287826 px
  - median absolute residual = 4.706116332701413 px

This is a provisional geometry calibration, not a city-coordinate truth set.
No city control points are fabricated. Modern source coordinates may later be
projected onto this raster and compared with historical labels.

## Current P6.6 state

The previous P6.6 closure remains superseded by this amended contract. The amended implementation passed Release Acceptance Gates #783 on the owner-tested head, owner manual verification 6/6, and final closure Release Acceptance Gates #784. PR #31 was then merged at `6a2666112e56514051ea62fbe1c25f5a8016f1ae`.
