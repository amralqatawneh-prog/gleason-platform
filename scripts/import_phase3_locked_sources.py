#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMPORTER = ROOT / "scripts" / "import_phase3_places.py"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def run_import(database_url: str, data_dir: Path, source: dict, extra: list[str]) -> None:
    path = data_dir / source["filename"]
    expected = source.get("sha256")
    actual = sha256(path)
    if not expected or actual.lower() != expected.lower():
        raise SystemExit(f"locked SHA-256 check failed for {source['id']}")
    command = [
        sys.executable,
        str(IMPORTER),
        "--database-url", database_url,
        "--input", str(path),
        "--source-id", source["id"],
        "--source-name", source["provider"],
        "--source-version", source["version"],
        "--source-license", source["license"],
        "--source-url", source["url"],
        "--sha256", actual,
        *extra,
    ]
    subprocess.run(command, check=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Import all locked Phase 3 datasets")
    parser.add_argument("--database-url", required=True)
    parser.add_argument("--data-dir", type=Path, required=True)
    parser.add_argument("--lock", type=Path, default=ROOT / "data/sources/phase3-source-lock.json")
    parser.add_argument("--only-cities", action="store_true", help="Refresh only city records; preserve all other catalog data")
    args = parser.parse_args()

    lock = json.loads(args.lock.read_text(encoding="utf-8"))
    sources = {entry["id"]: entry for entry in lock["sources"]}

    run_import(args.database_url, args.data_dir, sources["natural-earth-cities-110m"], [
        "--mode", "natural-earth-geojson", "--category", "city",
        "--name-field", "NAME", "--name-ar-field", "NAME_AR", "--id-field", "NE_ID", "--country-field", "ISO_A2",
        "--region-field", "ADM1NAME", "--coordinate-mode", "point",
    ])
    if args.only_cities:
        return 0
    run_import(args.database_url, args.data_dir, sources["natural-earth-countries-110m"], [
        "--mode", "natural-earth-geojson", "--category", "country",
        "--name-field", "NAME", "--name-ar-field", "NAME_AR", "--id-field", "NE_ID",
        "--country-field", "ISO_A2", "--coordinate-mode", "source-fields",
        "--latitude-field", "LABEL_Y", "--longitude-field", "LABEL_X",
    ])
    for category in ("ocean", "sea"):
        run_import(args.database_url, args.data_dir, sources["natural-earth-marine-110m"], [
            "--mode", "natural-earth-geojson", "--category", category,
            "--name-field", "name", "--name-ar-field", "name_ar", "--id-field", "ne_id",
            "--coordinate-mode", "derived-bbox-center", "--featurecla-value", category,
        ])
    run_import(args.database_url, args.data_dir, sources["natural-earth-rivers-110m"], [
        "--mode", "natural-earth-geojson", "--category", "river",
        "--name-field", "name", "--name-ar-field", "name_ar", "--id-field", "ne_id",
        "--coordinate-mode", "derived-line-midpoint", "--featurecla-value", "River",
    ])
    run_import(args.database_url, args.data_dir, sources["natural-earth-mountains-10m"], [
        "--mode", "natural-earth-geojson", "--category", "mountain",
        "--name-field", "name", "--name-ar-field", "name_ar", "--id-field", "ne_id",
        "--coordinate-mode", "point", "--featurecla-value", "mountain",
    ])
    run_import(args.database_url, args.data_dir, sources["ourairports-airports"], [
        "--mode", "ourairports-csv", "--coordinate-mode", "source-fields",
    ])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
