from __future__ import annotations

from sqlalchemy import create_engine, text

from app.domain.places import PlaceCategory
from app.services.place_search import search_places
from app.services.offline_search_packs import build_offline_search_pack


FIXTURES = [
    ("test-country", "country", "Testland", "بلد الاختبار", "TL", None, 10.0, 20.0, "c1"),
    ("test-city", "city", "Test City", "مدينة الاختبار", "TL", "TL-01", 11.0, 21.0, "city1"),
    ("test-sea", "sea", "Test Sea", "بحر الاختبار", None, None, 12.0, 22.0, "sea1"),
    ("test-ocean", "ocean", "Test Ocean", "محيط الاختبار", None, None, 13.0, 23.0, "ocean1"),
    ("test-river", "river", "Test River", "نهر الاختبار", None, None, 14.0, 24.0, "river1"),
    ("test-mountain", "mountain", "Test Mountain", "جبل الاختبار", "TL", None, 15.0, 25.0, "mountain1"),
    ("test-airport", "airport", "Test Airport", "مطار الاختبار", "TL", None, 16.0, 26.0, "airport1"),
]


def fixture_engine():
    engine = create_engine("sqlite+pysqlite:///:memory:")
    with engine.begin() as connection:
        connection.execute(text("""
            CREATE TABLE place_sources (
                source_id TEXT PRIMARY KEY, name TEXT NOT NULL, version TEXT,
                license TEXT NOT NULL, source_url TEXT NOT NULL
            )
        """))
        connection.execute(text("""
            CREATE TABLE places (
                id TEXT PRIMARY KEY, category TEXT NOT NULL, name TEXT NOT NULL,
                name_ar TEXT, aliases TEXT NOT NULL DEFAULT '[]', country_code TEXT,
                region_code TEXT, latitude REAL NOT NULL, longitude REAL NOT NULL,
                source_id TEXT NOT NULL, source_record_id TEXT NOT NULL,
                search_text TEXT NOT NULL, quality TEXT NOT NULL DEFAULT '{}'
            )
        """))
        connection.execute(
            text("INSERT INTO place_sources VALUES ('test-source', 'Test fixtures', '1', 'TEST-ONLY', 'fixture://phase3')")
        )
        for item in FIXTURES:
            place_id, category, name, name_ar, country, region, lat, lon, record_id = item
            search_text = f"{name} {name_ar or ''} {country or ''} {region or ''}".lower()
            connection.execute(
                text("""
                    INSERT INTO places (
                        id, category, name, name_ar, aliases, country_code, region_code,
                        latitude, longitude, source_id, source_record_id, search_text
                    ) VALUES (
                        :id, :category, :name, :name_ar, '[]', :country, :region,
                        :lat, :lon, 'test-source', :record_id, :search_text
                    )
                """),
                {
                    "id": place_id, "category": category, "name": name, "name_ar": name_ar,
                    "country": country, "region": region, "lat": lat, "lon": lon,
                    "record_id": record_id, "search_text": search_text,
                },
            )
    return engine


def test_every_required_phase3_category_is_searchable() -> None:
    engine = fixture_engine()
    for category in PlaceCategory:
        result = search_places(engine, "Test", categories=[category])
        assert result.count == 1
        assert result.results[0].category == category
        assert result.results[0].source.license == "TEST-ONLY"


def test_arabic_name_search() -> None:
    result = search_places(fixture_engine(), "مطار الاختبار")
    assert result.count == 1
    assert result.results[0].id == "test-airport"


def test_country_filter_and_exact_ranking() -> None:
    engine = fixture_engine()
    result = search_places(engine, "Test City", country_code="tl")
    assert result.count == 1
    assert result.results[0].score == 100.0
    assert result.results[0].country_code == "TL"


def test_empty_catalog_is_safe() -> None:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    result = search_places(engine, "Doha")
    assert result.count == 0
    assert result.backend == "sqlite"


def test_search_and_offline_pack_preserve_source_and_coordinate_classification() -> None:
    engine = fixture_engine()
    with engine.begin() as connection:
        connection.execute(text("UPDATE places SET quality = :quality WHERE id = :id"),
                           {"quality": '{"coordinate_classification":"DERIVED_CENTROID"}', "id": "test-country"})
    online = search_places(engine, "Testland").results[0]
    pack = build_offline_search_pack(engine, pack_id="test-pack", version="test-only")
    entry = next(item for item in pack["entries"] if item["id"] == online.id)
    assert online.coordinate_classification == entry["coordinateClassification"] == "DERIVED_CENTROID"
    assert online.source.source_id == entry["sourceId"] == entry["source"]["sourceId"]
    assert online.source_record_id == entry["sourceRecordId"] == "c1"
    assert online.source.version == entry["source"]["version"] == "1"
    assert online.source.license == entry["source"]["license"] == "TEST-ONLY"
    assert online.source.source_url == entry["source"]["sourceUrl"] == "fixture://phase3"
    assert pack["provenanceRevision"] == 2
    # A missing classification must remain unknown, even when the category is known.
    unknown = next(item for item in pack["entries"] if item["id"] == "test-city")
    assert unknown["coordinateClassification"] is None
    assert search_places(engine, "Test City").results[0].coordinate_classification is None


def test_pack_serializer_used_by_cli_handles_jsonb_and_legacy_quality() -> None:
    from app.services.place_provenance import coordinate_classification
    assert coordinate_classification({"coordinate_classification": "SOURCE_POINT"}) == "SOURCE_POINT"
    assert coordinate_classification('{"coordinate_classification":"DERIVED_REPRESENTATIVE_POINT"}') == "DERIVED_REPRESENTATIVE_POINT"
    for value in [None, "broken", "[]", {}, {"coordinate_classification": 12}]:
        assert coordinate_classification(value) is None
