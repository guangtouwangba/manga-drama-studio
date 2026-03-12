from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from manga_drama.config import get_config

_engine = None
_session_factory = None


def get_engine():
    global _engine
    if _engine is None:
        cfg = get_config()
        _engine = create_async_engine(cfg.database.url, echo=cfg.debug)
    return _engine


def get_session_factory():
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _session_factory


async def get_db():
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
