from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from core.config import settings

# Async engine — uses asyncpg driver
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG_MODE,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

# Session factory
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncSession:
    """FastAPI dependency that yields a database session."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
