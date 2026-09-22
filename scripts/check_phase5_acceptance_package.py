#!/usr/bin/env python3
"""Fail-closed repository consistency checks for the accepted Phase 5 package."""
from __future__ import annotations

import json
import hashlib
import re
import math
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
require(phase6_start.get("previous_slice") == "P6.7A", "previous Phase 6 slice must be P6.7A")
require(phase6_start.get("previous_slice_status") == "closed-verified-merged", "P6.7A must be closed/verified/merged")
require(phase6_start.get("current_slice") == "P6.C2", "current Phase 6 slice must be P6.C2")
require(phase6_start.get("current_slice_status") == "closed-owner-verified-awaiting-final-closure-ci", "P6.C2 current slice status must record owner verification while final closure CI is pending")
require(phase6_start.get("next_slice") == "P6.C3", "next Phase 6 slice must be P6.C3")
require(phase6_start.get("next_slice_status") == "not_started", "P6.C3 must remain not_started")
p6_7a_start = phase6_start.get("p6_7a_start", {})
require(p6_7a_start.get("decision") == "started-by-owner", "P6.7A owner start evidence missing")
require(p6_7a_start.get("owner_statement") == "ابدأ P6.7A", "P6.7A owner statement drifted")
require(
    p6_7a_start.get("baseline_commit") == "1825852da81c04cee8e5b9f73dba28b55068c000",
    "P6.7A baseline commit drifted",
)
require(
    p6_7a_start.get("branch") == "feat/p6.7a-same-route-three-renderings",
    "P6.7A branch evidence drifted",
)
require(p6_7a_start.get("pr") == 34, "P6.7A must reference PR #34")
require(p6_7a_start.get("pr_status") == "merged", "P6.7A PR #34 must be recorded as merged")
require(
    p6_7a_start.get("supported_computation_identities")
    == ["wgs84-geodesic", "ae-projected-plane", "gleason-native-normalized"],
    "P6.7A computation identity set drifted",
)
require(
    p6_7a_start.get("route_provider_status") == "not_started-reserved-for-p6.7b",
    "P6.7A must not start RouteProvider / turn-by-turn",
)
require(p6_7a_start.get("accepted_phase_remains") == 5, "P6.7A must not accept Phase 6")
require(
    p6_7a_start.get("accepted_application_version_remains") == "0.5.0",
    "P6.7A must not change the accepted application version",
)
require(p6_7a_start.get("tag") == "not_created", "P6.7A must not create a tag")
require(p6_7a_start.get("github_release") == "not_created", "P6.7A must not create a GitHub Release")
require(p6_7a_start.get("deployment") == "not_created", "P6.7A must not deploy")
require(
    p6_7a_start.get("automated_status") == "closed-verified-merged",
    "P6.7A automated/manual closure state must be closed/verified/merged",
)
require(
    p6_7a_start.get("automated_head") == "02dad46db4f692709ded3f0471097aa3c4683fb7",
    "P6.7A automated verified head drifted",
)
require(p6_7a_start.get("automated_ci_run") == 816, "P6.7A automated CI must be #816")
require(p6_7a_start.get("automated_ci_conclusion") == "success", "P6.7A automated CI #816 must remain success")
require(p6_7a_start.get("frontend_core_tests_passed") == 150, "P6.7A frontend core count must be 150")
require(p6_7a_start.get("p6_7a_targeted_core_tests_passed") == 8, "P6.7A targeted core count must be 8")
require(p6_7a_start.get("browser_acceptance_tests_passed") == 25, "P6.7A browser acceptance count must be 25")
require(p6_7a_start.get("pwa_tests_passed") == 2, "P6.7A PWA test count must be 2")
require(p6_7a_start.get("owner_manual_status") == "pass-reported-by-owner", "P6.7A owner manual PASS evidence missing")
require(p6_7a_start.get("owner_tested_head") == "a11f7263cf42880ce0309c49f79ba45c29d78323", "P6.7A owner-tested head drifted")
require(p6_7a_start.get("pre_manual_ci_run") == 821, "P6.7A pre-manual CI must be #821")
require(p6_7a_start.get("pre_manual_ci_conclusion") == "success", "P6.7A pre-manual CI #821 must remain success")
require(p6_7a_start.get("manual_checklist_items_passed") == 6, "P6.7A must record 6/6 manual checks")
require(p6_7a_start.get("manual_result") == "6/6-pass-reported-by-owner", "P6.7A owner manual result drifted")
manual_checks = p6_7a_start.get("manual_checks", {})
for key in [
    "two_point_wgs84_identity",
    "switch_computation_identity",
    "multi_point_live_edits",
    "antimeridian_polar_case",
    "arabic_mobile",
    "backend_unavailable_browser_local_rendering",
]:
    require(manual_checks.get(key) == "pass-reported-by-owner", f"P6.7A manual check missing: {key}")
require(p6_7a_start.get("closure_status") == "closed-verified-merged", "P6.7A closure status must be closed/verified/merged")
require(p6_7a_start.get("final_closure_head") == "8b60cac42431947b52950c9e8b9d920ca46ebd5b", "P6.7A final closure head drifted")
require(p6_7a_start.get("final_closure_ci_run") == 829, "P6.7A final closure CI must be #829")
require(p6_7a_start.get("final_closure_ci_conclusion") == "success", "P6.7A final closure CI #829 must remain success")
require(p6_7a_start.get("merge_authorization") == "explicit-owner-instruction", "P6.7A merge authorization evidence missing")
require(p6_7a_start.get("merge_commit") == "cd78f560c5070d3f525ddaf124c5fb5ec4d25c52", "P6.7A merge commit drifted")
require(p6_7a_start.get("post_merge_main_ci_run") is None, "P6.7A must not invent an unseen post-merge CI run")
require(p6_7a_start.get("post_merge_main_ci_conclusion") == "not-independently-observed", "P6.7A post-merge CI evidence state drifted")
require(phase6_start.get("p6_7a_status") == "closed-verified-merged", "P6.7A top-level status must be closed/verified/merged")

p6_7a_merge = phase6_start.get("p6_7a_merge", {})
require(p6_7a_merge.get("decision") == "merged-by-separate-owner-authorization", "P6.7A merge decision missing")
require(p6_7a_merge.get("owner_statement") == "أدمج PR #34", "P6.7A merge owner statement drifted")
require(p6_7a_merge.get("pr") == 34, "P6.7A merge must reference PR #34")
require(p6_7a_merge.get("pre_manual_ci_run") == 821, "P6.7A owner-tested CI must be #821")
require(p6_7a_merge.get("owner_manual") == "6/6-pass-reported-by-owner", "P6.7A owner manual merge evidence missing")
require(p6_7a_merge.get("final_head") == "8b60cac42431947b52950c9e8b9d920ca46ebd5b", "P6.7A merge final head drifted")
require(p6_7a_merge.get("pre_merge_ci_run") == 829, "P6.7A pre-merge CI must be #829")
require(p6_7a_merge.get("pre_merge_ci_conclusion") == "success", "P6.7A pre-merge CI #829 must remain success")
require(p6_7a_merge.get("merge_commit") == "cd78f560c5070d3f525ddaf124c5fb5ec4d25c52", "P6.7A merge commit evidence drifted")
require(p6_7a_merge.get("post_merge_ci_run") is None, "P6.7A merge record must not invent post-merge CI")

amendment = phase6_start.get("corrective_measurement_architecture_amendment", {})
require(amendment.get("decision") == "approved-and-started-by-owner", "corrective architecture amendment owner approval missing")
require(amendment.get("status") == "closed-verified-merged", "corrective architecture amendment must be closed/verified/merged")
require(
    amendment.get("branch") == "docs/measurement-ux-celestial-architecture-amendment-2026-09-22",
    "corrective architecture amendment branch drifted",
)
require(
    amendment.get("baseline_commit") == "cd78f560c5070d3f525ddaf124c5fb5ec4d25c52",
    "corrective architecture amendment baseline drifted",
)
require(
    amendment.get("document") == "docs/ROADMAP_MEASUREMENT_UX_CELESTIAL_ARCHITECTURE_AMENDMENT_2026-09-22.md",
    "corrective architecture amendment document path drifted",
)
require(
    amendment.get("walter_source_registry") == "data/sources/walter-bislin-comparative-models.yaml",
    "Walter comparative source registry path drifted",
)
require(amendment.get("corrective_sequence") == ["P6.C1","P6.C2","P6.C3","P6.C4","P6.C5"], "corrective Phase 6 sequence drifted")
require(amendment.get("p6_c1_status") == "closed", "P6.C1 amendment status must be closed after owner verification")
require(
    amendment.get("p6_7b_status") == "paused-not-started-until-corrective-sequence-closes",
    "P6.7B must remain paused/not-started",
)
require(amendment.get("functional_implementation") is False, "architecture amendment must not contain functional implementation")
require(amendment.get("accepted_phase_remains") == 5, "architecture amendment must not accept Phase 6")
require(amendment.get("accepted_application_version_remains") == "0.5.0", "architecture amendment must not change accepted version")
require(amendment.get("tag") == "not_created", "architecture amendment must not create a tag")
require(amendment.get("github_release") == "not_created", "architecture amendment must not create a GitHub Release")
require(amendment.get("deployment") == "not_created", "architecture amendment must not deploy")
require(amendment.get("verification_head") == "20a203fad5b86409c64e9129806dd07169d3cddf", "architecture amendment verification head drifted")
require(amendment.get("verification_ci_run") == 832, "architecture amendment verification CI must be #832")
require(amendment.get("verification_ci_conclusion") == "success", "architecture amendment verification CI #832 must remain success")
require(amendment.get("pr") == 36, "architecture amendment must reference PR #36")
require(amendment.get("pr_status") == "merged", "architecture amendment PR #36 must be recorded as merged")
require(amendment.get("merge_authorization") == "explicit-owner-instruction", "architecture amendment merge authorization evidence missing")
require(amendment.get("exact_closure_head") == "06b9d4ad2b8c13fabed90fdd76d1e50faed2c2d1", "architecture amendment exact closure head drifted")
require(amendment.get("exact_closure_ci_run") == 837, "architecture amendment exact closure CI must be #837")
require(amendment.get("exact_closure_ci_conclusion") == "success", "architecture amendment exact closure CI #837 must remain success")
require(amendment.get("merge_authorization_statement") == "قم بدمج PR #36.", "architecture amendment merge statement drifted")
require(amendment.get("merge_commit") == "7e398ebab7841f0b5e6ced9f9437f144efc318e7", "architecture amendment merge commit drifted")
require(amendment.get("post_merge_main_ci_run") is None, "architecture amendment must not invent post-merge CI")
require(amendment.get("post_merge_main_ci_conclusion") == "not-independently-observed", "architecture amendment post-merge CI evidence state drifted")

