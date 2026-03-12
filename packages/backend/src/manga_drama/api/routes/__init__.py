from fastapi import APIRouter

from manga_drama.api.routes.health import router as health_router
from manga_drama.api.routes.projects import router as projects_router
from manga_drama.api.routes.characters import router as characters_router
from manga_drama.api.routes.scenes import router as scenes_router
from manga_drama.api.routes.episodes import router as episodes_router
from manga_drama.api.routes.props import router as props_router
from manga_drama.api.routes.panels import router as panels_router
from manga_drama.api.routes.runs import router as runs_router
from manga_drama.api.routes.settings import router as settings_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health_router)
api_router.include_router(projects_router)
api_router.include_router(characters_router)
api_router.include_router(scenes_router)
api_router.include_router(episodes_router)
api_router.include_router(props_router)
api_router.include_router(panels_router)
api_router.include_router(runs_router)
api_router.include_router(settings_router)
