#!/usr/bin/env python3
"""Fail-closed repository consistency checks for the accepted Phase 5 package."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "docs" / "PHASE_5_ACCEPTANCE_PACKAGE.json"
ACCEPTANCE = ROOT / "docs" / "PHASE_5_ACCEPTANCE.md"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"Phase 5 acceptance package check failed: {message}")


data = json.loads(PACKAGE.read_text(encoding="utf-8"))

require(data.get("schema_version") == 1, "schema_version must be 1")
require(data.get("phase") == 5, "phase must be 5")
require(data.get("package_slice") == "P5.9", "package_slice must be P5.9")
require(data.get("status") == "accepted", "Phase 5 acceptance package must be accepted")
require(
    data.get("accepted_application_version_before_phase5_decision") == "0.4.0",
    "pre-Phase 5 accepted app version baseline must remain 0.4.0",
)
require(
    data.get("accepted_phase_before_phase5_decision") == 4,
    "pre-Phase 5 accepted phase baseline must remain 4",
)
require(data.get("implementation_phase") == 5, "implementation phase must be 5")
require(data.get("phase6_status") == "not_started", "Phase 6 must remain not_started")
require(data.get("phase5_owner_acceptance") == "accepted", "Phase 5 owner acceptance must be accepted")
require(
    data.get("accepted_application_version_after_phase5_decision") == "0.5.0",
    "accepted app version after Phase 5 decision must be 0.5.0",
)
require(
    data.get("accepted_phase_after_phase5_decision") == 5,
    "accepted phase after Phase 5 decision must be 5",
)
require(data.get("phase5_status") == "accepted", "Phase 5 status must be accepted")
require(
    data.get("phase5_owner_acceptance_evidence", {}).get("decision") == "accepted-by-owner",
    "explicit owner Phase 5 acceptance evidence missing",
)

slices = data.get("slices", [])
require(
    [item.get("id") for item in slices] == [f"P5.{i}" for i in range(1, 10)],
    "slices must list P5.1 through P5.9 in order",
)
for item in slices:
    require(item.get("status") == "closed", f"{item.get('id')} must be closed")
    require(
        item.get("owner_manual") == "pass-reported-by-owner",
        f"{item.get('id')} owner manual evidence missing",
    )
    require((ROOT / item["report"]).is_file(), f"missing report {item['report']}")

require(
    data.get("p5_9_owner_manual", {}).get("result") == "pass-reported-by-owner",
    "P5.9 owner manual result must be recorded",
)
require(
    data.get("p5_9_owner_manual", {}).get("checklist_items_passed") == 10,
    "P5.9 must record all ten owner manual checks as passed",
)

required_gates = {
    "browser",
    "offline",
    "arabic-english",
    "mobile",
    "poles",
    "antimeridian",
    "source-visibility",
    "known-limitations",
}
require(
    set(data.get("required_regression_gates", [])) == required_gates,
    "regression gate set is incomplete",
)

limitation_ids = {item.get("id") for item in data.get("known_limitations", [])}
for required in {
    "historical-scan-not-embedded",
    "gleason-scale-undefined",
    "missing-height-is-unknown",
    "future-time-unavailable",
    "future-layer-sync-unavailable",
    "future-route-unavailable",
    "camera-states-independent",
    "persistence-selection-only",
}:
    require(required in limitation_ids, f"known limitation missing: {required}")

require(ACCEPTANCE.is_file(), "Phase 5 acceptance record must exist")
acceptance_text = ACCEPTANCE.read_text(encoding="utf-8")
require("Phase 5: ACCEPTED BY OWNER" in acceptance_text, "formal acceptance decision missing")
require("v0.5.0" in acceptance_text, "formal acceptance version missing")

require(
    (ROOT / "VERSION").read_text(encoding="utf-8").strip() == "0.5.0",
    "root VERSION drifted",
)

frontend_pkg = json.loads((ROOT / "frontend" / "package.json").read_text(encoding="utf-8"))
frontend_lock = json.loads((ROOT / "frontend" / "package-lock.json").read_text(encoding="utf-8"))
require(frontend_pkg.get("version") == "0.5.0", "frontend version drifted")
require(frontend_lock.get("version") == "0.5.0", "frontend lock root version drifted")
require(
    frontend_lock.get("packages", {}).get("", {}).get("version") == "0.5.0",
    "frontend lock package version drifted",
)

backend_pyproject = (ROOT / "backend" / "pyproject.toml").read_text(encoding="utf-8")
require(
    re.search(r'^version\s*=\s*"0\.5\.0"\s*$', backend_pyproject, re.M) is not None,
    "backend version drifted",
)
backend_lock = (ROOT / "backend" / "uv.lock").read_text(encoding="utf-8")
require(
    'name = "gleason-platform-backend"\nversion = "0.5.0"' in backend_lock,
    "backend uv.lock project version drifted",
)

version_py = (ROOT / "backend" / "app" / "version.py").read_text(encoding="utf-8")
require("IMPLEMENTATION_PHASE = 5" in version_py, "implementation phase metadata drifted")
require("ACCEPTED_PHASE = 5" in version_py, "accepted phase metadata must be 5")
require('PHASE_STATUS = "accepted"' in version_py, "phase status metadata must be accepted")

capabilities = (ROOT / "backend" / "app" / "services" / "capabilities.py").read_text(
    encoding="utf-8"
)
require(
    '"cross_model_synchronization": True' in capabilities,
    "cross-model synchronization capability missing",
)
require('"astronomy_engine": False' in capabilities, "astronomy engine must remain unavailable")
require('"live_flights": False' in capabilities, "live flights must remain unavailable")

future = (ROOT / "frontend" / "src" / "comparison" / "futureServices.ts").read_text(
    encoding="utf-8"
)
require("status:'unavailable'" in future, "future services must fail closed as unavailable")
require(
    "availableOperations:Object.freeze([])" in future,
    "future services must expose no operations",
)

historical = (ROOT / "data" / "sources" / "gleason-book.yaml").read_text(encoding="utf-8")
require("control_points: []" in historical, "historical control points must remain empty")
require(
    "standalone_historical_scan: not_embedded" in historical,
    "historical standalone scan must remain not embedded",
)

e2e = (ROOT / "frontend" / "tests" / "e2e" / "acceptance.spec.ts").read_text(
    encoding="utf-8"
)
for marker in [
    "P5.4 model laboratory",
    "P5.5 comparability contract",
    "P5.6 navigation",
    "P5.7 blocks heterogeneous differences",
    "P5.8 restores installed-pack identity offline",
    "P5.9 phase regression covers polar and antimeridian selections",
]:
    require(marker in e2e, f"browser regression marker missing: {marker}")

print(
    json.dumps(
        {
            "phase": 5,
            "slice": "P5.9",
            "status": "accepted",
            "closed_slices": [item["id"] for item in slices],
            "required_regression_gates": sorted(required_gates),
            "known_limitations": sorted(limitation_ids),
            "accepted_application_version": "0.5.0",
            "accepted_phase": 5,
            "phase6_status": "not_started",
        },
        ensure_ascii=False,
    )
)
