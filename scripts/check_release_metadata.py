"""Reject release metadata drift without pinning CI to one historical version."""
import json
from pathlib import Path
import re
import tomllib

root = Path(__file__).resolve().parents[1]
version = (root / "VERSION").read_text().strip()
assert re.fullmatch(r"\d+\.\d+\.\d+(?:-[\w.]+)?", version), version
frontend = json.loads((root / "frontend/package.json").read_text())
backend = tomllib.loads((root / "backend/pyproject.toml").read_text())
lock = json.loads((root / "frontend/package-lock.json").read_text())
assert frontend["version"] == backend["project"]["version"] == lock["version"] == lock["packages"][""]["version"] == version
print(f"PASS: VERSION, frontend package/lock and backend package all use {version}")