p6_c1 = phase6_start.get("p6_c1_start", {})
require(p6_c1.get("decision") == "started-by-owner-on-verified-amendment", "P6.C1 owner start evidence missing")
require(p6_c1.get("branch") == "feat/p6.c1-gleason-measurement-reevaluation", "P6.C1 branch drifted")
require(p6_c1.get("pr") == 37, "P6.C1 must reference PR #37")
require(p6_c1.get("pr_status") == "merged", "P6.C1 PR #37 must be recorded as merged")
require(p6_c1.get("historical_stacked_base_pr") == 36, "P6.C1 historical stacked base PR must remain #36")
require(p6_c1.get("historical_stacked_base_head") == "06b9d4ad2b8c13fabed90fdd76d1e50faed2c2d1", "P6.C1 historical stacked base head drifted")
require(p6_c1.get("historical_stacked_base_ci_run") == 837, "P6.C1 historical stacked base CI must be #837")
require(p6_c1.get("historical_stacked_base_ci_conclusion") == "success", "P6.C1 historical stacked base CI #837 must remain success")
require(p6_c1.get("current_base_branch") == "main", "P6.C1 current base must be main after PR #36 merge")
require(p6_c1.get("current_base_commit") == "7e398ebab7841f0b5e6ced9f9437f144efc318e7", "P6.C1 current main base drifted")
require(p6_c1.get("sync_commit_after_pr36_merge") == "16b122f77ffbfd02129448a57f5096e1973a7e45", "P6.C1 post-PR36 sync commit drifted")
require(p6_c1.get("fig43_si_conversion_status") == "unresolved-unit-identity-fail-closed", "P6.C1 Figure 43 SI fail-closed status drifted")
require(p6_c1.get("circle_derived_role") == "diagnostic-derived", "P6.C1 circle-derived role must be diagnostic")
require(p6_c1.get("p6_c2_status") == "in_progress", "P6.C2 must be in_progress after owner start")
require(p6_c1.get("p6_7b_status") == "paused-not-started", "P6.7B must remain paused/not-started")
require(p6_c1.get("accepted_phase_remains") == 5, "P6.C1 must not accept Phase 6")
require(p6_c1.get("accepted_application_version_remains") == "0.5.0", "P6.C1 must not change accepted version")
require(p6_c1.get("automated_status") == "closed-verified-merged", "P6.C1 automated closure state must be merged")
require(p6_c1.get("verification_head") == "1d316618163a26c4647aec63682b0a4c7bd39a26", "P6.C1 verification head drifted")
require(p6_c1.get("verification_ci_run") == 845, "P6.C1 verification CI must be #845")
require(p6_c1.get("verification_ci_conclusion") == "success", "P6.C1 verification CI #845 must remain success")
require(p6_c1.get("owner_manual_status") == "pass-reported-by-owner", "P6.C1 owner manual PASS evidence missing")
require(p6_c1.get("owner_tested_head") == "0fe9a18943fd6404773d6604c5ee901fd6773589", "P6.C1 owner-tested head drifted")
require(p6_c1.get("pre_manual_ci_run") == 850, "P6.C1 pre-manual CI must be #850")
require(p6_c1.get("pre_manual_ci_conclusion") == "success", "P6.C1 pre-manual CI #850 must remain success")
require(p6_c1.get("manual_checklist_items_passed") == 6, "P6.C1 must record 6/6 manual checks")
require(p6_c1.get("manual_result") == "6/6-pass-reported-by-owner", "P6.C1 owner manual result drifted")
manual_checks = p6_c1.get("manual_checks", {})
for key in [
    "fig43_circle_derived_diagnostic_label",
    "unresolved_fig43_si_fails_closed",
    "fig43_local_latitude_dependent_semantics",
    "fig37_frame_time_conversions_separate",
    "bilingual_source_evidence_boundaries",
    "p6c2_p6c7b_boundaries_preserved",
]:
    require(manual_checks.get(key) == "pass-reported-by-owner", f"P6.C1 manual check missing: {key}")
require(p6_c1.get("closure_status") == "closed-verified-merged", "P6.C1 closure status must be merged")
require(p6_c1.get("final_closure_ci_run") == 859, "P6.C1 final closure CI must be #859")
require(p6_c1.get("final_closure_ci_conclusion") == "success", "P6.C1 final closure CI #859 must remain success")
require(p6_c1.get("final_closure_head") == "4e08520df5a8bbe5ed10e5f2ebc9ae8b8d4dac22", "P6.C1 final closure head drifted")
require(p6_c1.get("merge_authorization") == "explicit-owner-instruction", "P6.C1 merge authorization evidence missing")
require(p6_c1.get("exact_recording_head_ci") == "864-success", "P6.C1 exact recording-head CI must remain #864 success")
require(p6_c1.get("merge_authorization_statement") == "ادمج PR #37 مع `main`", "P6.C1 merge statement drifted")
require(p6_c1.get("merge_commit") == "3096d963b75478682923c20925e3eac974bbfb69", "P6.C1 merge commit drifted")
require(p6_c1.get("post_merge_main_ci_run") is None, "P6.C1 must not invent post-merge CI")
require(p6_c1.get("post_merge_main_ci_conclusion") == "not-independently-observed", "P6.C1 post-merge CI evidence state drifted")
require(phase6_start.get("p6_c1_status") == "closed-verified-merged", "P6.C1 top-level status must be closed/verified/merged")
require(phase6_start.get("p6_c1_status") == "closed-verified-merged", "P6.C1 top-level status must remain closed/verified/merged")
p6_c2 = phase6_start.get("p6_c2_start", {})
require(p6_c2.get("decision") == "started-by-owner-after-p6c1-merge", "P6.C2 owner start evidence missing")
require(p6_c2.get("owner_statement") == "ابدأ", "P6.C2 owner statement drifted")
require(p6_c2.get("baseline_commit") == "3096d963b75478682923c20925e3eac974bbfb69", "P6.C2 baseline commit drifted")
require(p6_c2.get("branch") == "feat/p6.c2-gleason-si-measurement-engine", "P6.C2 branch drifted")
require(p6_c2.get("pr") == 38, "P6.C2 must reference PR #38")
require(p6_c2.get("pr_status") == "draft-open", "P6.C2 PR #38 must remain draft/open before separate merge authorization")
require(p6_c2.get("status") == "closed-owner-verified-awaiting-final-closure-ci", "P6.C2 must record owner-verified closure state before final closure CI")
require(p6_c2.get("report") == "docs/PHASE_6_P6_C2_GLEASON_SI_MEASUREMENT_ENGINE.md", "P6.C2 report path drifted")
require(p6_c2.get("browser_engine") == "frontend/src/measurement/gleasonSiMeasurement.ts", "P6.C2 browser engine path drifted")
require(p6_c2.get("backend_endpoint") == "/api/v1/measurement/gleason/si-route-distance", "P6.C2 backend endpoint drifted")
require(p6_c2.get("executable_profiles") == [
    "walter-flat-plane-eq-10008",
    "fig43-circle-ch17-6075ft-assumption",
    "fig43-circle-fig37-ratio-assumption",
    "fig43-circle-ch19-6070ft-assumption",
    "legacy-radial60-intl-nm-assumption",
], "P6.C2 executable profile set drifted")
require(p6_c2.get("fail_closed_profiles") == [
    "gleason-book-historical",
    "gleason-video-ruler-calibrated",
    "gleason-raster-calibrated",
    "gleason-fig43-circle-derived-diagnostic",
], "P6.C2 fail-closed profile set drifted")
require(p6_c2.get("p6_c3_status") == "not_started", "P6.C3 must remain not_started")
require(p6_c2.get("p6_c4_status") == "not_started", "P6.C4 must remain not_started")
require(p6_c2.get("p6_c5_status") == "not_started", "P6.C5 must remain not_started")
require(p6_c2.get("p6_7b_status") == "paused-not-started", "P6.7B must remain paused/not-started")
require(p6_c2.get("accepted_phase_remains") == 5, "P6.C2 must not accept Phase 6")
require(p6_c2.get("accepted_application_version_remains") == "0.5.0", "P6.C2 must not change accepted version")
require(p6_c2.get("tag") == "not_created", "P6.C2 must not create a tag")
require(p6_c2.get("github_release") == "not_created", "P6.C2 must not create a GitHub Release")
require(p6_c2.get("deployment") == "not_created", "P6.C2 must not deploy")
require(p6_c2.get("automated_status") == "owner-verified-awaiting-final-closure-ci", "P6.C2 automated state must record owner verification while final closure CI is pending")
require(p6_c2.get("verification_head") == "e1e708ce864e97ac4dd6dc23106ecca475948080", "P6.C2 verification head drifted")
require(p6_c2.get("verification_ci_run") == 870, "P6.C2 verification CI must be #870")
require(p6_c2.get("verification_ci_conclusion") == "success", "P6.C2 verification CI #870 must remain success")
require(p6_c2.get("duplicate_verification_ci_run") == 869, "P6.C2 duplicate verification CI must preserve #869")
require(p6_c2.get("duplicate_verification_ci_conclusion") == "success", "P6.C2 duplicate verification CI #869 must remain success")
final_contract = p6_c2.get("final_contract", {})
require(final_contract.get("version") == "P6.C2-1", "P6.C2 final contract version drifted")
require(final_contract.get("calculation_space") == "explicit-per-executable-profile", "P6.C2 calculation-space contract drifted")
require(final_contract.get("assumption_id") == "nullable-explicit-per-profile-null-for-direct-si", "P6.C2 assumption-id contract drifted")
require(final_contract.get("profile_id") == "primary-executable-conversion-profile-identity", "P6.C2 profile-id contract drifted")
require(final_contract.get("warnings_policy") == "limitations-array-is-single-normative-warning-channel", "P6.C2 warning-channel contract drifted")
require(final_contract.get("route_revision_policy") == "excluded-ui-session-state-exact-route-id-and-ordered-input-points-are-numerical-reproducibility-boundary", "P6.C2 route-revision contract drifted")
require(final_contract.get("si_unit_policy") == "explicit-distance-m-km-nmi-fields-plus-provider-unit-provenance-no-duplicate-generic-si-unit", "P6.C2 SI-unit contract drifted")
require(p6_c2.get("recording_head_ci") == "pending", "P6.C2 recording-head CI must remain pending until final closure evidence is recorded")
require(p6_c2.get("owner_manual_status") == "pass-reported-by-owner", "P6.C2 owner manual PASS evidence missing")
require(p6_c2.get("owner_tested_head") == "b1dacada7cb84c715b71c654c7abe465d370cc0b", "P6.C2 owner-tested head drifted")
require(p6_c2.get("pre_manual_ci_run") == 876, "P6.C2 owner manual verification must follow exact-head CI #876")
require(p6_c2.get("pre_manual_ci_conclusion") == "success", "P6.C2 pre-manual CI #876 must remain success")
require(p6_c2.get("manual_checklist_items_passed") == 6, "P6.C2 must record all six owner manual checks as passed")
require(p6_c2.get("manual_result") == "6/6-pass-reported-by-owner", "P6.C2 owner manual result drifted")
require(p6_c2.get("manual_date") == "2026-09-22", "P6.C2 owner manual date drifted")
manual_checks = p6_c2.get("manual_checks", {})
for key in [
    "walter_direct_si_identity",
    "figure43_explicit_assumption_profiles",
    "historical_si_fail_closed",
    "multi_point_live_recomputation",
    "backend_stop_browser_fallback",
    "arabic_mobile_provenance_cross_slice_regression",
]:
    require(manual_checks.get(key) == "pass-reported-by-owner", f"P6.C2 manual check missing/pass drift: {key}")
