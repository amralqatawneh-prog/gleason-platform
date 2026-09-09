from app.database import DatabaseManager


def test_sqlite_probe_is_reachable(tmp_path) -> None:
    manager = DatabaseManager(f"sqlite+pysqlite:///{tmp_path / 'test.db'}")
    status = manager.probe()
    assert status.reachable is True
    assert status.dialect == "sqlite"
    manager.dispose()
