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
require(phase6_start.get("previous_slice") == "P6.2", "previous Phase 6 slice must be P6.2")
require(phase6_start.get("previous_slice_status") == "closed", "P6.2 must remain closed")
require(phase6_start.get("current_slice") == "P6.3", "current Phase 6 slice must be P6.3")
require(phase6_start.get("current_slice_status") == "closed", "P6.3 current slice status must be closed")
require(phase6_start.get("next_slice") == "P6.4", "next Phase 6 slice must be P6.4")
require(phase6_start.get("next_slice_status") == "not_started", "P6.4 must remain not_started")
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
require(merge_boundary.get("pr17") == "merged", "PR #17 current status must be merged")
require(
    merge_boundary.get("pr17_merge_commit")
    == "660a7908dd9e3c2f073155a5394d5dfb60ee67e8",
    "PR #17 merge commit drifted",
)
require(
    merge_boundary.get("pr17_final_head")
    == "edfe36c98a48dfe6443d82f875ac53951a59a6a1",
    "PR #17 final head drifted",
)
require(merge_boundary.get("pr17_pre_merge_ci_run") == 557, "PR #17 pre-merge CI must be #557")
require(
    merge_boundary.get("pr17_pre_merge_ci_conclusion") == "success",
    "PR #17 pre-merge CI #557 must remain success",
)
require(merge_boundary.get("pr17_post_merge_main_ci_run") == 558, "PR #17 post-merge CI must be #558")
require(
    merge_boundary.get("pr17_post_merge_main_ci_conclusion") == "success",
    "PR #17 post-merge CI #558 must remain success",
)
require(merge_boundary.get("pr18") == "merged", "PR #18 current status must be merged")
require(
    merge_boundary.get("pr18_merge_commit")
    == "645a27c5ea92febd78c3bdd823281ff496a742b3",
    "PR #18 merge commit drifted",
)
require(
    merge_boundary.get("pr18_final_head")
    == "04119500ec3d4895478d76ae5c878fa30fa44354",
    "PR #18 final head drifted",
)
require(merge_boundary.get("pr18_pre_merge_ci_run") == 560, "PR #18 pre-merge CI must be #560")
require(
    merge_boundary.get("pr18_pre_merge_ci_conclusion") == "success",
    "PR #18 pre-merge CI #560 must remain success",
)
require(merge_boundary.get("pr18_post_merge_main_ci_run") == 561, "PR #18 post-merge CI must be #561")
require(
    merge_boundary.get("pr18_post_merge_main_ci_conclusion") == "success",
    "PR #18 post-merge CI #561 must remain success",
)
require(
    merge_boundary.get("current_integration_baseline")
    == "645a27c5ea92febd78c3bdd823281ff496a742b3",
    "current integration baseline must be the PR #18 merge commit",
)
post_pr17_sync = data.get("post_pr17_github_sync", {})
require(
    post_pr17_sync.get("status") == "closed",
    "post-PR17 GitHub sync status must be closed",
)
require(
    post_pr17_sync.get("verification_head") == "2314a247560d463ef03cd6438ea932da37813d73",
    "post-PR17 GitHub sync verification head drifted",
)
require(post_pr17_sync.get("verification_ci_run") == 559, "post-PR17 GitHub sync verification CI must be #559")
require(
    post_pr17_sync.get("verification_ci_conclusion") == "success",
    "post-PR17 GitHub sync verification CI #559 must remain success",
)
require(
    post_pr17_sync.get("baseline_commit")
    == "660a7908dd9e3c2f073155a5394d5dfb60ee67e8",
    "post-PR17 GitHub sync baseline drifted",
)
require(post_pr17_sync.get("baseline_ci_run") == 558, "post-PR17 GitHub sync baseline CI must be #558")
require(post_pr17_sync.get("baseline_ci_conclusion") == "success", "post-PR17 GitHub sync baseline CI #558 must remain success")
require(post_pr17_sync.get("p6_3_status") == "not_started", "P6.3 must remain not_started during post-PR17 sync")
p6_3_start = phase6_start.get("p6_3_start", {})
require(p6_3_start.get("decision") == "started-by-owner", "P6.3 explicit owner start evidence missing")
require(
    p6_3_start.get("baseline_commit") == "645a27c5ea92febd78c3bdd823281ff496a742b3",
    "P6.3 baseline commit drifted",
)
require(p6_3_start.get("baseline_ci_run") == 561, "P6.3 baseline CI must be #561")
require(p6_3_start.get("baseline_ci_conclusion") == "success", "P6.3 baseline CI #561 must remain success")
require(p6_3_start.get("branch") == "feat/phase6-p6-3-wgs84-distance", "P6.3 branch drifted")
require(
    p6_3_start.get("manual_status") == "pass-reported-by-owner",
    "P6.3 owner manual result must be recorded",
)
p6_3_owner_manual = phase6_start.get("p6_3_owner_manual", {})
require(p6_3_owner_manual.get("result") == "pass-reported-by-owner", "P6.3 owner manual PASS evidence missing")
require(p6_3_owner_manual.get("checklist_items_passed") == 6, "P6.3 must record 6/6 owner manual checks")
require(p6_3_owner_manual.get("pre_manual_ci_run") == 572, "P6.3 manual verification must follow CI #572")
require(p6_3_owner_manual.get("pre_manual_ci_conclusion") == "success", "P6.3 pre-manual CI #572 must remain success")
require(
    p6_3_owner_manual.get("offline_backend_fallback") == "pass-reported-by-owner",
    "P6.3 offline backend-fallback owner test must be recorded",
)
p6_3_automated = phase6_start.get("p6_3_automated", {})
require(
    p6_3_automated.get("implementation_head") == "06f2397f63648d879d6271064f3297608a59c333",
    "P6.3 automated implementation head drifted",
)
require(p6_3_automated.get("ci_run") == 565, "P6.3 automated CI must be #565")
require(p6_3_automated.get("ci_conclusion") == "success", "P6.3 automated CI #565 must remain success")
require(p6_3_automated.get("browser_acceptance_tests_passed") == 20, "P6.3 browser acceptance count must be 20")
p6_3_refinement = phase6_start.get("p6_3_refinement", {})
require(
    p6_3_refinement.get("decision") == "requested-by-owner-after-manual-pass",
    "P6.3 route-guide refinement owner request evidence missing",
)
require(
    p6_3_refinement.get("status") == "closed",
    "P6.3 route-guide refinement must be closed after owner verification",
)
require(
    p6_3_refinement.get("automated_head") == "483b123277f62e219937298b4fb7ca104809d420",
    "P6.3 route-guide automated head drifted",
)
require(p6_3_refinement.get("ci_run") == 587, "P6.3 route-guide CI must be #587")
require(
    p6_3_refinement.get("ci_conclusion") == "success",
    "P6.3 route-guide CI #587 must remain success",
)
require(
    p6_3_refinement.get("browser_acceptance_tests_passed") == 20,
    "P6.3 route-guide browser acceptance count must be 20",
)
require(
    p6_3_refinement.get("computation_identity") == "visual-only",
    "P6.3 route-guide refinement must remain visual-only",
)
require(p6_3_refinement.get("p6_7_status_remains") == "not_started", "P6.7 must remain not_started")
require(
    p6_3_refinement.get("targeted_manual_retest") == "pass-reported-by-owner",
    "P6.3 route-guide targeted owner retest PASS evidence missing",
)
require(p6_3_refinement.get("targeted_manual_items_passed") == 5, "P6.3 route-guide targeted retest must record 5/5")
require(
    p6_3_refinement.get("offline_backend_fallback_retest") == "pass-reported-by-owner",
    "P6.3 route-guide offline fallback retest evidence missing",
)
require(p6_3_refinement.get("pre_retest_ci_run") == 595, "P6.3 route-guide owner retest must follow CI #595")
require(
    p6_3_refinement.get("pre_retest_ci_conclusion") == "success",
    "P6.3 route-guide pre-retest CI #595 must remain success",
)
p6_3_straight = phase6_start.get("p6_3_straight_line_refinement", {})
require(
    phase6_start.get("p6_3_status") in {"awaiting-straight-line-retest", "pan-great-circle-refinement-in-progress", "awaiting-pan-great-circle-retest", "closed"},
    "P6.3 status must remain in the active refinement lifecycle",
)
require(
    p6_3_straight.get("decision") == "requested-by-owner-after-route-guide-retest-pass",
    "P6.3 straight-line refinement owner request evidence missing",
)
require(
    p6_3_straight.get("status") == "closed",
    "P6.3 straight-line refinement must be closed after owner verification",
)
require(
    p6_3_straight.get("automated_head") == "f837f8af9c56309156540f28cdf5e60456642b69",
    "P6.3 straight-line automated head drifted",
)
require(p6_3_straight.get("ci_run") == 607, "P6.3 straight-line CI must be #607")
require(
    p6_3_straight.get("ci_conclusion") == "success",
    "P6.3 straight-line CI #607 must remain success",
)
require(
    p6_3_straight.get("geometry_semantics") == "straight-projected-segment",
    "P6.3 flat-model guide must use straight projected segments",
)
require(
    p6_3_straight.get("computation_identity") == "visual-only",
    "P6.3 straight-line refinement must remain visual-only",
)
require(p6_3_straight.get("p6_7_status_remains") == "not_started", "P6.7 must remain not_started")
require(
    p6_3_straight.get("targeted_manual_retest") == "pass-reported-by-owner",
    "P6.3 straight-line targeted owner retest PASS evidence missing",
)
require(p6_3_straight.get("targeted_manual_items_passed") == 4, "P6.3 straight-line targeted retest must record 4/4")
require(p6_3_straight.get("pre_retest_ci_run") == 614, "P6.3 straight-line owner retest must follow CI #614")
require(
    p6_3_straight.get("pre_retest_ci_conclusion") == "success",
    "P6.3 straight-line pre-retest CI #614 must remain success",
)
p6_3_pan_gc = phase6_start.get("p6_3_pan_great_circle_refinement", {})
require(
    phase6_start.get("p6_3_status") == "closed",
    "P6.3 must be closed after final owner retest",
)
require(
    p6_3_pan_gc.get("decision") == "requested-by-owner-after-straight-line-retest-pass",
    "P6.3 pan/great-circle refinement owner request evidence missing",
)
require(
    p6_3_pan_gc.get("status") == "closed",
    "P6.3 pan/great-circle refinement must be closed after owner verification",
)
require(
    p6_3_pan_gc.get("automated_head") == "f67a69c78547330f273fc65bf3de4bb7379a09bf",
    "P6.3 pan/great-circle automated head drifted",
)
require(p6_3_pan_gc.get("ci_run") == 627, "P6.3 pan/great-circle CI must be #627")
require(
    p6_3_pan_gc.get("ci_conclusion") == "success",
    "P6.3 pan/great-circle CI #627 must remain success",
)
require(
    p6_3_pan_gc.get("wgs84_numeric_identity") == "wgs84-geodesic",
    "P6.3 numeric WGS84 identity must remain wgs84-geodesic",
)
require(p6_3_pan_gc.get("observed_flight_track") is False, "P6.3 must not claim observed flight-track data")
require(p6_3_pan_gc.get("p6_7_status_remains") == "not_started", "P6.7 must remain not_started")
require(
    p6_3_pan_gc.get("targeted_manual_retest") == "pass-reported-by-owner",
    "P6.3 pan/great-circle targeted owner retest PASS evidence missing",
)
require(p6_3_pan_gc.get("targeted_manual_items_passed") == 6, "P6.3 pan/great-circle targeted retest must record 6/6")
require(p6_3_pan_gc.get("pre_retest_ci_run") == 635, "P6.3 pan/great-circle owner retest must follow CI #635")
require(
    p6_3_pan_gc.get("pre_retest_ci_conclusion") == "success",
    "P6.3 pan/great-circle pre-retest CI #635 must remain success",
)
require(
    p6_3_pan_gc.get("result") == "closed-by-owner-verification",
    "P6.3 pan/great-circle refinement closure evidence missing",
)
require(phase6_start.get("current_slice") == "P6.3", "Phase 6 current slice must remain P6.3 at closure")
require(phase6_start.get("current_slice_status") == "closed", "P6.3 current slice must be closed")
require(phase6_start.get("next_slice") == "P6.4", "Phase 6 next slice must remain P6.4")
require(phase6_start.get("next_slice_status") == "not_started", "P6.4 must remain not_started")