require(p6_c2.get("closure_status") == "closed-owner-verified-awaiting-final-closure-ci", "P6.C2 closure status must await final closure CI")
require(p6_c2.get("final_closure_head") is None, "P6.C2 final closure head must not be invented before this closure commit exists")
require(p6_c2.get("final_closure_ci_run") is None, "P6.C2 final closure CI run must remain unset until observed")
require(p6_c2.get("final_closure_ci_conclusion") == "pending", "P6.C2 final closure CI conclusion must remain pending")
require(phase6_start.get("p6_c2_status") == "closed-owner-verified-awaiting-final-closure-ci", "P6.C2 top-level status must record owner-verified closure pending final CI")
for path in [
    "frontend/src/measurement/gleasonSiMeasurement.ts",
    "docs/PHASE_6_P6_C2_GLEASON_SI_MEASUREMENT_ENGINE.md",
    "frontend/tests/gleason-si-measurement.test.mjs",
    "backend/tests/test_phase6_gleason_si_measurement.py",
]:
    require((ROOT / path).is_file(), f"P6.C2 artifact missing: {path}")

for path in [
    "frontend/src/measurement/gleasonMeasurementProfiles.ts",
    "data/sources/gleason-measurement-unit-audit-2026-09-22.yaml",
    "docs/PHASE_6_P6_C1_GLEASON_MEASUREMENT_REEVALUATION.md",
]:
    require((ROOT / path).is_file(), f"P6.C1 contract artifact missing: {path}")

amendment_doc = ROOT / "docs" / "ROADMAP_MEASUREMENT_UX_CELESTIAL_ARCHITECTURE_AMENDMENT_2026-09-22.md"
walter_registry_path = ROOT / "data" / "sources" / "walter-bislin-comparative-models.yaml"
require(amendment_doc.is_file(), "corrective architecture amendment document missing")
require(walter_registry_path.is_file(), "Walter comparative source registry missing")
amendment_text = amendment_doc.read_text(encoding="utf-8")
walter_registry = walter_registry_path.read_text(encoding="utf-8")
for marker in [
    "P6.C1 — Gleason Measurement Re-evaluation",
    "P6.C4 — Ellipsoidal Elevation Provider",
    "P6.C5 — Map-First Comparison Workspace",
    "DomeProjectionProvider",
    "ObserverOpticsProvider",
    "SyntheticObserverRayMapping",
    "P6.7B is paused",
]:
    require(marker in amendment_text, f"architecture amendment marker missing: {marker}")
for marker in [
    "walter-distances-globe-flat-earth",
    "E = 10008 km",
    "1 NRU = 2*E = 20016 km",
    "east_west_stretch",
    "walter-flat-earth-flight-plans",
    "walter-terrestrial-refraction",
]:
    require(marker in walter_registry, f"Walter comparative registry marker missing: {marker}")

p6_5_start = phase6_start.get("p6_5_start", {})
require(p6_5_start.get("decision") == "started-by-owner", "P6.5 owner start evidence missing")
require(
    p6_5_start.get("baseline_commit") == "fc42af3cd97706ddc3f92b44f7e784ba86fc7536",
    "P6.5 baseline commit drifted",
)
require(
    p6_5_start.get("branch") == "feat/phase6-p6-5-gleason-native-measurement",
    "P6.5 branch evidence drifted",
)
require(
    p6_5_start.get("scope") == "Gleason native normalized distance for adjacent ordered route segments and open-polyline total only",
    "P6.5 scope drifted",
)
require(p6_5_start.get("status") == "closed", "P6.5 start record must be closed after owner verification")
require(p6_5_start.get("owner_manual_status") == "pass-reported-by-owner", "P6.5 owner manual status must record owner-reported PASS")
require(p6_5_start.get("pr") == 25, "P6.5 active pull request must be #25")
require(p6_5_start.get("pr_status") == "draft-open", "P6.5 PR #25 must remain draft/open before owner verification")
require(phase6_start.get("p6_5_status") == "closed", "P6.5 status must be closed after owner verification")
p6_5_automated = phase6_start.get("p6_5_automated", {})
require(p6_5_automated.get("implementation_head") == "a733f81d922963a385357becf69dafd8b6d576be", "P6.5 implementation head evidence drifted")
require(p6_5_automated.get("ci_run") == 691, "P6.5 automated CI must be #691")
require(p6_5_automated.get("ci_conclusion") == "success", "P6.5 automated CI #691 must remain success")
require(p6_5_automated.get("prior_failed_ci_runs") == [686, 689], "P6.5 prior failed CI evidence drifted")
p6_5_manual = phase6_start.get("p6_5_owner_manual", {})
require(p6_5_manual.get("result") == "pass-reported-by-owner", "P6.5 owner manual PASS evidence missing")
require(p6_5_manual.get("checklist_items_passed") == 6, "P6.5 must record 6/6 owner manual checks")
require(p6_5_manual.get("tested_head") == "a733f81d922963a385357becf69dafd8b6d576be", "P6.5 tested head drifted")
require(p6_5_manual.get("pre_manual_ci_run") == 691, "P6.5 manual verification must follow CI #691")
require(p6_5_manual.get("pre_manual_ci_conclusion") == "success", "P6.5 pre-manual CI #691 must remain success")
require(p6_5_manual.get("backend_fallback") == "pass-reported-by-owner", "P6.5 backend fallback owner test must be recorded")
require(p6_5_manual.get("arabic_mobile_layout") == "pass-reported-by-owner", "P6.5 Arabic/mobile owner test must be recorded")
p6_5_merge = phase6_start.get("p6_5_merge", {})
require(
    p6_5_merge.get("decision") == "merged-by-separate-owner-authorization",
    "P6.5 merge authorization evidence missing",
)
require(p6_5_merge.get("owner_statement") == "قم بدمج PR #25 إلى main", "P6.5 merge owner statement drifted")
require(p6_5_merge.get("pr") == 25, "P6.5 merge PR must be #25")
require(
    p6_5_merge.get("final_head") == "03a04679cfa4955340fa91f5f9d75aeeb268b0d7",
    "P6.5 final merge head drifted",
)
require(p6_5_merge.get("pre_merge_ci_run") == 699, "P6.5 pre-merge CI must be #699")
require(p6_5_merge.get("pre_merge_ci_conclusion") == "success", "P6.5 pre-merge CI #699 must remain success")
require(
    p6_5_merge.get("merge_commit") == "bdff76e765c78108e96fd0e644df850be22f8eed",
    "P6.5 merge commit drifted",
)
require(p6_5_merge.get("post_merge_ci_run") is None, "P6.5 merge record must not invent post-merge CI")
require(
    p6_5_merge.get("post_merge_ci_conclusion") == "not-independently-observed",
    "P6.5 post-merge CI evidence state drifted",
)
p6_4_start = phase6_start.get("p6_4_start", {})
require(p6_4_start.get("decision") == "started-by-owner", "P6.4 owner start evidence missing")
require(
    p6_4_start.get("baseline_commit") == "35fda15508973340669220a20ee1c5bf6bbaa39a",
    "P6.4 baseline commit drifted",
)
require(p6_4_start.get("baseline_ci_run") == 651, "P6.4 baseline CI must be #651")
require(p6_4_start.get("baseline_ci_conclusion") == "success", "P6.4 baseline CI #651 must remain success")
require(
    p6_4_start.get("branch") == "feat/phase6-p6-4-ae-native-measurement",
    "P6.4 branch evidence drifted",
)
require(
    p6_4_start.get("scope") == "AE native projected-plane distance for adjacent ordered route segments and open-polyline total only",
    "P6.4 scope drifted",
)
require(p6_4_start.get("status") == "closed", "P6.4 start record must be closed after owner verification")
require(
    p6_4_start.get("owner_manual_status") == "pass-reported-by-owner",
    "P6.4 owner manual status must record owner-reported PASS",
)
require(phase6_start.get("p6_4_status") == "closed", "P6.4 status must be closed after owner verification")
p6_4_automated = phase6_start.get("p6_4_automated", {})
require(
    p6_4_automated.get("implementation_head") == "bd73fa0f6aa4cfd9c1d415c915f0ad35bd4c3476",
    "P6.4 implementation head evidence drifted",
)
require(p6_4_automated.get("ci_run") == 653, "P6.4 automated CI must be #653")
require(
    p6_4_automated.get("ci_conclusion") == "success",
    "P6.4 automated CI #653 must remain success",
)
require(
    p6_4_automated.get("prior_failed_ci_runs") == [652],
    "P6.4 prior checker-only failure evidence drifted",
)
p6_4_manual = phase6_start.get("p6_4_owner_manual", {})
require(
    p6_4_manual.get("result") == "pass-reported-by-owner",
    "P6.4 owner manual PASS evidence missing",
)
require(p6_4_manual.get("checklist_items_passed") == 6, "P6.4 must record all six owner manual checks as passed")
require(
    p6_4_manual.get("tested_head") == "59d19a96c6a7af443429d8ba7585386d4f491dee",
    "P6.4 owner-tested head drifted",
)
require(p6_4_manual.get("pre_manual_ci_run") == 661, "P6.4 owner manual verification must follow CI #661")
require(
    p6_4_manual.get("pre_manual_ci_conclusion") == "success",
    "P6.4 pre-manual CI #661 must remain success",
)



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
    == "1825852da81c04cee8e5b9f73dba28b55068c000",
    "current integration baseline must be the PR #33 merge commit / P6.7A start baseline",
)
require(merge_boundary.get("pr33") == "merged", "PR #33 must be recorded as merged")
require(
    merge_boundary.get("pr33_merge_commit") == "1825852da81c04cee8e5b9f73dba28b55068c000",
    "PR #33 merge commit drifted",
)
require(
    merge_boundary.get("pr33_final_head") == "a72249b35250e3aeee1c3dbfac9c59dd89a7edfb",
    "PR #33 final head drifted",
)
require(merge_boundary.get("pr33_pre_merge_ci_run") == 803, "PR #33 pre-merge CI must be #803")
require(
    merge_boundary.get("pr33_pre_merge_ci_conclusion") == "success",
    "PR #33 pre-merge CI #803 must remain success",
)
require(merge_boundary.get("pr33_post_merge_main_ci_run") is None, "do not invent PR #33 post-merge CI")

