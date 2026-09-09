from app.config import Settings


def test_cors_csv_is_normalized() -> None:
    settings = Settings(cors_origins="https://a.example, https://b.example")
    assert settings.cors_origins == ["https://a.example", "https://b.example"]


def test_cors_csv_from_environment_is_normalized(monkeypatch) -> None:
    monkeypatch.setenv("APP_CORS_ORIGINS", "https://a.example, https://b.example")
    settings = Settings(_env_file=None)
    assert settings.cors_origins == ["https://a.example", "https://b.example"]


def test_database_url_uses_app_prefix(monkeypatch) -> None:
    url = "postgresql+psycopg://user:pass@db:5432/gleason"
    monkeypatch.setenv("APP_DATABASE_URL", url)
    settings = Settings(_env_file=None)
    assert settings.database_url == url


def test_api_prefix_is_normalized() -> None:
    assert Settings(api_prefix="api/custom/").api_prefix == "/api/custom"
