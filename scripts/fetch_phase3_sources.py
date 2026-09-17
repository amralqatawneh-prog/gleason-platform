#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import urllib.request
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch pinned Phase 3 source datasets")
    parser.add_argument("--lock", type=Path, default=Path("data/sources/phase3-source-lock.json"))
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--discover", action="store_true", help="Allow missing SHA-256 values and print discovered hashes")
    args = parser.parse_args()

    payload = json.loads(args.lock.read_text(encoding="utf-8"))
    args.output_dir.mkdir(parents=True, exist_ok=True)
    results = []
    for source in payload["sources"]:
        target = args.output_dir / source["filename"]
        request = urllib.request.Request(source["url"], headers={"User-Agent": "gleason-platform-phase3/0.3.0"})
        with urllib.request.urlopen(request, timeout=120) as response, target.open("wb") as handle:
            while chunk := response.read(1024 * 1024):
                handle.write(chunk)
        actual = sha256(target)
        expected = source.get("sha256")
        if expected:
            if actual.lower() != expected.lower():
                raise SystemExit(f"SHA-256 mismatch for {source['id']}: expected {expected}, got {actual}")
        elif not args.discover:
            raise SystemExit(f"Missing locked SHA-256 for {source['id']}; run --discover first and commit the checksum")
        results.append({"id": source["id"], "filename": source["filename"], "sha256": actual, "bytes": target.stat().st_size})

    print(json.dumps({"sources": results}, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
