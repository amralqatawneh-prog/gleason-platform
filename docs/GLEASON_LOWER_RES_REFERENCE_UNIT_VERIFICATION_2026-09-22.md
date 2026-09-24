# Gleason Lower-Resolution Reference & Ruler-Unit Verification — 2026-09-22

Status: **SUPERSEDED BY `docs/GLEASON_PROXY_JGW_UNIT_VERIFICATION_2026-09-22.md` AFTER RECOVERY OF THE OWNER-SUPPLIED `Gleason-map-8k.jpg` PROXY**

> Historical checkpoint: this report used the separate 1464×2048 JPEG before the exact received `Gleason-map-8k.jpg` proxy (1361×2048, SHA-256 `884e9b...`) was recovered from Library and authorized by the owner. Current P6.C3 policy is defined by the proxy/JGW verification report.

## 1. Owner decision

After P6.C3 owner manual verification completed 6/6 PASS, the owner stated that
the unavailable true high-quality/8K companion raster does not need to block the
research laboratory. The project may use the available lower-quality Gleason
image as a visual/ruler calibration reference and may expose metre/mile
conversions after verification.

This decision changes the P6.C3 source policy only for visual/ruler reference.
It does not make the lower-resolution image the missing JGW companion raster.

## 2. Verified visual reference

Registry:
`data/sources/gleason-owner-hires-jpeg-reference.yaml`

File:
`hi res restored gleason map.jpg`

Observed source properties:

- dimensions: **1464 x 2048 px**;
- JPEG / RGB;
- bytes: **1,119,790**;
- SHA-256:
  `9ccbf6b304062082b813a4719654ffbca03e965e7d9ded5b8ee7b34914dd8a03`.

The bottom conversion ruler is legible enough to verify that the map explicitly
distinguishes English/Land miles from Nautical/Sea/Geographical miles and
relates the ruler to longitude/time divisions.

The image remains a **visual calibration reference**. It is not a geographic
city-control truth set and it is not the owner JGW companion raster.

## 3. Book cross-check

Primary source:
`gleason-1893-upload-v1`.

Chapter XVII / Figures 37-38 states:

- Figure 37 compares English miles with nautical/geographical miles;
- **208 English miles = 180 nautical, sea, or geographical miles**;
- English land/statute mile = **5280 feet**;
- nautical/sea/Solar mile = **6075 feet**.

The lower-resolution map ruler visually agrees with the existence and purpose
of those printed conversion scales.

## 4. P6.C3 verified metre/mile conversion profiles

The project already uses the international-foot convention
`1 ft = 0.3048 m` in its explicit SI-assumption profiles. P6.C3 therefore may
expose the following named conversion profiles:

### 4.1 English / Land / Statute mile

Source identity:
`english-land-statute-mile-5280ft`

Conversion:

`5280 ft * 0.3048 m/ft = 1609.344 m`

Status: **VERIFIED CONVERSION PROFILE**.

This does not imply that every historical occurrence of the unqualified word
"mile" is an English/statute mile.

### 4.2 Nautical / Sea / Solar mile — Chapter XVII 6075-foot definition

Source identity:
`nautical-sea-solar-mile-6075ft`

Conversion:

`6075 ft * 0.3048 m/ft = 1851.66 m`

Status: **VERIFIED CONVERSION PROFILE**.

This is a historical Chapter-XVII unit profile. It is not silently replaced by
the modern international nautical mile of 1852 m.

### 4.3 Nautical / Geographical mile implied by Figure 37 ratio

Source identity:
`fig37-nautical-geographical-mile-by-208-to-180-ratio`

Figure 37 relation:

`208 English miles = 180 nautical/sea/geographical miles`

Using the verified English/statute conversion:

`(208 / 180) * 1609.344 m = 1859.6864 m`

Status: **VERIFIED RATIO-DERIVED CONVERSION PROFILE**.

### 4.4 Historical-source conflict must remain visible

The Figure-37 ratio-derived value (**1859.6864 m**) differs from the Chapter-XVII
6075-foot value (**1851.66 m**) by **8.0264 m per mile**.

P6.C3 must therefore keep both historical relations visible and separately
named. It must not silently select one as the unique historical
nautical/geographical mile.

## 5. Boundaries that remain fail-closed

### 5.1 Figure-43 generic historical mile

The generic `historical-fig43-mile` identity remains unresolved for automatic
SI conversion. The verified ruler conversions above do not prove that every
Figure-43 "mile" equals one particular Chapter-XVII unit profile.

### 5.2 Owner JGW

`data/sources/artifacts/8k-Flat-Earth-map.jgw` remains registered with:

- CRS: unknown;
- native JGW unit: unknown;
- companion raster: not received/verified.

The lower-resolution 1464x2048 reference is **not** paired to that JGW. P6.C3
may use it to read/verify printed ruler content, but not to claim that JGW pixel
sizes are metres, miles or a named CRS.

## 6. P6.C3 implementation decision

P6.C3 will:

1. promote the 1464x2048 JPEG from visual-transcription-only to
   **owner-approved visual/ruler calibration reference**;
2. expose the three named historical ruler conversion profiles above;
3. show the 6075-foot versus Figure-37 ratio conflict explicitly;
4. keep the generic Figure-43 mile unresolved;
5. keep JGW georeferencing calibration gated;
6. replace the previous UI implication that all raster/ruler research must wait
   for the true 8K image.

This is an owner-approved P6.C3 refinement after the original 6/6 manual PASS
and therefore requires complete automated gates plus targeted owner retest of
the affected ruler/JGW presentation before P6.C3 closure.
