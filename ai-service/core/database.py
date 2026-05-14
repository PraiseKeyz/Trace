from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings

# Async engine — uses asyncpg driver (for FastAPI routes)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG_MODE,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

# Async session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Sync engine — uses psycopg2 driver (for gRPC handlers running in ThreadPoolExecutor)
_sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
sync_engine = create_engine(
    _sync_url,
    echo=settings.DEBUG_MODE,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)

sync_session = sessionmaker(bind=sync_engine, expire_on_commit=False)


async def get_db() -> AsyncSession:
    """FastAPI dependency that yields an async database session."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


def get_sync_db() -> Session:
    """Returns a sync database session for gRPC handlers."""
    return sync_session()