require(merge_boundary.get("pr19") == "merged", "PR #19 must be recorded as merged")
require(
    merge_boundary.get("pr19_merge_commit") == "4aac199646f3a899b45e241bf8995e8ba7c8f2a0",
    "PR #19 merge commit drifted",
)
require(merge_boundary.get("pr19_pre_merge_ci_run") == 642, "PR #19 pre-merge CI must be #642")
require(merge_boundary.get("pr19_post_merge_main_ci_run") == 643, "PR #19 post-merge CI must be #643")
require(merge_boundary.get("pr20") == "merged", "PR #20 must be recorded as merged")
require(
    merge_boundary.get("pr20_merge_commit") == "35fda15508973340669220a20ee1c5bf6bbaa39a",
    "PR #20 merge commit drifted",
)
require(
    merge_boundary.get("pr20_final_head") == "9b4e3693e95d05778930eb04dd0e526326e03fc6",
    "PR #20 final head drifted",
)
require(merge_boundary.get("pr20_pre_merge_ci_run") == 650, "PR #20 pre-merge CI must be #650")
require(
    merge_boundary.get("pr20_pre_merge_ci_conclusion") == "success",
    "PR #20 pre-merge CI #650 must remain success",
)
require(merge_boundary.get("pr20_post_merge_main_ci_run") == 651, "PR #20 post-merge CI must be #651")
require(
    merge_boundary.get("pr20_post_merge_main_ci_conclusion") == "success",
    "PR #20 post-merge CI #651 must remain success",
)
require(merge_boundary.get("pr21") == "merged", "PR #21 must be recorded as merged")
require(
    merge_boundary.get("pr21_merge_commit") == "11b571f08f72732b509f049f1a2ab1be92292938",
    "PR #21 merge commit drifted",
)
require(
    merge_boundary.get("pr21_final_head") == "ced5649c3c2d6e1c8e1d96af35fb0775637719a3",
    "PR #21 final head drifted",
)
require(merge_boundary.get("pr21_pre_merge_ci_run") == 668, "PR #21 pre-merge CI must be #668")
require(
    merge_boundary.get("pr21_pre_merge_ci_conclusion") == "success",
    "PR #21 pre-merge CI #668 must remain success",
)
require(merge_boundary.get("pr21_post_merge_main_ci_run") == 669, "PR #21 post-merge CI must be #669")
require(
    merge_boundary.get("pr21_post_merge_main_ci_conclusion") == "success",
    "PR #21 post-merge CI #669 must remain success",
)
require(merge_boundary.get("pr22") == "merged", "PR #22 must be recorded as merged")
require(
    merge_boundary.get("pr22_merge_commit") == "ba44ae59410e02ae748b235ed9792c8d4ee31b02",
    "PR #22 merge commit drifted",
)
require(
    merge_boundary.get("pr22_final_head") == "a76fcff0ac7ad366143645ad722ff5d91183561e",
    "PR #22 final head drifted",
)
require(merge_boundary.get("pr22_pre_merge_ci_run") == 671, "PR #22 pre-merge CI must be #671")
require(
    merge_boundary.get("pr22_pre_merge_ci_conclusion") == "success",
    "PR #22 pre-merge CI #671 must remain success",
)
require(merge_boundary.get("pr23") == "merged", "PR #23 must be recorded as merged")
require(
    merge_boundary.get("pr23_merge_commit") == "de2cf9b0a8a48a788323373eb2b9c72622c288f8",
    "PR #23 merge commit drifted",
)
require(
    merge_boundary.get("pr23_final_head") == "c73ca4cdd41b2e3cd745df5412be30a44d2bda9c",
    "PR #23 final head drifted",
)
require(merge_boundary.get("pr23_pre_merge_ci_run") == 676, "PR #23 pre-merge CI must be #676")
require(
    merge_boundary.get("pr23_pre_merge_ci_conclusion") == "success",
    "PR #23 pre-merge CI #676 must remain success",
)
require(merge_boundary.get("pr23_post_merge_main_ci_run") is None, "PR #23 must not fabricate an unseen post-merge CI run")
require(
    merge_boundary.get("pr23_post_merge_main_ci_conclusion") == "not-independently-observed",
    "PR #23 post-merge CI evidence state drifted",
)
require(merge_boundary.get("pr24") == "merged", "PR #24 must be recorded as merged")
require(
    merge_boundary.get("pr24_merge_commit") == "fc42af3cd97706ddc3f92b44f7e784ba86fc7536",
    "PR #24 merge commit drifted",
)
require(
    merge_boundary.get("pr24_final_head") == "2c3b12ceabdf374d587c96f49f23d097de8d8d1d",
    "PR #24 final head drifted",
)
require(merge_boundary.get("pr24_pre_merge_ci_run") == 684, "PR #24 pre-merge CI must be #684")
require(
    merge_boundary.get("pr24_pre_merge_ci_conclusion") == "success",
    "PR #24 pre-merge CI #684 must remain success",
)
require(merge_boundary.get("pr25") == "merged", "PR #25 must be recorded as merged")
require(
    merge_boundary.get("pr25_merge_commit") == "bdff76e765c78108e96fd0e644df850be22f8eed",
    "PR #25 merge commit drifted",
)
require(
    merge_boundary.get("pr25_final_head") == "03a04679cfa4955340fa91f5f9d75aeeb268b0d7",
    "PR #25 final head drifted",
)
require(merge_boundary.get("pr25_pre_merge_ci_run") == 699, "PR #25 pre-merge CI must be #699")
require(
    merge_boundary.get("pr25_pre_merge_ci_conclusion") == "success",
    "PR #25 pre-merge CI #699 must remain success",
)
require(merge_boundary.get("pr25_post_merge_main_ci_run") is None, "PR #25 must not fabricate an unseen post-merge CI run")
require(
    merge_boundary.get("pr25_post_merge_main_ci_conclusion") == "not-independently-observed",
    "PR #25 post-merge CI evidence state drifted",
)
require(merge_boundary.get("pr26") == "merged", "PR #26 must be recorded as merged")
require(
    merge_boundary.get("pr26_merge_commit") == "6bbfe92e8a4c0b66415eb888598cace5b7b15102",
    "PR #26 merge commit drifted",
)
require(
    merge_boundary.get("pr26_final_head") == "24aba98192483dc8fc3d60cacbb8eac96f0fa5aa",
    "PR #26 final head drifted",
)
require(merge_boundary.get("pr26_pre_merge_ci_run") == 718, "PR #26 pre-merge CI must be #718")
require(
    merge_boundary.get("pr26_pre_merge_ci_conclusion") == "success",
    "PR #26 pre-merge CI #718 must remain success",
)
require(merge_boundary.get("pr26_post_merge_main_ci_run") is None, "PR #26 must not fabricate an unseen post-merge CI run")
require(
    merge_boundary.get("pr26_post_merge_main_ci_conclusion") == "not-independently-observed",
    "PR #26 post-merge CI evidence state drifted",
)
require(merge_boundary.get("pr27") == "merged", "PR #27 must be recorded as merged")
require(
    merge_boundary.get("pr27_merge_commit") == "5442852ef4bc2e760db39743d0bc7b3bc57d0b11",
    "PR #27 merge commit drifted",
)
require(
    merge_boundary.get("pr27_final_head") == "8d84c2e83a148a359fd0d75da7e5f3b21570ac22",
    "PR #27 final head drifted",
)
require(merge_boundary.get("pr27_pre_merge_ci_run") == 726, "PR #27 pre-merge CI must be #726")
require(
    merge_boundary.get("pr27_pre_merge_ci_conclusion") == "success",
    "PR #27 pre-merge CI #726 must remain success",
)
require(merge_boundary.get("pr27_post_merge_main_ci_run") is None, "PR #27 must not fabricate an unseen post-merge CI run")
require(
    merge_boundary.get("pr27_post_merge_main_ci_conclusion") == "not-independently-observed",
    "PR #27 post-merge CI evidence state drifted",
)
require(merge_boundary.get("pr28") == "merged", "PR #28 must be recorded as merged")
require(
    merge_boundary.get("pr28_merge_commit") == "a96f47b95c542c2eafb21771bc7c53e7ab40d170",
    "PR #28 merge commit drifted",
)
require(
    merge_boundary.get("pr28_final_head") == "8f6b69c90148e0c5e9200ebab2dfab88ed0f5789",
    "PR #28 final head drifted",
)
require(merge_boundary.get("pr28_pre_merge_ci_run") == 744, "PR #28 pre-merge CI must be #744")
require(
    merge_boundary.get("pr28_pre_merge_ci_conclusion") == "success",
    "PR #28 pre-merge CI #744 must remain success",
)
require(merge_boundary.get("pr28_post_merge_main_ci_run") is None, "PR #28 must not fabricate an unseen post-merge CI run")
require(
    merge_boundary.get("pr28_post_merge_main_ci_conclusion") == "not-independently-observed",
    "PR #28 post-merge CI evidence state drifted",
)
require(merge_boundary.get("pr29") == "merged", "PR #29 must be recorded as merged")
require(
    merge_boundary.get("pr29_merge_commit") == "8ac38042050f24c0ec30e30b32d37cd1900abf92",
    "PR #29 merge commit drifted",
)
require(
    merge_boundary.get("pr29_final_head") == "7751e76c1d3fe3e8c129436717042a49040ead4b",
    "PR #29 final head drifted",
)
require(merge_boundary.get("pr29_pre_merge_ci_run") == 754, "PR #29 pre-merge CI must be #754")
require(
    merge_boundary.get("pr29_pre_merge_ci_conclusion") == "success",
    "PR #29 pre-merge CI #754 must remain success",
)
require(merge_boundary.get("pr29_post_merge_main_ci_run") is None, "PR #29 must not fabricate an unseen post-merge CI run")
require(
    merge_boundary.get("pr29_post_merge_main_ci_conclusion") == "not-independently-observed",
    "PR #29 post-merge CI evidence state drifted",
)
require(merge_boundary.get("pr30") == "merged", "PR #30 must be recorded as merged")
require(
    merge_boundary.get("pr30_merge_commit") == "1c64285b92c093365b74f3256aa9557b9a48268e",
    "PR #30 merge commit drifted",
)
require(
    merge_boundary.get("pr30_final_head") == "14c69a8cb1aaae2b375803e6400efe24aa83fd03",
    "PR #30 final head drifted",
)
require(merge_boundary.get("pr30_pre_merge_ci_run") == 759, "PR #30 pre-merge CI must be #759")
require(
    merge_boundary.get("pr30_pre_merge_ci_conclusion") == "success",
    "PR #30 pre-merge CI #759 must remain success",
)
require(merge_boundary.get("pr30_post_merge_main_ci_run") is None, "PR #30 must not fabricate an unseen post-merge CI run")
require(
    merge_boundary.get("pr30_post_merge_main_ci_conclusion") == "not-independently-observed",
    "PR #30 post-merge CI evidence state drifted",
)


