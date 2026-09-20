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
require(
    data.get("implementation_phase_at_phase5_acceptance") == 5,
    "Phase 5 acceptance-time implementation phase must remain 5",
)
require(data.get("implementation_phase") == 6, "current implementation phase must be 6")
require(
    data.get("phase6_status_at_phase5_acceptance") == "not_started",
    "Phase 6 must remain not_started at the Phase 5 acceptance moment",
)
require(data.get("phase6_status") == "in_progress", "current Phase 6 status must be in_progress")
phase6_start = data.get("phase6_start", {})
require(phase6_start.get("decision") == "started-by-owner", "explicit Phase 6 start evidence missing")
require(
    phase6_start.get("baseline_commit") == "3e5afcd9b95766bd18af59df88c9154f51567e8c",
    "Phase 6 baseline commit drifted",
)
require(phase6_start.get("baseline_ci_run") == 517, "Phase 6 baseline CI must be #517")
require(
    phase6_start.get("baseline_ci_conclusion") == "success",
    "Phase 6 baseline CI #517 must remain success",
)
require(phase6_start.get("previous_slice") == "P6.1", "previous Phase 6 slice must be P6.1")
require(phase6_start.get("previous_slice_status") == "closed", "P6.1 must remain closed")
require(phase6_start.get("current_slice") == "P6.2", "current Phase 6 slice must be P6.2")
require(phase6_start.get("current_slice_status") == "closed", "P6.2 must be closed")
require(phase6_start.get("next_slice") == "P6.3", "next Phase 6 slice must be P6.3")
require(phase6_start.get("next_slice_status") == "not_started", "P6.3 must remain not_started")
p6_2_start = phase6_start.get("p6_2_start", {})
require(p6_2_start.get("decision") == "continued-by-owner", "P6.2 owner continuation evidence missing")
require(
    p6_2_start.get("baseline_commit") == "143532248f707380b980e787051e7decc3c91086",
    "P6.2 baseline commit drifted",
)
require(p6_2_start.get("baseline_ci_run") == 530, "P6.2 baseline CI must be #530")
require(p6_2_start.get("baseline_ci_conclusion") == "success", "P6.2 baseline CI #530 must remain success")
p6_2_automated = phase6_start.get("p6_2_automated", {})
require(
    p6_2_automated.get("implementation_head") == "1d37a70f376fbe8a8974274dac48c04e2fa36807",
    "P6.2 implementation head evidence drifted",
)
require(p6_2_automated.get("ci_run") == 546, "P6.2 automated CI must be #546")
require(p6_2_automated.get("ci_conclusion") == "success", "P6.2 automated CI #546 must remain success")
p6_2_manual = phase6_start.get("p6_2_owner_manual", {})
require(
    p6_2_manual.get("result") == "pass-reported-by-owner",
    "P6.2 owner manual result must be recorded",
)
require(
    p6_2_manual.get("checklist_items_passed") == 6,
    "P6.2 must record all six owner manual checks as passed",
)
require(
    p6_2_manual.get("refinement_retest") == "pass-reported-by-owner",
    "P6.2 direct-map refinement retest must be recorded as passed",
)
p6_1_manual = phase6_start.get("p6_1_owner_manual", {})
require(
    p6_1_manual.get("result") == "pass-reported-by-owner",
    "P6.1 owner manual result must be recorded",
)
require(
    p6_1_manual.get("checklist_items_passed") == 5,
    "P6.1 must record all five owner manual checks as passed",
)
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

