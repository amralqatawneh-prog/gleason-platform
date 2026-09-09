from __future__ import annotations


def platform_capabilities() -> dict[str, object]:
    """Server-advertised capabilities for Phase 1.

    Feature flags intentionally report only foundations that are actually implemented.
    """
    return {
        "release": "v0.1.0",
        "phase": 1,
        "offline_core": True,
        "pwa": True,
        "rtl_ltr": True,
        "webgl_fallback_shell": True,
        "gleason_projection": False,
        "ae_projection": False,
        "wgs84_globe": False,
        "astronomy_engine": False,
        "live_flights": False,
    }