p6_4_merge = phase6_start.get("p6_4_merge", {})
require(p6_4_merge.get("decision") == "merged-by-separate-owner-authorization", "P6.4 merge authorization evidence missing")
require(p6_4_merge.get("pr") == 21, "P6.4 merge PR must be #21")
require(
    p6_4_merge.get("merge_commit") == "11b571f08f72732b509f049f1a2ab1be92292938",
    "P6.4 merge commit drifted",
)
require(p6_4_merge.get("post_merge_ci_run") == 669, "P6.4 post-merge CI must be #669")
post_pr21 = data.get("post_pr21_merge_reconciliation", {})
require(post_pr21.get("status") == "closed", "post-PR21 reconciliation must be closed after verification")
require(
    post_pr21.get("baseline_commit") == "11b571f08f72732b509f049f1a2ab1be92292938",
    "post-PR21 reconciliation baseline drifted",
)
require(post_pr21.get("baseline_ci_run") == 669, "post-PR21 reconciliation baseline CI must be #669")
require(post_pr21.get("baseline_ci_conclusion") == "success", "post-PR21 baseline CI #669 must remain success")
require(post_pr21.get("p6_4_status") == "closed", "P6.4 must remain closed during reconciliation")
require(post_pr21.get("p6_5_status") == "not_started", "P6.5 must remain not_started during reconciliation")
require(post_pr21.get("pr") == 22, "post-PR21 reconciliation PR must be #22")
require(
    post_pr21.get("verification_head") == "ae23478c53b51520d708ddfabff90a5867a03152",
    "post-PR21 reconciliation verification head drifted",
)
require(post_pr21.get("verification_ci_run") == 670, "post-PR21 reconciliation verification CI must be #670")
require(
    post_pr21.get("verification_ci_conclusion") == "success",
    "post-PR21 reconciliation verification CI #670 must remain success",
)
require(
    post_pr21.get("merge_authorization") == "explicit-owner-instruction",
    "post-PR21 reconciliation merge authorization evidence missing",
)
require(
    post_pr21.get("final_closure_head") == "a76fcff0ac7ad366143645ad722ff5d91183561e",
    "post-PR21 final closure head drifted",
)
require(post_pr21.get("final_closure_ci_run") == 671, "post-PR21 final closure CI must be #671")
require(
    post_pr21.get("final_closure_ci_conclusion") == "success",
    "post-PR21 final closure CI #671 must remain success",
)
require(post_pr21.get("pr22_status") == "merged", "post-PR21 reconciliation PR #22 must be merged")
require(
    post_pr21.get("merge_commit") == "ba44ae59410e02ae748b235ed9792c8d4ee31b02",
    "post-PR21 merge commit drifted",
)
amendment = data.get("roadmap_architecture_amendment_2026_09_21", {})
require(amendment.get("decision") == "owner-approved", "roadmap architecture amendment owner approval missing")
require(amendment.get("status") == "closed", "roadmap architecture amendment must be closed after verification")
require(
    amendment.get("baseline_commit") == "ba44ae59410e02ae748b235ed9792c8d4ee31b02",
    "roadmap architecture amendment baseline drifted",
)
require(amendment.get("p6_5_status") == "not_started", "P6.5 must remain not_started during roadmap amendment")
require(amendment.get("accepted_phase_remains") == 5, "accepted phase must remain 5 during roadmap amendment")
require(
    amendment.get("accepted_application_version_remains") == "0.5.0",
    "accepted app version must remain 0.5.0 during roadmap amendment",
)
require(amendment.get("phase6_status_remains") == "in_progress", "Phase 6 must remain in_progress during roadmap amendment")
require(
    amendment.get("reserved_contracts") == ["ObserverContext", "TimeContext", "ExternalLayerProvider", "RouteProvider"],
    "roadmap amendment shared contract set drifted",
)
require(amendment.get("pr") == 23, "roadmap architecture amendment PR must be #23")
require(
    amendment.get("verification_head") == "cb4b4681bd359e29b08542856b7bff144a239796",
    "roadmap architecture amendment verification head drifted",
)
require(amendment.get("verification_ci_run") == 673, "roadmap architecture amendment verification CI must be #673")
require(
    amendment.get("verification_ci_conclusion") == "success",
    "roadmap architecture amendment verification CI #673 must remain success",
)
require(amendment.get("merge_status") == "merged", "roadmap architecture amendment PR #23 must be merged")
require(
    amendment.get("merge_authorization") == "explicit-owner-instruction",
    "roadmap architecture amendment merge authorization evidence missing",
)
require(
    amendment.get("merge_authorization_statement") == "قم بدمج PR #23 إلى main",
    "roadmap architecture amendment merge authorization statement drifted",
)
require(
    amendment.get("final_closure_head") == "c73ca4cdd41b2e3cd745df5412be30a44d2bda9c",
    "roadmap architecture amendment final closure head drifted",
)
require(amendment.get("final_closure_ci_run") == 676, "roadmap architecture amendment final closure CI must be #676")
require(
    amendment.get("final_closure_ci_conclusion") == "success",
    "roadmap architecture amendment final closure CI #676 must remain success",
)
require(
    amendment.get("merge_commit") == "de2cf9b0a8a48a788323373eb2b9c72622c288f8",
    "roadmap architecture amendment merge commit drifted",
)
require(amendment.get("post_merge_main_ci_run") is None, "roadmap amendment must not fabricate an unseen post-merge CI run")
require(
    amendment.get("post_merge_main_ci_conclusion") == "not-independently-observed",
    "roadmap amendment post-merge CI evidence state drifted",
)
post_pr23 = data.get("post_pr23_merge_reconciliation", {})
require(post_pr23.get("status") == "closed", "post-PR23 reconciliation must be closed after verification")
require(post_pr23.get("pr") == 24, "post-PR23 reconciliation PR must be #24")
require(
    post_pr23.get("baseline_commit") == "de2cf9b0a8a48a788323373eb2b9c72622c288f8",
    "post-PR23 reconciliation baseline drifted",
)
require(post_pr23.get("pr23_status") == "merged", "post-PR23 reconciliation must record PR #23 merged")
require(post_pr23.get("p6_4_status") == "closed", "P6.4 must remain closed during post-PR23 reconciliation")
require(post_pr23.get("p6_5_status") == "not_started", "P6.5 must remain not_started during post-PR23 reconciliation")
require(post_pr23.get("accepted_phase") == 5, "accepted phase must remain 5 during post-PR23 reconciliation")
require(
    post_pr23.get("accepted_application_version") == "0.5.0",
    "accepted application version must remain 0.5.0 during post-PR23 reconciliation",
)
require(post_pr23.get("phase6_status") == "in_progress", "Phase 6 must remain in_progress during post-PR23 reconciliation")
require(post_pr23.get("tag") == "not_created", "post-PR23 reconciliation must not create a tag")
require(post_pr23.get("github_release") == "not_created", "post-PR23 reconciliation must not create a GitHub Release")
require(post_pr23.get("deployment") == "not_created", "post-PR23 reconciliation must not deploy")
require(
    post_pr23.get("verification_head") == "89b634d49eb802c17f9978fee7065ca958c3b592",
    "post-PR23 reconciliation verification head drifted",
)
require(post_pr23.get("verification_ci_run") == 679, "post-PR23 reconciliation verification CI must be #679")
require(
    post_pr23.get("verification_ci_conclusion") == "success",
    "post-PR23 reconciliation verification CI #679 must remain success",
)
require(post_pr23.get("merge_status") == "merged", "post-PR23 reconciliation PR #24 must be recorded as merged")
require(
    post_pr23.get("merge_authorization") == "explicit-owner-instruction",
    "post-PR23 reconciliation merge authorization evidence missing",
)
require(
    post_pr23.get("final_closure_head") == "2c3b12ceabdf374d587c96f49f23d097de8d8d1d",
    "PR #24 final closure head drifted",
)
require(post_pr23.get("final_closure_ci_run") == 684, "PR #24 final closure CI must be #684")
require(post_pr23.get("final_closure_ci_conclusion") == "success", "PR #24 CI #684 must remain success")
require(
    post_pr23.get("merge_commit") == "fc42af3cd97706ddc3f92b44f7e784ba86fc7536",
    "PR #24 merge commit drifted",
)
post_pr25 = data.get("post_pr25_merge_reconciliation", {})
require(post_pr25.get("status") == "closed", "post-PR25 reconciliation must be closed after verification")
require(post_pr25.get("pr") == 26, "post-PR25 reconciliation PR must be #26")
require(
    post_pr25.get("baseline_commit") == "bdff76e765c78108e96fd0e644df850be22f8eed",
    "post-PR25 reconciliation baseline drifted",
)
require(post_pr25.get("pr25_status") == "merged", "post-PR25 reconciliation must record PR #25 merged")
require(
    post_pr25.get("pr25_final_head") == "03a04679cfa4955340fa91f5f9d75aeeb268b0d7",
    "post-PR25 final head drifted",
)
require(post_pr25.get("pr25_pre_merge_ci_run") == 699, "post-PR25 record must preserve CI #699")
require(post_pr25.get("pr25_pre_merge_ci_conclusion") == "success", "post-PR25 CI #699 must remain success")
require(
    post_pr25.get("pr25_merge_commit") == "bdff76e765c78108e96fd0e644df850be22f8eed",
    "post-PR25 merge commit drifted",
)
require(post_pr25.get("pr25_post_merge_ci_run") is None, "post-PR25 reconciliation must not fabricate a post-merge CI run")
require(
    post_pr25.get("pr25_post_merge_ci_conclusion") == "not-independently-observed",
    "post-PR25 post-merge CI evidence state drifted",
)
require(post_pr25.get("p6_5_status") == "closed", "P6.5 must remain closed during post-PR25 reconciliation")
require(post_pr25.get("p6_6_status") == "not_started", "P6.6 must remain not_started during post-PR25 reconciliation")
require(post_pr25.get("accepted_phase") == 5, "accepted phase must remain 5 during post-PR25 reconciliation")
require(
    post_pr25.get("accepted_application_version") == "0.5.0",
    "accepted application version must remain 0.5.0 during post-PR25 reconciliation",
)
require(post_pr25.get("phase6_status") == "in_progress", "Phase 6 must remain in_progress during post-PR25 reconciliation")
require(post_pr25.get("tag") == "not_created", "post-PR25 reconciliation must not create a tag")
require(post_pr25.get("github_release") == "not_created", "post-PR25 reconciliation must not create a GitHub Release")
require(post_pr25.get("deployment") == "not_created", "post-PR25 reconciliation must not deploy")
require(
    post_pr25.get("verification_head") == "6b7b1e9cc2e809f4485626171d69c18366c89fe5",
    "post-PR25 reconciliation verification head drifted",
)
require(post_pr25.get("verification_ci_run") == 713, "post-PR25 reconciliation verification CI must be #713")
require(
    post_pr25.get("verification_ci_conclusion") == "success",
    "post-PR25 reconciliation verification CI #713 must remain success",
)
require(post_pr25.get("merge_status") == "merged", "post-PR25 reconciliation PR #26 must be recorded as merged")
require(
    post_pr25.get("merge_authorization") == "explicit-owner-instruction",
    "post-PR25 reconciliation merge authorization evidence missing",
)
require(
    post_pr25.get("merge_authorization_statement") == "ابد الدمج الذي طلبته",
    "post-PR25 reconciliation merge authorization statement drifted",
)
require(
    post_pr25.get("final_closure_head") == "24aba98192483dc8fc3d60cacbb8eac96f0fa5aa",
    "PR #26 final closure head drifted",
)
require(post_pr25.get("final_closure_ci_run") == 718, "PR #26 final closure CI must be #718")
require(post_pr25.get("final_closure_ci_conclusion") == "success", "PR #26 CI #718 must remain success")
require(
    post_pr25.get("merge_commit") == "6bbfe92e8a4c0b66415eb888598cace5b7b15102",
    "PR #26 merge commit drifted",
)
require(post_pr25.get("post_merge_main_ci_run") is None, "post-PR25 reconciliation must not invent post-merge CI")
require(
    post_pr25.get("post_merge_main_ci_conclusion") == "not-independently-observed",
    "post-PR25 reconciliation post-merge CI evidence state drifted",
)

