"""Real FastAPI + SQLite server for browser tests; ALL records are TEST-ONLY.

Never import this disposable catalog into a production database.
"""
import argparse
import json

from sqlalchemy import create_engine, text
import uvicorn
from app.config import Settings
from app.main import create_app

parser = argparse.ArgumentParser()
parser.add_argument("--database", required=True)
parser.add_argument("--port", type=int, default=8000)
args = parser.parse_args()
url = f"sqlite+pysqlite:///{args.database}"
engine = create_engine(url)
with engine.begin() as db:
    db.execute(text("""CREATE TABLE place_sources (
        source_id TEXT PRIMARY KEY, name TEXT, version TEXT, license TEXT, source_url TEXT)"""))
    db.execute(text("""CREATE TABLE places (
        id TEXT PRIMARY KEY, category TEXT, name TEXT, name_ar TEXT, aliases TEXT,
        country_code TEXT, region_code TEXT, latitude REAL, longitude REAL,
        source_id TEXT, source_record_id TEXT, search_text TEXT, quality TEXT)"""))
    db.execute(text("INSERT INTO place_sources VALUES ('TEST_ONLY_E2E','TEST-ONLY browser fixtures','test-v1','TEST-ONLY','https://example.invalid/e2e')"))
    for record, category, name, country, lat, lon in [
        ("test-doha", "city", "TEST Doha", "QA", 25.285447, 51.531040),
        ("test-amman", "city", "TEST Amman", "JO", 31.9454, 35.9284),
        ("test-country", "country", "TEST country", "QA", 25.3, 51.2),
        ("test-airport", "airport", "TEST airport", "QA", 25.273, 51.608),
    ]:
        arabic_name = "اختبار الدوحة" if record == "test-doha" else None
        db.execute(text("""INSERT INTO places VALUES (
            :id,:category,:name,:name_ar,'[]',:country,NULL,:lat,:lon,
            'TEST_ONLY_E2E',:id,:search,:quality)"""),
            dict(id=record, category=category, name=name, name_ar=arabic_name, country=country, lat=lat, lon=lon,
                 search=f"{name} {arabic_name or ''}".lower(), quality=json.dumps({"coordinate_classification": "TEST_ONLY_SYNTHETIC_POINT"})))
engine.dispose()
app = create_app(Settings(env="test", database_url=url, cors_origins=["*"]))
uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="warning")
