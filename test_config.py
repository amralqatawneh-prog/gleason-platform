from app.config import Settings


def test_cors_csv_is_normalized() -> None:
    settings = Settings(cors_origins="https://a.example, https://b.example")
    assert settings.cors_origins == ["https://a.example", "https://b.example"]


def test_api_prefix_is_normalized() -> None:
    assert Settings(api_prefix="api/custom/").api_prefix == "/api/custom"
