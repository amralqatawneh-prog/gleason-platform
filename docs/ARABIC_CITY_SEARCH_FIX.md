# Arabic city search correction — 2026-09-19

Owner feedback: «قمت بالاختبارات الثلاثه كلها نجحت»، followed by a report that
English country/city search works but Arabic works only for countries. Record
the three delivered P5.1 manual checks as PASS — REPORTED BY OWNER. This does
not imply acceptance of all Phase 5 or a pass for the newly reported defect.

## Root cause and correction

The locked `ne_110m_populated_places_simple.geojson` contains 243 city records
but no Arabic name field. The importer also omitted `--name-ar-field` for cities.
Country data already supplied `NAME_AR`. Existing online and offline search can
match Arabic names when those names exist, so synthetic Arabic fixtures did not
catch this production-data omission.

Use the full `ne_110m_populated_places.geojson` from the **same pinned Natural
Earth commit** `f1890d9f152c896d250a77557a5751a93d494776`, version 5.1.2, Public Domain.
It supplies `NAME_AR` for all 243 cities. Comparing every old/new record by NE_ID
confirmed identical canonical record IDs and geometry. No translation is invented.

- Previous simplified SHA-256: `0dbd25c9ad8bd797ddf164b067f563be5c16be2c002254eb594862377963f9dc`.
- Full source SHA-256: `a86028b083182b68c7620fc6e1a8a47ee547cb9cd2fb62ccbb78bea786440899` (654324 bytes).
- Stable source ID remains `natural-earth-cities-110m`; source URL and checksum
  now identify the full dataset. Existing primary keys are upserted, not duplicated.
- Import fields: NAME, NAME_AR, NE_ID, ISO_A2, ADM1NAME; geometry stays SOURCE_POINT.

## Updating an existing installation

Run in Git Bash from the project folder after obtaining the corrected branch:

```bash
git switch feat/phase5-shared-state
git pull --ff-only origin feat/phase5-shared-state
docker compose up --build -d
bash scripts/update_city_search.sh
```

The script requires Docker, not host Python. It downloads and verifies only the
locked city source, then upserts cities inside the running backend using its
configured database URL. Other categories and Docker volumes are preserved.
Rebuilding containers alone does not update an existing place catalog.

After success, reopen the application **online** to refresh the core search pack.
Re-save any installed country packs for their updated names. Then test Arabic
online and offline: **الدوحة / عمان / القاهرة**, category Cities when needed.
The English and Arabic results must select the same ID and coordinates.

## Validation

- Local PASS: importer configured for the real pinned source returns 243 Arabic city names with unchanged IDs, English names and coordinates; city-only routing verified.
- Local regression PASS: 49 backend and 47 frontend core tests; Bash syntax valid.
- CI adds a repeatable existing-database city refresh after production import;
  the existing category-count checks catch duplicates or unintended deletion.
- `scripts/check_arabic_city_search.mjs` verifies all 243 Arabic names in the real
  API core pack, online English/Arabic matching for Doha/Amman/Cairo, and the
  **actual frontend offline search function**, including identity and coordinate parity.
- Remote CI for the correction is pending at preparation time; use the checks on
  PR #9 for the exact correction commit. Earlier P5.1 CI does not verify this fix.
- Owner manual retest of the corrected city data: NOT RUN.

## Limits and sources

This fixes Arabic names for the current 243-city catalog; it does not expand city
coverage or add every spelling/transliteration/diacritic variant. It does not
implement P5.2. Legacy local packs need an online refresh.

Sources: [full pinned Natural Earth city data](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_110m_populated_places.geojson),
[previous simplified data](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/f1890d9f152c896d250a77557a5751a93d494776/geojson/ne_110m_populated_places_simple.geojson),
`data/sources/phase3-source-lock.json`, `scripts/import_phase3_locked_sources.py`,
`backend/app/services/place_search.py`, `frontend/src/offline/searchIndex.ts`,
and the owner's report in this conversation.
