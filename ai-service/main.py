import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.cache import close_redis

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──
    logger.info("=" * 60)
    logger.info(f"  {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info("=" * 60)

    logger.info(f"Embedding model: {settings.EMBEDDING_MODEL_NAME}")
    logger.info(f"Device: {settings.MODEL_DEVICE}")

    # Pre-load the embedding model at startup to avoid first-request latency
    try:
        from core.embeddings import get_embedding_engine
        engine = get_embedding_engine()
        if engine.is_multilingual:
            logger.info("✅ Multilingual model loaded — multilingual matching enabled")
            logger.info(
                "   Supported languages: Afrikaans, Amharic, Hausa, Igbo, "
                "Malagasy, Chichewa, Oromo, Pidgin, Kinyarwanda, Kirundi, "
                "Shona, Somali, Sesotho, Swahili, Tigrinya, Wolof, Yoruba, "
                "English, French"
            )
        else:
            logger.warning("⚠️  AfroXLM-R not available — using TF-IDF fallback (no multilingual)")
    except Exception as e:
        logger.warning(f"⚠️  Model pre-load skipped: {e}")

    logger.info(f"Database: {settings.DATABASE_URL[:30]}...")
    logger.info(f"Redis: {settings.REDIS_URL}")
    logger.info("Service ready.")
    logger.info("=" * 60)

    yield

    # ── SHUTDOWN ──
    logger.info("Shutting down Trace AI Microservice...")
    await close_redis()
    logger.info("Goodbye.")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI/ML intelligence engine for the Trace economic platform. "
        "Provides identity scoring, multilingual opportunity matching "
        "(powered by multilingual sentence embeddings), and market "
        "intelligence generation. Called internally by the Node.js backend."
    ),
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.BACKEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.score import router as score_router
from api.match import router as match_router
from api.intelligence import router as intelligence_router

app.include_router(score_router, prefix="/score", tags=["Identity Engine"])
app.include_router(match_router, prefix="/match", tags=["Matching Engine"])
app.include_router(intelligence_router, prefix="/intelligence", tags=["Intelligence Engine"])


@app.get("/")
async def read_root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "description": "AI/ML intelligence engine for the Trace economic platform",
        "engines": {
            "identity": "POST /score/calculate",
            "matching": "POST /match/opportunities",
            "intelligence": "POST /intelligence/generate",
        },
        "docs": "/docs",
    }


@app.get("/health", tags=["System"])
async def health_check():
    from core.schemas import HealthResponse

    model_loaded = False
    multilingual = False
    try:
        from core.embeddings import get_embedding_engine
        engine = get_embedding_engine()
        model_loaded = engine.model is not None
        multilingual = engine.is_multilingual
    except Exception:
        pass

    redis_connected = False
    try:
        from core.cache import get_redis
        r = await get_redis()
        await r.ping()
        redis_connected = True
    except Exception:
        pass

    db_connected = False
    try:
        from core.database import engine as db_engine
        from sqlalchemy import text
        async with db_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_connected = True
    except Exception:
        pass

    if db_connected and redis_connected:
        status = "healthy" if model_loaded else "degraded"
    else:
        status = "unhealthy"

    return HealthResponse(
        status=status,
        version=settings.APP_VERSION,
        model_loaded=model_loaded,
        model_name=settings.EMBEDDING_MODEL_NAME,
        multilingual=multilingual,
        database_connected=db_connected,
        redis_connected=redis_connected,
    )