p6_3_merge = phase6_start.get("p6_3_merge", {})
require(
    p6_3_merge.get("decision") == "merged-by-separate-owner-authorization",
    "P6.3 merge authorization evidence missing",
)
require(p6_3_merge.get("pr") == 19, "P6.3 merge must reference PR #19")
require(
    p6_3_merge.get("final_head") == "c775aac8a97a6782915782ed2118c3018cfe5a1a",
    "P6.3 final pre-merge head drifted",
)
require(p6_3_merge.get("pre_merge_ci_run") == 642, "P6.3 pre-merge CI must be #642")
require(p6_3_merge.get("pre_merge_ci_conclusion") == "success", "P6.3 pre-merge CI #642 must remain success")
require(
    p6_3_merge.get("merge_commit") == "4aac199646f3a899b45e241bf8995e8ba7c8f2a0",
    "P6.3 merge commit drifted",
)
require(p6_3_merge.get("post_merge_ci_run") == 643, "P6.3 post-merge CI must be #643")
require(
    p6_3_merge.get("post_merge_ci_conclusion") == "success",
    "P6.3 post-merge CI #643 must remain success",
)

post_pr19 = data.get("post_pr19_merge_reconciliation", {})
require(
    post_pr19.get("scope") == "current-status documentation reconciliation after separately authorized PR #19 merge",
    "post-PR19 reconciliation scope drifted",
)
require(post_pr19.get("status") == "in_progress", "post-PR19 reconciliation must be in_progress until verification")
require(
    post_pr19.get("baseline_commit") == "4aac199646f3a899b45e241bf8995e8ba7c8f2a0",
    "post-PR19 reconciliation baseline drifted",
)
require(post_pr19.get("baseline_ci_run") == 643, "post-PR19 reconciliation baseline CI must be #643")
require(
    post_pr19.get("baseline_ci_conclusion") == "success",
    "post-PR19 reconciliation baseline CI #643 must remain success",
)
require(post_pr19.get("pr19_status") == "merged", "PR #19 must be recorded as merged")
require(post_pr19.get("p6_3_status") == "closed", "P6.3 must remain closed after PR #19 merge")
require(post_pr19.get("p6_4_status") == "not_started", "P6.4 must remain not_started during reconciliation")
require(post_pr19.get("p6_7_status") == "not_started", "P6.7 must remain not_started during reconciliation")
require(post_pr19.get("accepted_phase") == 5, "accepted phase must remain 5 during reconciliation")
require(post_pr19.get("accepted_application_version") == "0.5.0", "accepted app version must remain 0.5.0")
require(post_pr19.get("tag") == "not_created", "post-PR19 reconciliation must not create a tag")
require(post_pr19.get("github_release") == "not_created", "post-PR19 reconciliation must not create a GitHub Release")
require(post_pr19.get("deployment") == "not_created", "post-PR19 reconciliation must not deploy")

