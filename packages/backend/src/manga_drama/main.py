from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from manga_drama.api.routes import api_router
from manga_drama.config import get_config
from manga_drama.database import get_engine
from manga_drama.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables (dev only; use Alembic in prod)
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()


def create_app() -> FastAPI:
    cfg = get_config()
    app = FastAPI(title="Manga Drama Studio", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cfg.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app


app = create_app()
