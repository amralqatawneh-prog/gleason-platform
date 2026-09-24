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

## Non-8K owner JPEG visual reference — 2026-09-22

A separate owner-supplied JPEG was inspected and registered as a visual
reference only:

- dimensions: **1464 × 2048 px**;
- format/mode: **JPEG / RGB**;
- file size: **1,119,790 bytes**;
- SHA-256:
  `9ccbf6b304062082b813a4719654ffbca03e965e7d9ded5b8ee7b34914dd8a03`;
- registry:
  `data/sources/gleason-owner-hires-jpeg-reference.yaml`.

This JPEG is **not 8K** and is **not** the companion raster for
`8k-Flat-Earth-map.jgw`. It may be used for visual transcription of labels,
graticule, bottom ruler and outer longitude/time dial where legible, but it must
not be paired with the JGW or promoted over the existing 4653×6506 restored
raster. The true 8K raster is still awaited.

## Owner 8K source visual audit update — 2026-09-22

The owner supplied the map identified as the 8K source. The exact image
representation delivered through the chat transport was inspected and preserved
without further modification:

- received file: `Gleason-map-8k.jpg`;
- received dimensions: **1361 × 2048 px**;
- received bytes: **1,233,904**;
- received SHA-256:
  `884e9b2473eac5929b25375bc2a1be9907866e03653722b6a3bbc2dd9a62ef1d`;
- persistent archival copy:
  `/Gleason Platform Sources/Gleason-map-8k.jpg` in ChatGPT Library;
- source registry:
  `data/sources/gleason-owner-8k-map.yaml`;
- received-representation manifest:
  `data/sources/gleason-owner-8k-received-manifest.yaml`;
- audit report:
  `docs/GLEASON_8K_RASTER_AUDIT_2026-09-22.md`.

The owner identifies the underlying source as 8K. The chat-delivered JPEG is
not the original 8K pixel matrix. A 4× dimension hypothesis gives 5444×8192,
which is consistent with transport downsampling but is not accepted as the
original size until the original file bytes are uploaded without image
resampling.

Visual/book cross-checks are consistent for:

- the circular Longitude and Time Calculator;
- the 24-hour outer dial;
- longitude rays and latitude rings;
- the printed longitude-to-Sun-time relation;
- the bottom English/Land versus Nautical/Sea/Geographical mile ruler;
- the bottom arc/time ruler;
- the book-registered relation 180 nautical/geographical miles = 208 English
  miles;
- the book-registered 15° longitude = 1 hour and 1° = 4 minutes relation.

The source is now the preferred historical visual source for legible historical
city/country/ocean/sea labels, graticule, ruler and frame research. It does not
replace modern canonical place coordinates, and the JGW remains unpaired
numerically until the original full-resolution raster is preserved and hashed.