astronomy_amendment = data.get("roadmap_astronomy_architecture_amendment_2026_09_21", {})
require(astronomy_amendment.get("decision") == "owner-approved", "astronomy architecture amendment owner approval missing")
require(
    astronomy_amendment.get("owner_statement")
    == "موافق على هذا التصور، وابدأ بتنفيذ Roadmap & Astronomy Architecture Amendment جديد",
    "astronomy architecture amendment owner statement drifted",
)
require(astronomy_amendment.get("status") == "closed", "astronomy architecture amendment must be closed after verification")
require(
    astronomy_amendment.get("branch") == "docs/astronomy-roadmap-amendment-2026-09-21",
    "astronomy architecture amendment branch drifted",
)
require(astronomy_amendment.get("stacked_base_pr") == 26, "astronomy amendment stacked base PR must be #26")
require(
    astronomy_amendment.get("stacked_base_head") == "24aba98192483dc8fc3d60cacbb8eac96f0fa5aa",
    "astronomy amendment stacked base head drifted",
)
require(astronomy_amendment.get("stacked_base_ci_run") == 718, "astronomy amendment stacked base CI must be #718")
require(
    astronomy_amendment.get("stacked_base_ci_conclusion") == "success",
    "astronomy amendment stacked base CI #718 must remain success",
)
require(
    astronomy_amendment.get("underlying_main_commit") == "6bbfe92e8a4c0b66415eb888598cace5b7b15102",
    "astronomy amendment underlying main baseline drifted",
)
require(
    astronomy_amendment.get("stacked_base_merge_commit") == "6bbfe92e8a4c0b66415eb888598cace5b7b15102",
    "astronomy amendment stacked-base merge commit drifted",
)
require(astronomy_amendment.get("p6_6_status") == "not_started", "P6.6 must remain not_started during astronomy amendment")
require(astronomy_amendment.get("phase6_status_remains") == "in_progress", "Phase 6 must remain in progress during astronomy amendment")
require(astronomy_amendment.get("accepted_phase_remains") == 5, "accepted phase must remain 5 during astronomy amendment")
require(
    astronomy_amendment.get("accepted_application_version_remains") == "0.5.0",
    "accepted app version must remain 0.5.0 during astronomy amendment",
)
require(
    astronomy_amendment.get("reserved_contracts")
    == [
        "ObserverContext",
        "TimeContext",
        "ExternalLayerProvider",
        "RouteProvider",
        "CelestialComputationProvider",
        "EclipsePredictionProvider",
    ],
    "astronomy amendment contract set drifted",
)
require(
    astronomy_amendment.get("calculation_classes")
    == [
        "reference-ephemeris",
        "historical-cycle",
        "external-comparative-model",
        "model-native",
        "display-only",
    ],
    "astronomy amendment calculation classes drifted",
)
require(
    astronomy_amendment.get("revised_phases") == [9, 10, 11, 12, 17, 20],
    "astronomy amendment revised phase set drifted",
)
require(
    astronomy_amendment.get("source_registry") == "data/sources/astronomy-comparative-sources.yaml",
    "astronomy amendment source registry drifted",
)
require(astronomy_amendment.get("pr") == 27, "astronomy architecture amendment PR must be #27")
require(
    astronomy_amendment.get("pr_base") == "main",
    "astronomy amendment PR base must be main after PR #26 merge",
)
require(
    astronomy_amendment.get("merge_status") == "merged",
    "astronomy amendment PR #27 must be recorded as merged",
)
require(astronomy_amendment.get("verification_blocker") is None, "astronomy amendment verification blocker must be cleared after PR #26 merge")
require(
    astronomy_amendment.get("verification_head") == "eebf162e3dd1cf35e15933ff4622e7915bf0cd97",
    "astronomy amendment verification head drifted",
)
require(astronomy_amendment.get("verification_ci_run") == 720, "astronomy amendment verification CI must be #720")
require(
    astronomy_amendment.get("verification_ci_conclusion") == "success",
    "astronomy amendment verification CI #720 must remain success",
)
require(
    astronomy_amendment.get("merge_authorization") == "explicit-owner-instruction",
    "astronomy amendment merge authorization evidence missing",
)
require(
    astronomy_amendment.get("merge_authorization_statement") == "قم بدمج PR #27 إلى main",
    "astronomy amendment merge authorization statement drifted",
)
require(
    astronomy_amendment.get("final_closure_head") == "8d84c2e83a148a359fd0d75da7e5f3b21570ac22",
    "astronomy amendment final closure head drifted",
)
require(astronomy_amendment.get("final_closure_ci_run") == 726, "astronomy amendment final closure CI must be #726")
require(
    astronomy_amendment.get("final_closure_ci_conclusion") == "success",
    "astronomy amendment final closure CI #726 must remain success",
)
require(
    astronomy_amendment.get("merge_commit") == "5442852ef4bc2e760db39743d0bc7b3bc57d0b11",
    "astronomy amendment merge commit drifted",
)
require(astronomy_amendment.get("post_merge_main_ci_run") is None, "astronomy amendment must not fabricate an unseen post-merge CI run")
require(
    astronomy_amendment.get("post_merge_main_ci_conclusion") == "not-independently-observed",
    "astronomy amendment post-merge CI evidence state drifted",
)
require(astronomy_amendment.get("tag") == "not_created", "astronomy amendment must not create a tag")
require(astronomy_amendment.get("github_release") == "not_created", "astronomy amendment must not create a GitHub Release")
require(astronomy_amendment.get("deployment") == "not_created", "astronomy amendment must not deploy")

post_pr27 = data.get("post_pr27_merge_reconciliation", {})
require(post_pr27.get("status") == "closed", "post-PR27 reconciliation must remain closed")
require(post_pr27.get("pr") == 28, "post-PR27 reconciliation PR must be #28")
require(
    post_pr27.get("baseline_commit") == "5442852ef4bc2e760db39743d0bc7b3bc57d0b11",
    "post-PR27 reconciliation historical baseline drifted",
)
require(post_pr27.get("pr27_status") == "merged", "post-PR27 reconciliation must record PR #27 merged")
require(
    post_pr27.get("pr27_final_head") == "8d84c2e83a148a359fd0d75da7e5f3b21570ac22",
    "post-PR27 final head drifted",
)
require(post_pr27.get("pr27_pre_merge_ci_run") == 726, "post-PR27 record must preserve CI #726")
require(post_pr27.get("pr27_pre_merge_ci_conclusion") == "success", "post-PR27 CI #726 must remain success")
require(
    post_pr27.get("pr27_prior_verification_head") == "eebf162e3dd1cf35e15933ff4622e7915bf0cd97",
    "post-PR27 prior verification head drifted",
)
require(post_pr27.get("pr27_prior_verification_ci_run") == 720, "post-PR27 prior verification CI must be #720")
require(post_pr27.get("pr27_prior_verification_ci_conclusion") == "success", "post-PR27 prior verification CI #720 must remain success")
require(
    post_pr27.get("pr27_merge_commit") == "5442852ef4bc2e760db39743d0bc7b3bc57d0b11",
    "post-PR27 merge commit drifted",
)
require(post_pr27.get("pr27_post_merge_ci_run") is None, "post-PR27 reconciliation must not fabricate PR #27 post-merge CI")
require(
    post_pr27.get("pr27_post_merge_ci_conclusion") == "not-independently-observed",
    "post-PR27 PR #27 post-merge CI evidence state drifted",
)
require(
    post_pr27.get("astronomy_amendment_status") == "closed-verified-merged",
    "astronomy amendment must remain closed/verified/merged in post-PR27 record",
)
require(post_pr27.get("p6_6_status") == "not_started", "P6.6 must remain not_started in post-PR27 record")
require(post_pr27.get("accepted_phase") == 5, "accepted phase must remain 5 in post-PR27 record")
require(
    post_pr27.get("accepted_application_version") == "0.5.0",
    "accepted application version must remain 0.5.0 in post-PR27 record",
)
require(post_pr27.get("phase6_status") == "in_progress", "Phase 6 must remain in_progress in post-PR27 record")
require(post_pr27.get("runtime_astronomy_status") == "not_started", "runtime astronomy must remain not_started in post-PR27 record")
require(post_pr27.get("tag") == "not_created", "post-PR27 reconciliation must not create a tag")
require(post_pr27.get("github_release") == "not_created", "post-PR27 reconciliation must not create a GitHub Release")
require(post_pr27.get("deployment") == "not_created", "post-PR27 reconciliation must not deploy")
require(
    post_pr27.get("verification_head") == "018e6a7984dcf682e94f36668333ea00ccbaf085",
    "post-PR27 reconciliation initial verification head drifted",
)
require(post_pr27.get("verification_ci_run") == 738, "post-PR27 initial verification CI must be #738")
require(
    post_pr27.get("verification_ci_conclusion") == "success",
    "post-PR27 initial verification CI #738 must remain success",
)
require(post_pr27.get("merge_status") == "merged", "post-PR27 reconciliation PR #28 must be recorded as merged")
require(
    post_pr27.get("merge_authorization") == "explicit-owner-instruction",
    "post-PR27 reconciliation PR #28 merge authorization evidence missing",
)
require(
    post_pr27.get("final_closure_head") == "8f6b69c90148e0c5e9200ebab2dfab88ed0f5789",
    "post-PR27 reconciliation final closure head drifted",
)
require(post_pr27.get("final_closure_ci_run") == 744, "post-PR27 reconciliation final closure CI must be #744")
require(
    post_pr27.get("final_closure_ci_conclusion") == "success",
    "post-PR27 reconciliation final closure CI #744 must remain success",
)
require(
    post_pr27.get("merge_commit") == "a96f47b95c542c2eafb21771bc7c53e7ab40d170",
    "post-PR27 reconciliation PR #28 merge commit drifted",
)
require(post_pr27.get("post_merge_main_ci_run") is None, "post-PR27 reconciliation must not fabricate PR #28 post-merge CI")
require(
    post_pr27.get("post_merge_main_ci_conclusion") == "not-independently-observed",
    "post-PR27 reconciliation PR #28 post-merge CI evidence state drifted",
)

post_pr28 = data.get("post_pr28_merge_reconciliation", {})
require(post_pr28.get("status") == "closed", "post-PR28 reconciliation must remain closed")
require(post_pr28.get("pr") == 29, "post-PR28 reconciliation PR must be #29")
require(
    post_pr28.get("baseline_commit") == "a96f47b95c542c2eafb21771bc7c53e7ab40d170",
    "post-PR28 historical baseline drifted",
)
require(post_pr28.get("pr28_status") == "merged", "post-PR28 reconciliation must record PR #28 merged")
require(
    post_pr28.get("verification_head") == "3e23d2074a65ce6422e378b7a62211627157c968",
    "post-PR28 initial verification head drifted",
)
require(post_pr28.get("verification_ci_run") == 753, "post-PR28 initial verification CI must be #753")
require(post_pr28.get("verification_ci_conclusion") == "success", "post-PR28 initial verification CI #753 must remain success")
require(post_pr28.get("merge_status") == "merged", "post-PR28 reconciliation PR #29 must be recorded as merged")
require(
    post_pr28.get("merge_authorization") == "explicit-owner-instruction",
    "post-PR28 reconciliation PR #29 merge authorization evidence missing",
)
require(
    post_pr28.get("merge_authorization_statement") == "أبدأ دمج PR #29 إلى `main`",
    "post-PR28 reconciliation merge authorization statement drifted",
)
require(
    post_pr28.get("final_closure_head") == "7751e76c1d3fe3e8c129436717042a49040ead4b",
    "post-PR28 reconciliation final closure head drifted",
)
require(post_pr28.get("final_closure_ci_run") == 754, "post-PR28 reconciliation final closure CI must be #754")
require(
    post_pr28.get("final_closure_ci_conclusion") == "success",
    "post-PR28 reconciliation final closure CI #754 must remain success",
)
require(
    post_pr28.get("merge_commit") == "8ac38042050f24c0ec30e30b32d37cd1900abf92",
    "post-PR28 reconciliation PR #29 merge commit drifted",
)
require(post_pr28.get("post_merge_main_ci_run") is None, "post-PR28 reconciliation must not fabricate PR #29 post-merge CI")
require(
    post_pr28.get("post_merge_main_ci_conclusion") == "not-independently-observed",
    "post-PR28 reconciliation PR #29 post-merge CI evidence state drifted",
)
require(post_pr28.get("p6_6_status") == "not_started", "P6.6 must remain not_started in post-PR28 record")

