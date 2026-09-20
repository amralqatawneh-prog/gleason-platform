from __future__ import annotations
from ..version import APP_VERSION, IMPLEMENTATION_PHASE, ACCEPTED_PHASE, PHASE_STATUS


def platform_capabilities() -> dict[str, object]:
    """Implemented features and acceptance status are separate claims."""
    return {
        "release": f"v{APP_VERSION}",
        "phase": IMPLEMENTATION_PHASE,
        "accepted_phase": ACCEPTED_PHASE,
        "phase_status": PHASE_STATUS,
        "offline_core": True,
        "pwa": True,
        "rtl_ltr": True,
        "webgl_fallback_shell": True,
        "gleason_projection": True,
        "ae_projection": True,
        "interactive_2d_map": True,
        "historical_source_viewer": True,
        "historical_georeferencing_engine": True,
        "historical_scan_embedded": False,
        "core_world_pack": True,
        "wgs84_globe": True,
        "wgs84_reference_api": True,
        "wgs84_offline_math": True,
        "place_search": True,
        "regional_search_packs": True,
        "cross_model_synchronization": True,
        "measurement_semantics_contract": True,
        "ordered_route_state": True,
        "ordered_route_persistence": False,
        "measurement_engine": True,
        "wgs84_route_distance": True,
        "route_engine": False,
        "area_engine": False,
        "astronomy_engine": False,
        "live_flights": False,
    }
