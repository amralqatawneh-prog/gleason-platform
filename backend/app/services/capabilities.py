from __future__ import annotations


def platform_capabilities() -> dict[str, object]:
    """Server-advertised capabilities implemented through Phase 2."""
    return {
        "release": "v0.2.0",
        "phase": 2,
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
        "wgs84_globe": False,
        "astronomy_engine": False,
        "live_flights": False,
    }