merge_boundary = data.get("merge_release_boundary", {})
require(merge_boundary.get("pr13") == "merged", "PR #13 current status must be merged")
require(
    merge_boundary.get("pr13_at_phase5_owner_acceptance")
    == "open-draft-phase5-accepted-awaiting-separate-merge-authorization",
    "PR #13 acceptance-time status must remain preserved",
)
require(
    merge_boundary.get("pr13_merge_commit")
    == "913ec67c195ac5971e0f63d9acfe94dba8de60bf",
    "PR #13 merge commit drifted",
)
require(merge_boundary.get("pre_merge_ci_run") == 514, "pre-merge CI run must be #514")
require(
    merge_boundary.get("pre_merge_ci_conclusion") == "success",
    "pre-merge CI #514 must remain success",
)
require(merge_boundary.get("post_merge_main_ci_run") == 515, "post-merge CI run must be #515")
require(
    merge_boundary.get("post_merge_main_ci_conclusion") == "success",
    "post-merge CI #515 must remain success",
)
require(
    merge_boundary.get("post_merge_main_commit")
    == "913ec67c195ac5971e0f63d9acfe94dba8de60bf",
    "post-merge main commit drifted",
)
require(merge_boundary.get("pr15") == "merged", "PR #15 current status must be merged")
require(
    merge_boundary.get("pr15_merge_commit")
    == "143532248f707380b980e787051e7decc3c91086",
    "PR #15 merge commit drifted",
)
require(merge_boundary.get("pr15_pre_merge_ci_run") == 529, "PR #15 pre-merge CI must be #529")
require(
    merge_boundary.get("pr15_pre_merge_ci_conclusion") == "success",
    "PR #15 pre-merge CI #529 must remain success",
)
require(merge_boundary.get("pr15_post_merge_main_ci_run") == 530, "PR #15 post-merge CI must be #530")
require(
    merge_boundary.get("pr15_post_merge_main_ci_conclusion") == "success",
    "PR #15 post-merge CI #530 must remain success",
)
require(merge_boundary.get("pr16") == "merged", "PR #16 current status must be merged")
require(
    merge_boundary.get("pr16_merge_commit")
    == "c1d72e1d1536cf1aba9376e4ada76b7fc31056f5",
    "PR #16 merge commit drifted",
)
require(
    merge_boundary.get("pr16_final_head")
    == "a8a5d2bba7680491c131da239a2c583b5f31727c",
    "PR #16 final head drifted",
)
require(merge_boundary.get("pr16_pre_merge_ci_run") == 553, "PR #16 pre-merge CI must be #553")
require(
    merge_boundary.get("pr16_pre_merge_ci_conclusion") == "success",
    "PR #16 pre-merge CI #553 must remain success",
)
require(merge_boundary.get("pr16_post_merge_main_ci_run") == 554, "PR #16 post-merge CI must be #554")
require(
    merge_boundary.get("pr16_post_merge_main_ci_conclusion") == "success",
    "PR #16 post-merge CI #554 must remain success",
)
require(
    merge_boundary.get("current_integration_baseline")
    == "c1d72e1d1536cf1aba9376e4ada76b7fc31056f5",
    "current integration baseline must be the PR #16 merge commit",
)
p6_2_merge = phase6_start.get("p6_2_merge", {})
require(p6_2_merge.get("decision") == "merged-by-separate-owner-authorization", "P6.2 merge authorization evidence missing")
require(p6_2_merge.get("pr") == 16, "P6.2 merge must reference PR #16")
require(p6_2_merge.get("post_merge_ci_run") == 554, "P6.2 post-merge CI must be #554")
require(p6_2_merge.get("post_merge_ci_conclusion") == "success", "P6.2 post-merge CI #554 must remain success")
reconciliation = data.get("post_pr16_merge_reconciliation", {})
require(
    reconciliation.get("status") in {"verification_pending", "closed"},
    "post-PR16 reconciliation status must be verification_pending or closed",
)
require(
    reconciliation.get("baseline_commit") == "c1d72e1d1536cf1aba9376e4ada76b7fc31056f5",
    "post-PR16 reconciliation baseline drifted",
)
require(reconciliation.get("baseline_ci_run") == 554, "post-PR16 reconciliation baseline CI must be #554")
require(reconciliation.get("p6_3_status") == "not_started", "P6.3 must remain not_started during reconciliation")
require(merge_boundary.get("tag") == "not_created", "tag must remain not_created")
require(
    merge_boundary.get("github_release") == "not_created",
    "GitHub Release must remain not_created",
)
require(merge_boundary.get("deployment") == "not_created", "deployment must remain not_created")

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
require("IMPLEMENTATION_PHASE = 6" in version_py, "current implementation phase metadata must be 6")
require("ACCEPTED_PHASE = 5" in version_py, "accepted phase metadata must remain 5")
require('PHASE_STATUS = "in_progress"' in version_py, "Phase 6 status metadata must be in_progress")

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
            "implementation_phase": 6,
            "phase6_status": "in_progress",
            "phase6_previous_slice": "P6.1",
            "phase6_previous_slice_status": "closed",
            "phase6_current_slice": "P6.2",
            "phase6_current_slice_status": "closed",
            "phase6_next_slice": "P6.3",
            "phase6_next_slice_status": "not_started",
        },
        ensure_ascii=False,
    )
)
