# Gleason received raster proxy + JGW unit verification — 2026-09-22

Status: **OWNER-AUTHORIZED PROXY REFERENCE / JGW AFFINE METRE UNIT VERIFIED FOR PROJECT WORKING USE / EXACT PIXEL PAIRING STILL UNVERIFIED**

## 1. Owner authorization

After P6.C3 owner manual verification completed 6/6 PASS, the owner confirmed
that the unavailable original full-resolution image cannot be supplied and
authorized the project to use the lower-quality received image as a reference,
and to adopt metre/mile units after verification.

This authorization changes the P6.C3 research policy, but it does not fabricate
an exact original raster or named CRS.

## 2. Exact received proxy representation

Recovered from ChatGPT Library:

- file: `Gleason-map-8k.jpg`;
- exact received dimensions: **1361 × 2048 px**;
- JPEG/RGB;
- bytes: **1,233,904**;
- SHA-256:
  `884e9b2473eac5929b25375bc2a1be9907866e03653722b6a3bbc2dd9a62ef1d`;
- Library id:
  `libfile_59fd00b0a9908191b5a57473d3b40383`.

The owner identifies the source lineage as 8K. The received transport
representation is not itself an 8K matrix. Four-times dimensions would be
5444×8192, but that remains a derived transport hypothesis rather than an
assertion about unavailable original bytes.

## 3. Visual verification of printed mile units

The received image visibly contains the lower conversion rulers and the printed
note explaining that:

- the upper part relates **English or Land miles** to
  **Nautical or Sea miles**, also called **Geographical**;
- the lower part relates arc/longitude subdivisions to Sun time;
- the visible endpoint relation is consistent with the registered historical
  relation approximately **208 English miles ↔ 180 Nautical/Geographical
  miles**.

Therefore the project may mark **mile** as a visually verified printed unit
family on this map, while preserving the specific mile type.

This does **not** make every occurrence of "mile" identical. The project keeps
separate:

- English/Land historical mile;
- Nautical/Sea/Geographical historical mile;
- unresolved Figure-43 historical mile where the source context does not prove
  identity;
- modern international statute mile used only for explicit SI conversion;
- modern international nautical mile used only for explicit SI conversion.

## 4. JGW numeric verification

Registered JGW:

`data/sources/artifacts/8k-Flat-Earth-map.jgw`

SHA-256:

`0ec28720f782561377aea0a23909336b707584e1ceade4cbeb382bdfd6c95a43`

Affine values:

- A = **5014.54829148701719532**
- D = 0
- B = 0
- E = **-5014.54829148701719532**
- C = **-19423852.80707496032118797**
- F = **19448678.93866851553320885**

The file has square north-up pixels and zero rotation.

### Working-unit conclusion

For P6.C3 the affine numeric unit is accepted as **metre** with evidence level
`OWNER_AUTHORIZED_PROXY_VERIFIED`.

The conclusion is limited to the affine coordinate unit and is based on the
combined evidence that:

1. the coordinate magnitudes are on the order of ±19.4 million native units;
2. the pixel size is 5014.548 native units per pixel;
3. interpreting those global-map affine magnitudes as degrees or miles is not a
   plausible world-file scale for this source, while metre interpretation
   produces world-scale projected distances;
4. the owner has authorized the received raster representation to be used as
   the visual proxy after the original 8K bytes were confirmed unavailable.

This verification **does not identify a CRS/EPSG code** and **does not prove
that the 1361×2048 proxy is the exact pixel companion** to the JGW.

## 5. Explicit modern conversion constants

For JGW affine results only:

- 1 metre = 1 / 1609.344 international statute mile;
- 1 metre = 1 / 1852 international nautical mile;
- one JGW pixel step =
  **5014.548291487017 m** =
  **3.115895850413 international statute miles** =
  **2.707639466246 international nautical miles**.

These modern conversions are not substituted for the historical ruler relation.

## 6. Calibration boundary after owner authorization

P6.C3 may now:

- use `Gleason-map-8k.jpg` as the owner-authorized visual proxy;
- transcribe ruler/frame labels from it where legible;
- treat the JGW affine unit as metres for explicit diagnostic conversion;
- display metre, international statute mile and international nautical mile
  conversions side-by-side;
- keep the restored 4653×6506 raster as an independent geometric cross-check.

P6.C3 still may **not**:

- claim the 1361×2048 proxy is the unavailable original 8K pixel matrix;
- apply the JGW pixel transform directly to proxy pixels as though dimensions
  and crop were proven identical;
- name a CRS/EPSG code without independent metadata/control-point evidence;
- fabricate city control points;
- reinterpret the unresolved Figure-43 historical mile as a modern statute or
  nautical mile;
- merge the 1464×2048 separate JPEG registry into this proxy identity.

## 7. Runtime consequence

The exact-pixel raster calibration fixture remains gated, but P6.C3 may add a
separate **JGW affine-unit diagnostic fixture** whose unit is metre and whose
metre/statute-mile/nautical-mile conversions are explicit.

This refinement requires automated CI and targeted owner retest before P6.C3
closure.