post_pr29 = data.get("post_pr29_merge_reconciliation", {})
require(post_pr29.get("status") == "closed", "post-PR29 reconciliation must be closed after initial verification")
require(post_pr29.get("pr") == 30, "post-PR29 reconciliation PR must be #30")
require(
    post_pr29.get("branch") == "docs/post-pr29-merge-reconciliation",
    "post-PR29 reconciliation branch drifted",
)
require(
    post_pr29.get("baseline_commit") == "8ac38042050f24c0ec30e30b32d37cd1900abf92",
    "post-PR29 reconciliation baseline drifted",
)
require(post_pr29.get("pr29_status") == "merged", "post-PR29 reconciliation must record PR #29 merged")
require(
    post_pr29.get("pr29_initial_verification_head") == "3e23d2074a65ce6422e378b7a62211627157c968",
    "post-PR29 PR #29 initial verification head drifted",
)
require(post_pr29.get("pr29_initial_verification_ci_run") == 753, "post-PR29 record must preserve CI #753")
require(post_pr29.get("pr29_initial_verification_ci_conclusion") == "success", "post-PR29 CI #753 must remain success")
require(
    post_pr29.get("pr29_final_head") == "7751e76c1d3fe3e8c129436717042a49040ead4b",
    "post-PR29 PR #29 final head drifted",
)
require(post_pr29.get("pr29_pre_merge_ci_run") == 754, "post-PR29 record must preserve CI #754")
require(post_pr29.get("pr29_pre_merge_ci_conclusion") == "success", "post-PR29 CI #754 must remain success")
require(
    post_pr29.get("pr29_merge_commit") == "8ac38042050f24c0ec30e30b32d37cd1900abf92",
    "post-PR29 PR #29 merge commit drifted",
)
require(post_pr29.get("pr29_post_merge_ci_run") is None, "post-PR29 reconciliation must not fabricate PR #29 post-merge CI")
require(
    post_pr29.get("pr29_post_merge_ci_conclusion") == "not-independently-observed",
    "post-PR29 PR #29 post-merge CI evidence state drifted",
)
require(post_pr29.get("p6_6_owner_start_intent_recorded") is True, "P6.6 owner start intent must remain recorded")
require(post_pr29.get("p6_6_status") == "not_started", "P6.6 must remain not_started during post-PR29 reconciliation")
require(post_pr29.get("accepted_phase") == 5, "accepted phase must remain 5 during post-PR29 reconciliation")
require(post_pr29.get("accepted_application_version") == "0.5.0", "accepted version must remain 0.5.0 during post-PR29 reconciliation")
require(post_pr29.get("phase6_status") == "in_progress", "Phase 6 must remain in_progress during post-PR29 reconciliation")
require(post_pr29.get("runtime_astronomy_status") == "not_started", "runtime astronomy must remain not_started during post-PR29 reconciliation")
require(post_pr29.get("tag") == "not_created", "post-PR29 reconciliation must not create a tag")
require(post_pr29.get("github_release") == "not_created", "post-PR29 reconciliation must not create a GitHub Release")
require(post_pr29.get("deployment") == "not_created", "post-PR29 reconciliation must not deploy")
require(
    post_pr29.get("verification_head") == "0ccd24dbbc665c81dfa8cddec82ffde4ca9ef448",
    "post-PR29 initial verification head drifted",
)
require(post_pr29.get("verification_ci_run") == 758, "post-PR29 initial verification CI must be #758")
require(
    post_pr29.get("verification_ci_conclusion") == "success",
    "post-PR29 initial verification CI #758 must remain success",
)
require(post_pr29.get("merge_status") == "merged", "post-PR29 reconciliation PR #30 must be recorded as merged")
require(
    post_pr29.get("merge_authorization") == "explicit-owner-instruction",
    "post-PR29 reconciliation PR #30 merge authorization evidence missing",
)
require(
    post_pr29.get("merge_authorization_statement") == "ادمج PR #30 وابدأ P6.6",
    "post-PR29 reconciliation merge authorization statement drifted",
)
require(
    post_pr29.get("final_closure_head") == "14c69a8cb1aaae2b375803e6400efe24aa83fd03",
    "post-PR29 final closure head drifted",
)
require(post_pr29.get("final_closure_ci_run") == 759, "post-PR29 final closure CI must be #759")
require(post_pr29.get("final_closure_ci_conclusion") == "success", "post-PR29 final closure CI #759 must remain success")
require(
    post_pr29.get("merge_commit") == "1c64285b92c093365b74f3256aa9557b9a48268e",
    "post-PR29 PR #30 merge commit drifted",
)
require(post_pr29.get("post_merge_main_ci_run") is None, "post-PR29 record must not fabricate PR #30 post-merge CI")
require(
    post_pr29.get("post_merge_main_ci_conclusion") == "not-independently-observed",
    "post-PR29 PR #30 post-merge CI evidence state drifted",
)

p6_6_start = phase6_start.get("p6_6_start", {})
require(p6_6_start.get("decision") == "started-by-owner-after-pr30-merge", "P6.6 start decision missing")
require(p6_6_start.get("owner_statement") == "ادمج PR #30 وابدأ P6.6", "P6.6 owner start statement drifted")
require(
    p6_6_start.get("baseline_commit") == "1c64285b92c093365b74f3256aa9557b9a48268e",
    "P6.6 baseline drifted",
)
require(p6_6_start.get("baseline_pre_merge_ci_run") == 759, "P6.6 baseline CI must preserve #759")
require(p6_6_start.get("baseline_pre_merge_ci_conclusion") == "success", "P6.6 baseline CI #759 must remain success")
require(p6_6_start.get("branch") == "feat/p6.6-polygon-perimeter-area", "P6.6 branch drifted")
require(p6_6_start.get("accepted_phase_remains") == 5, "P6.6 must not change accepted phase")
require(p6_6_start.get("accepted_application_version_remains") == "0.5.0", "P6.6 must not change accepted version")

require(p6_6_start.get("status") == "closed", "P6.6 start record must now reflect closed state")
require(
    p6_6_start.get("owner_manual_status") == "pass-reported-by-owner",
    "P6.6 owner manual status missing",
)
require(
    p6_6_start.get("owner_tested_head") == "4cb8c04b40fbea35745f4091a4bf5e849c34b299",
    "P6.6 owner-tested head drifted",
)
require(p6_6_start.get("pre_manual_ci_run") == 769, "P6.6 owner manual verification must follow CI #769")
require(
    p6_6_start.get("pre_manual_ci_conclusion") == "success",
    "P6.6 pre-manual CI #769 must remain success",
)
require(p6_6_start.get("pr") == 31, "P6.6 must reference PR #31")
require(p6_6_start.get("pr_status") == "merged", "P6.6 PR #31 must be recorded as merged")
require(phase6_start.get("p6_6_status") == "closed", "P6.6 corrected contract must be closed")

p6_6_automated = phase6_start.get("p6_6_automated", {})
require(
    p6_6_automated.get("owner_tested_head") == "4cb8c04b40fbea35745f4091a4bf5e849c34b299",
    "P6.6 automated owner-tested head drifted",
)
require(p6_6_automated.get("ci_run") == 769, "P6.6 automated CI must be #769")
require(p6_6_automated.get("ci_conclusion") == "success", "P6.6 automated CI #769 must remain success")
require(p6_6_automated.get("frontend_core_tests_passed") == 129, "P6.6 frontend core count must be 129")
require(p6_6_automated.get("browser_acceptance_tests_passed") == 23, "P6.6 browser acceptance count must be 23")
require(p6_6_automated.get("polygon_parity_cases") == 104, "P6.6 polygon parity case count must be 104")

p6_6_manual = phase6_start.get("p6_6_owner_manual", {})
require(p6_6_manual.get("result") == "pass-reported-by-owner", "P6.6 owner manual PASS evidence missing")
require(p6_6_manual.get("checklist_items_passed") == 6, "P6.6 owner manual checklist must record 6/6")
require(
    p6_6_manual.get("tested_head") == "4cb8c04b40fbea35745f4091a4bf5e849c34b299",
    "P6.6 manual tested head drifted",
)
require(p6_6_manual.get("pre_manual_ci_run") == 769, "P6.6 manual verification must follow CI #769")
require(p6_6_manual.get("pre_manual_ci_conclusion") == "success", "P6.6 pre-manual CI #769 must remain success")
for field in [
    "basic_polygon_and_implicit_closure",
    "reversed_orientation_invariance",
    "live_add_reorder_remove",
    "repeated_explicit_closure_rejected",
    "backend_stop_browser_fallback",
    "minimum_vertex_stale_result_fail_closed",
]:
    require(
        p6_6_manual.get(field) == "pass-reported-by-owner",
        f"P6.6 manual evidence missing: {field}",
    )

p6_6_closure = phase6_start.get("p6_6_closure", {})
require(
    p6_6_closure.get("status") == "closed-verified-merged",
    "P6.6 corrected closure lifecycle must be closed/verified/merged",
)
require(p6_6_closure.get("report") == "docs/PHASE_6_P6_6_REPORT.md", "P6.6 closure report path drifted")
require(p6_6_closure.get("pr") == 31, "P6.6 closure must reference PR #31")
require(p6_6_closure.get("merge_status") == "merged", "P6.6 PR #31 must be merged")
require(
    p6_6_closure.get("merge_authorization") == "explicit-owner-instruction",
    "P6.6 merge authorization evidence missing",
)
require(p6_6_closure.get("next_slice") == "P6.7A", "P6.6 next slice must remain P6.7A")
require(p6_6_closure.get("next_slice_status") == "not_started", "P6.7A must remain not_started")
require(p6_6_closure.get("accepted_phase_remains") == 5, "P6.6 closure must not accept Phase 6")
require(p6_6_closure.get("accepted_application_version_remains") == "0.5.0", "P6.6 closure must not change accepted version")
require(p6_6_closure.get("tag") == "not_created", "P6.6 closure must not create a tag")
require(p6_6_closure.get("github_release") == "not_created", "P6.6 closure must not create a GitHub Release")
require(p6_6_closure.get("deployment") == "not_created", "P6.6 closure must not deploy")
require((ROOT / "docs" / "PHASE_6_P6_6_REPORT.md").is_file(), "P6.6 closure report missing")
require(
    p6_6_closure.get("final_closure_head") == "1d84ba85ba21d320a0de0ed16d87006c5ef80c84",
    "P6.6 final closure head drifted",
)
require(p6_6_closure.get("final_closure_ci_run") == 784, "P6.6 final closure CI must be #784")
require(p6_6_closure.get("final_closure_ci_conclusion") == "success", "P6.6 final closure CI #784 must remain success")
require(p6_6_closure.get("merge_commit") == "6a2666112e56514051ea62fbe1c25f5a8016f1ae", "P6.6 merge commit drifted")
require(p6_6_closure.get("post_merge_main_ci_run") is None, "P6.6 must not invent post-merge CI")

p6_6_merge = phase6_start.get("p6_6_merge", {})
require(p6_6_merge.get("decision") == "merged-by-separate-owner-authorization", "P6.6 merge decision missing")
require(p6_6_merge.get("pr") == 31, "P6.6 merge must reference PR #31")
require(p6_6_merge.get("corrected_pre_manual_ci_run") == 783, "P6.6 corrected owner baseline CI must be #783")
require(p6_6_merge.get("corrected_owner_manual") == "6/6-pass-reported-by-owner", "P6.6 corrected owner manual evidence missing")
require(p6_6_merge.get("final_head") == "1d84ba85ba21d320a0de0ed16d87006c5ef80c84", "P6.6 merge final head drifted")
require(p6_6_merge.get("pre_merge_ci_run") == 784, "P6.6 pre-merge CI must be #784")
require(p6_6_merge.get("pre_merge_ci_conclusion") == "success", "P6.6 pre-merge CI #784 must remain success")
require(p6_6_merge.get("merge_commit") == "6a2666112e56514051ea62fbe1c25f5a8016f1ae", "P6.6 merge commit evidence drifted")
require(p6_6_merge.get("post_merge_ci_run") is None, "P6.6 merge record must not invent post-merge CI")