p6_2_merge = phase6_start.get("p6_2_merge", {})
require(p6_2_merge.get("decision") == "merged-by-separate-owner-authorization", "P6.2 merge authorization evidence missing")
require(p6_2_merge.get("pr") == 16, "P6.2 merge must reference PR #16")
require(p6_2_merge.get("post_merge_ci_run") == 554, "P6.2 post-merge CI must be #554")
require(p6_2_merge.get("post_merge_ci_conclusion") == "success", "P6.2 post-merge CI #554 must remain success")
reconciliation = data.get("post_pr16_merge_reconciliation", {})
require(
    reconciliation.get("status") == "closed",
    "post-PR16 reconciliation status must be closed",
)
require(
    reconciliation.get("verification_head") == "df212e45758b18b742ad03f76123dd190ae0f45e",
    "post-PR16 reconciliation verification head drifted",
)
require(reconciliation.get("verification_ci_run") == 555, "post-PR16 reconciliation verification CI must be #555")
require(
    reconciliation.get("verification_ci_conclusion") == "success",
    "post-PR16 reconciliation verification CI #555 must remain success",
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
            "phase6_previous_slice": "P6.2",
            "phase6_previous_slice_status": "closed",
            "phase6_current_slice": "P6.3",
            "phase6_current_slice_status": "closed",
            "phase6_next_slice": "P6.4",
            "phase6_next_slice_status": "not_started",
        },
        ensure_ascii=False,
    )
)
