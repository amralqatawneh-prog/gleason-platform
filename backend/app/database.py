from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine


@dataclass(slots=True)
class DatabaseStatus:
    configured: bool
    reachable: bool
    dialect: str
    detail: str


class DatabaseManager:
    """Phase 1 database lifecycle wrapper.

    Development defaults to SQLite so the repository can boot without external services.
    Docker/production config switches the same interface to PostgreSQL/PostGIS.
    """

    def __init__(self, url: str) -> None:
        self.url = url
        self._engine: Engine | None = None

    def _ensure_sqlite_directory(self) -> None:
        prefix = "sqlite+pysqlite:///"
        if self.url.startswith(prefix):
            raw = self.url[len(prefix):]
            if raw and raw != ":memory:":
                Path(raw).parent.mkdir(parents=True, exist_ok=True)

    def engine(self) -> Engine:
        if self._engine is None:
            self._ensure_sqlite_directory()
            self._engine = create_engine(self.url, pool_pre_ping=True)
        return self._engine

    def probe(self) -> DatabaseStatus:
        try:
            engine = self.engine()
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return DatabaseStatus(True, True, engine.dialect.name, "ok")
        except Exception as exc:  # readiness reports failure instead of crashing app startup
            dialect = self.url.split(":", 1)[0]
            return DatabaseStatus(True, False, dialect, exc.__class__.__name__)

    def dispose(self) -> None:
        if self._engine is not None:
            self._engine.dispose()
            self._engine = None