post_pr31 = data.get("post_pr31_merge_reconciliation", {})
require(post_pr31.get("status") == "closed-verified-merged", "post-PR31 reconciliation must be closed/verified/merged")
require(post_pr31.get("branch") == "docs/post-pr31-merge-reconciliation", "post-PR31 reconciliation branch drifted")
require(post_pr31.get("baseline_commit") == "6a2666112e56514051ea62fbe1c25f5a8016f1ae", "post-PR31 reconciliation baseline drifted")
require(post_pr31.get("pr31_status") == "merged", "post-PR31 reconciliation must record PR #31 merged")
require(post_pr31.get("pr31_pre_merge_ci_run") == 784, "post-PR31 baseline must preserve #784")
require(post_pr31.get("p6_6_status") == "closed-verified-merged", "P6.6 state drifted during reconciliation")
require(post_pr31.get("p6_7a_status") == "started-after-reconciliation-merge", "P6.7A start-after-reconciliation evidence missing")
require(post_pr31.get("accepted_phase") == 5, "accepted phase must remain 5 during post-PR31 reconciliation")
require(post_pr31.get("accepted_application_version") == "0.5.0", "accepted version must remain 0.5.0")
require(post_pr31.get("phase6_status") == "in_progress", "Phase 6 must remain in progress")
require(post_pr31.get("tag") == "not_created", "post-PR31 reconciliation must not create a tag")
require(post_pr31.get("github_release") == "not_created", "post-PR31 reconciliation must not create a GitHub Release")
require(post_pr31.get("deployment") == "not_created", "post-PR31 reconciliation must not deploy")
require(post_pr31.get("verification_head") == "d2bae09cb9ee8e35954bdd4036d2e7b710b8969d", "post-PR31 reconciliation verification head drifted")
require(post_pr31.get("verification_ci_run") == 790, "post-PR31 reconciliation verification CI must be #790")
require(post_pr31.get("verification_ci_conclusion") == "success", "post-PR31 reconciliation CI #790 must remain success")
require(post_pr31.get("pr") == 33, "post-PR31 reconciliation must reference PR #33")
require(post_pr31.get("merge_status") == "merged", "PR #33 must be recorded as merged")
require(post_pr31.get("merge_authorization") == "explicit-owner-instruction", "PR #33 merge authorization evidence missing")
require(post_pr31.get("final_head") == "a72249b35250e3aeee1c3dbfac9c59dd89a7edfb", "PR #33 final head drifted")
require(post_pr31.get("final_pre_merge_ci_run") == 803, "PR #33 pre-merge CI must be #803")
require(post_pr31.get("final_pre_merge_ci_conclusion") == "success", "PR #33 pre-merge CI #803 must remain success")
require(post_pr31.get("merge_commit") == "1825852da81c04cee8e5b9f73dba28b55068c000", "PR #33 merge commit drifted")
require(post_pr31.get("post_merge_main_ci_run") is None, "do not invent an unseen PR #33 post-merge CI run")


p6_6_audit = phase6_start.get("p6_6_measurement_audit", {})
require(p6_6_audit.get("decision") == "owner-approved-reopen-and-implement", "P6.6 audit owner decision missing")
require(
    p6_6_audit.get("owner_statement") == "موافق على جميع مقترحاتك، تستطيع البدء",
    "P6.6 audit owner statement drifted",
)
require(
    p6_6_audit.get("status") == "closed-verified-merged",
    "P6.6 corrected measurement audit must be closed/verified/merged",
)
require(p6_6_audit.get("pr") == 31, "P6.6 measurement audit must remain on PR #31")
require(
    p6_6_audit.get("identities")
    == [
        "gleason-map-ruler-derived",
        "gleason-historical-longitude-scale",
        "gleason-frame-time-calculator",
    ],
    "P6.6 audited Gleason identities drifted",
)
require(p6_6_audit.get("prior_final_ci_run") == 771, "P6.6 audit must preserve prior #771 evidence")
require(p6_6_audit.get("prior_final_ci_conclusion") == "success", "P6.6 prior #771 must remain success")
require(p6_6_audit.get("p6_7a_status") == "not_started", "P6.7A must remain not_started")
require(p6_6_audit.get("video_fixture_count") == 5, "P6.6 video fixture registry must contain five audited videos")
require(
    p6_6_audit.get("preferred_scale_profile", {}).get("id") == "gleason-fig43-circle-derived",
    "P6.6 preferred Gleason scale profile drifted",
)
require(
    abs(p6_6_audit.get("preferred_scale_profile", {}).get("distance_per_nru", 0) - (21600 / math.pi)) < 1e-12,
    "P6.6 historical scale must remain 21600/pi per NRU",
)
require(
    p6_6_audit.get("legacy_scale_profile", {}).get("id") == "gleason-radial-60nm-legacy",
    "P6.6 legacy scale profile drifted",
)
require(
    p6_6_audit.get("legacy_scale_profile", {}).get("status") == "comparison_only",
    "P6.6 radial-60 profile must remain comparison-only",
)
require(
    p6_6_audit.get("external_scale_profile", {}).get("id") == "walter-eq-configurable",
    "P6.6 Walter external profile drifted",
)
require(
    p6_6_audit.get("restored_raster", {}).get("pdf_sha256")
    == "26105ca1f98ec9d862eb5ab52ef94b01b8b4f642a41b678cf5fbe21cff19f327",
    "restored Gleason PDF SHA-256 drifted",
)
require(
    p6_6_audit.get("restored_raster", {}).get("raster_sha256")
    == "dc7f96ef7a473a4db334f721ce54963474792814280cf21dd00307f4b14619b0",
    "restored Gleason raster SHA-256 drifted",
)
require(p6_6_audit.get("restored_raster", {}).get("city_control_points") == 0, "Gleason raster must not fabricate city control points")
require(
    p6_6_audit.get("ci_status") == "final-closure-success",
    "corrected P6.6 contract final closure CI must be recorded as success",
)
require(
    p6_6_audit.get("manual_verification_status") == "pass-reported-by-owner",
    "corrected P6.6 owner manual PASS evidence missing",
)
require(p6_6_audit.get("manual_checklist_items_passed") == 6, "corrected P6.6 checklist must record 6/6")
require(
    p6_6_audit.get("owner_tested_head") == "e96712975fc9f54f2615e235bb6976136efe8a2d",
    "corrected P6.6 owner-tested head drifted",
)
require(p6_6_audit.get("pre_manual_ci_run") == 783, "corrected P6.6 owner testing must follow CI #783")
require(p6_6_audit.get("pre_manual_ci_conclusion") == "success", "corrected P6.6 pre-manual CI #783 must remain success")
for field in [
    "corrected_historical_scale_and_legacy_separation",
    "fig43_latitude_dependent_fail_closed",
    "frame_time_conversion",
    "restored_raster_provisional_georeferencing",
    "polygon_scale_separation",
    "cross_slice_regression",
]:
    require(
        p6_6_audit.get("manual_checks", {}).get(field) == "pass-reported-by-owner",
        f"corrected P6.6 manual evidence missing: {field}",
    )
require((ROOT / "docs" / "GLEASON_MEASUREMENT_VIDEO_BOOK_AUDIT_2026-09-21.md").is_file(), "Gleason audit doc missing")
require((ROOT / "data" / "sources" / "gleason-video-measurement-audit.yaml").is_file(), "Gleason video audit registry missing")

astronomy_sources = (ROOT / "data" / "sources" / "astronomy-comparative-sources.yaml").read_text(encoding="utf-8")
for marker in [
    "shane-personal-celestial-sphere",
    "shane-fe-model-license",
    "walter-bislin-fe-dome",
    "walter-bislin-fe-dome-heliocentric-basis",
    "nasa-solar-saros-periodicity",
    "nasa-lunar-saros-periodicity",
    "brack-bernsen-steele-2005",
    "british-museum-map-of-world-92687",
    "external-comparative-model",
    "historical-cycle",
    "pin_snapshot_hash_before_runtime_code_reuse: true",
]:
    require(marker in astronomy_sources, f"astronomy source registry marker missing: {marker}")

astronomy_roadmap = (ROOT / "docs" / "ROADMAP_ASTRONOMY_ARCHITECTURE_AMENDMENT_2026-09-21.md").read_text(encoding="utf-8")
for marker in [
    "CelestialComputationProvider",
    "EclipsePredictionProvider",
    "ObserverCelestialSphere",
    "PhysicalHeavensModel",
    "Babylonian 223-Month Eclipse Cycle",
    "P9.6",
    "P10.7",
    "P11.6",
    "P12.9",
    "Revised Phase 17",
    "Revised Phase 20",
]:
    require(marker in astronomy_roadmap, f"astronomy roadmap marker missing: {marker}")

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
require(phase6_start.get("p6_3_status") == "closed", "P6.3 must remain closed after its closure")

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
require(post_pr19.get("status") == "closed", "post-PR19 reconciliation must be closed after verification")
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
require(
    post_pr19.get("verification_head") == "813d2268d74dd0b7ff1a1336b461e6281b71d392",
    "post-PR19 reconciliation verification head drifted",
)
require(post_pr19.get("verification_ci_run") == 644, "post-PR19 reconciliation verification CI must be #644")
require(
    post_pr19.get("verification_ci_conclusion") == "success",
    "post-PR19 reconciliation verification CI #644 must remain success",
)

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

owner_8k_registry_path = ROOT / "data" / "sources" / "gleason-owner-8k-map.yaml"
owner_8k_world_path = ROOT / "data" / "sources" / "artifacts" / "8k-Flat-Earth-map.jgw"
require(owner_8k_registry_path.is_file(), "owner-supplied 8K Gleason source registry missing")
require(owner_8k_world_path.is_file(), "owner-supplied 8K Gleason JGW source missing")
owner_8k_registry = owner_8k_registry_path.read_text(encoding="utf-8")
for marker in [
    "gleason-owner-8k-map-2026-09-22",
    "incomplete_bundle_waiting_for_companion_raster",
    "0ec28720f782561377aea0a23909336b707584e1ceade4cbeb382bdfd6c95a43",
    "bottom_measurement_ruler",
    "longitude_time_zone_frame",
    "crs: unknown_not_encoded_in_world_file",
    "preserve_original_resolution: true",
]:
    require(marker in owner_8k_registry, f"8K Gleason source registry marker missing: {marker}")
require(
    hashlib.sha256(owner_8k_world_path.read_bytes()).hexdigest()
    == "0ec28720f782561377aea0a23909336b707584e1ceade4cbeb382bdfd6c95a43",
    "owner-supplied 8K Gleason JGW SHA-256 drifted",
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
            "phase6_previous_slice": "P6.6",
            "phase6_previous_slice_status": "closed",
            "phase6_current_slice": "P6.7A",
            "phase6_current_slice_status": "in_progress",
            "phase6_next_slice": "P6.7B",
            "phase6_next_slice_status": "not_started",
        },
        ensure_ascii=False,
    )
)
