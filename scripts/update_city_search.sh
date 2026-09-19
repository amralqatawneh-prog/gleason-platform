#!/usr/bin/env bash
# Run from Git Bash/Linux/macOS; requires a running project Docker stack, no host Python.
set -euo pipefail
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1
container="$(docker compose ps -q backend)"
test -n "$container" || { echo 'Start the backend with docker compose up --build -d first.' >&2; exit 1; }
docker compose exec -T backend mkdir -p /tmp/gleason-city-update/scripts /tmp/gleason-city-update/data/sources
for script in import_phase3_places.py import_phase3_locked_sources.py; do
  docker cp "scripts/$script" "$container:/tmp/gleason-city-update/scripts/$script"
done
docker cp data/sources/phase3-source-lock.json "$container:/tmp/gleason-city-update/data/sources/phase3-source-lock.json"
docker compose exec -T backend python - <<'PY'
import hashlib, json, os, subprocess, sys, tempfile, urllib.request
from pathlib import Path
root = Path('/tmp/gleason-city-update')
lock = root / 'data/sources/phase3-source-lock.json'
source = next(s for s in json.loads(lock.read_text())['sources'] if s['id'] == 'natural-earth-cities-110m')
with tempfile.TemporaryDirectory(prefix='gleason-city-data-') as temporary:
    target = Path(temporary) / source['filename']
    with urllib.request.urlopen(source['url'], timeout=120) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != source['sha256']:
        raise SystemExit('City source checksum mismatch; database unchanged.')
    target.write_bytes(data)
    subprocess.run([sys.executable, str(root / 'scripts/import_phase3_locked_sources.py'),
        '--database-url', os.environ['APP_DATABASE_URL'], '--data-dir', temporary,
        '--lock', str(lock), '--only-cities'], check=True)
print('City catalog updated. Reopen the app online to refresh the core search pack; re-save regional packs.')
PY
