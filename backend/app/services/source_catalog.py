from __future__ import annotations

GLEASON_SOURCE_CATALOG: dict[str, object] = {
    "source_id": "gleason-1893-upload-v1",
    "title": "Is the Bible from Heaven? Is the Earth a Globe?",
    "edition": "Second Edition, revised and enlarged",
    "uploaded_sha256": "03e429285376c7fcd21659116f43a8da7d6e363169e7c7841c9b31518effbe60",
    "status": "project-source",
    "figures": [
        {"figure": "Fig. 30", "pdf_pages": [360, 361], "topic": "Illustrative spiral course of the sun", "evidence_level": "DOCUMENTED", "warning": "The author explicitly states no claim of exactness for the diagram construction."},
        {"figure": "Fig. 38 / circular map description", "pdf_pages": [376, 377], "topic": "Longitude/time scale and circular map with radial latitude arms", "evidence_level": "DOCUMENTED"},
        {"figure": "Fig. 43", "pdf_pages": [429], "topic": "Historical longitude-mile rule north and south of the Equator", "evidence_level": "DOCUMENTED"},
    ],
    "georeferencing": {
        "engine": "available",
        "historical_scan": "not-embedded",
        "reason": "No verified distributable scan of the standalone historical world map is stored in the repository; control points are therefore not fabricated.",
    },
}


def source_catalog() -> dict[str, object]:
    return GLEASON_SOURCE_CATALOG
