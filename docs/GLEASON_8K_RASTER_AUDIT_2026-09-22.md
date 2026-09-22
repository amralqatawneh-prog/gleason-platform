# Gleason owner-supplied 8K raster audit — 2026-09-22

Status: **SOURCE INGESTED / PARTIAL VISUAL+BOOK AUDIT COMPLETE / ORIGINAL FULL-RESOLUTION BYTES STILL REQUIRED FOR EXACT JGW CALIBRATION**

## Owner instruction

The owner supplied a Gleason map described as the 8K source and instructed the
project to preserve it as a source, use it for historical place/water labels,
longitude/latitude graticule, bottom measurement rulers and the outer
longitude/time calculator, and cross-check those features against Gleason's
book while preserving maximum source fidelity.

## Exact received representation

The conversation-delivered image file is:

- file name: `Gleason-map-8k.jpg`;
- JPEG / RGB;
- received dimensions: **1361 × 2048 px**;
- received bytes: **1,233,904**;
- SHA-256:
  `884e9b2473eac5929b25375bc2a1be9907866e03653722b6a3bbc2dd9a62ef1d`.

The exact received bytes are preserved in ChatGPT Library at:

`/Gleason Platform Sources/Gleason-map-8k.jpg`

Library id:

`libfile_59fd00b0a9908191b5a57473d3b40383`.

### Resolution boundary

The owner identifies the source as 8K. The representation delivered through the
chat transport is 1361×2048, so it is not the original 8K pixel matrix.

Multiplying both received dimensions by exactly four yields **5444×8192**. This
is consistent with a quarter-resolution transport derivative of a portrait
8192-pixel-high original, but it is only a transport hypothesis and **must not
be recorded as the original dimensions until the original file bytes are
uploaded as a file/ZIP or otherwise preserved without chat image resampling**.

Therefore:

- preserve the received representation exactly;
- do not upscale it and call the result 8K;
- do not apply the JGW directly to this downsampled representation;
- when the original image is received, hash it first and keep it unchanged;
- any tiles/pyramids/web derivatives must be separate outputs.

## Visual source findings

The received representation clearly confirms the following historical map
features:

1. the printed heading **LONGITUDE AND TIME CALCULATOR**;
2. a red outer circular time/longitude dial divided around the full map;
3. Roman-numeral time sectors forming a 24-hour frame, with morning/evening and
   noon/midnight orientation marks;
4. the printed frame text
   **DEGREES OF LONGITUDE REDUCES TO SUN-TIME IN MINUTES**;
5. straight radial longitude lines through the circular map;
6. concentric latitude rings;
7. the lower pair of conversion rulers;
8. the scale note explaining that the upper portion relates
   English/Land miles to Nautical/Sea miles, sometimes called Geographical;
9. the lower portion relating arc/longitude divisions to Sun time;
10. the instruction that laying a straight-edge across the scale shows the
    relations among the divisions.

The map also contains historical city, country, ocean, sea and island labels.
The project may use those **historical spellings/labels** as source evidence
where legible. Their printed positions are not silently promoted to modern
authoritative coordinates.

## Cross-check against the registered Gleason book source

Primary book registry:

`data/sources/gleason-book.yaml`

### Figs. 37–38 / Chapter XVII

Registered locator:

- PDF pp. 376–377 / printed pp. 349–350.

Registered support:

- circular map;
- 24-hour dial;
- radiating arms;
- longitude/time relation.

Audit result: **CONSISTENT** with the supplied map image. The circular map and
outer time/longitude dial are directly visible.

### Frame-time relation

The project book registry records:

- **15 degrees longitude = 1 hour**;
- **1 degree longitude = 4 minutes time**.

Audit result: **CONSISTENT** with a 360-degree / 24-hour circular dial and the
printed longitude-to-Sun-time calculator. The bottom scale also visibly
presents the same angular-to-time relation in finer subdivisions.

### English/Land versus Nautical/Sea/Geographical miles

The project book registry records:

- **180 nautical/geographical miles = 208 English miles**;
- English mile = 5280 feet;
- nautical/sea/Solar mile = 6075 feet.

Audit result: **CONSISTENT** with the lower conversion ruler: the visible ruler
pairs an endpoint marked about **208** on the English-mile row with **180** on
the Nautical/Sea/Geographical-mile row.

### Fig. 43 longitude scale

Registered locator:

- PDF p. 429 / printed p. 402, Fig. 43.

Registered project relation:

`historical_fig43_miles_per_longitude_degree = 60 - (2/3) * latitude_deg`

Audit boundary: the current map image confirms longitude rays and latitude
rings, but the bottom ruler must **not** be interpreted as a universal
arbitrary-segment route scale. Fig. 43 remains the registered source for the
latitude-dependent historical longitude-mile relation. Parallel arc and
straight planar chord remain distinct quantities.

## JGW pairing status

Registered world file:

`data/sources/artifacts/8k-Flat-Earth-map.jgw`

SHA-256:

`0ec28720f782561377aea0a23909336b707584e1ceade4cbeb382bdfd6c95a43`

The JGW has square north-up pixels and zero rotation, but it does not encode a
CRS or named unit. Because the chat-delivered raster has been downsampled and
the original exact pixel matrix is not yet preserved, **JGW pairing remains
unverified**.

Do not:

- label the JGW units as metres/miles without evidence;
- apply its pixel size to the 1361×2048 derivative;
- fabricate control points;
- infer an exact original raster size solely from the 4× hypothesis.

## Source-use policy adopted

For future implementation/research:

- prefer this owner-supplied source for historical city/country/ocean/sea labels
  where legible;
- use its printed graticule, ruler and longitude/time frame as historical visual
  evidence;
- cross-check numerical interpretation against the registered Gleason book;
- retain the existing 4653×6506 restored raster as an independent
  high-resolution cross-check;
- keep historical map labels separate from modern canonical place coordinates;
- keep raster geometry, historical-model computation geometry and WGS84
  reference geometry as separate identities.

## Remaining work before full 8K exact-pixel promotion

1. receive the original full-resolution raster bytes without chat resampling;
2. record original dimensions, byte size, format and SHA-256;
3. verify whether that exact raster is the intended companion to the JGW;
4. fit outer-circle centre/radius in original pixels and record residuals;
5. sample longitude rays and latitude rings in original pixels;
6. transcribe the bottom ruler at original resolution;
7. transcribe every outer time/longitude frame division;
8. produce a complete historical label inventory;
9. compare residual geometry against the existing 4653×6506 restored raster;
10. only then promote exact JGW/pixel calibration.

No runtime numerical model is changed by this source-ingestion audit.
