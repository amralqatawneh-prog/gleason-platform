from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api.router import router
from .config import Settings, get_settings
from .database import DatabaseManager
from .errors import install_error_handlers
from .logging_config import configure_logging
from .middleware import install_middleware


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.log_level)
    database = DatabaseManager(settings.database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI):  # type: ignore[no-untyped-def]
        app.state.database = database
        yield
        database.dispose()

    app = FastAPI(
        title="Gleason Comparison Platform API",
        version="0.1.0",
        debug=settings.debug,
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.database = database
    install_middleware(app, settings)
    install_error_handlers(app)
    app.include_router(router, prefix=settings.api_prefix)

    @app.get("/", include_in_schema=False)
    def root() -> dict[str, str]:
        return {"name": "Gleason Comparison Platform API", "version": "0.1.0"}

    return app


app = create_app()
