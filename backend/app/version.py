"""Application release metadata is distinct from independent model versions."""
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path
import tomllib

try:
    APP_VERSION = version("gleason-platform-backend")
except PackageNotFoundError:
    # Source-only tooling; installed/Docker distributions use package metadata.
    APP_VERSION = tomllib.loads((Path(__file__).parents[1] / "pyproject.toml").read_text())["project"]["version"]

IMPLEMENTATION_PHASE = 4
ACCEPTED_PHASE = 3
PHASE_STATUS = "awaiting-owner-acceptance"
