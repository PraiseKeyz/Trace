from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):

    # ── Application ──────────────────────────────────────────────
    APP_NAME: str = "Trace AI Microservice"
    APP_VERSION: str = "1.0.0"
    DEBUG_MODE: bool = True
    LOG_LEVEL: str = "INFO"

    # ── Server ───────────────────────────────────────────────────
    AI_SERVICE_HOST: str = "0.0.0.0"
    AI_SERVICE_PORT: int = 8000
    GRPC_SERVICE_HOST: str = "[::]"
    GRPC_SERVICE_PORT: int = 50051

    # ── Database (PostgreSQL) ────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/trace_db"

    # ── Redis Cache ──────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 3600  # 1 hour default TTL

    # ── Backend communication ────────────────────────────────────
    BACKEND_URL: str = "http://localhost:3000"

    # ── ML / NLP ─────────────────────────────────────────────────
    # SentenceTransformers model for multilingual embeddings.
    # This is much lighter than Davlan/afro-xlmr-large and includes
    # SentenceTransformer metadata, so startup/downloads are friendlier.
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    EMBEDDING_DIMENSION: int = 384  # MiniLM fallback hashing dimension
    EMBEDDING_CACHE_SIZE: int = 10_000  # LRU cache entries for embeddings
    MODEL_DEVICE: str = "cpu"  # "cpu" or "cuda"
    HF_TOKEN: Optional[str] = None

    # ── Score Weights (Identity Engine) ──────────────────────────
    WEIGHT_TRANSACTION_HISTORY: float = 0.40
    WEIGHT_PLATFORM_ACTIVITY: float = 0.20
    WEIGHT_COMMUNITY_VOUCHING: float = 0.25
    WEIGHT_PROFILE_COMPLETENESS: float = 0.15

    # ── Match Weights (Matching Engine) ──────────────────────────
    WEIGHT_SKILL_OVERLAP: float = 0.40
    WEIGHT_PROXIMITY: float = 0.25
    WEIGHT_LANGUAGE_MATCH: float = 0.15
    WEIGHT_HISTORICAL_SUCCESS: float = 0.20

    # Match score threshold — below this, don't return opportunity
    MATCH_SCORE_THRESHOLD: float = 0.10

    # Maximum distance (km) for proximity scoring
    MAX_PROXIMITY_KM: float = 100.0

    # ── Intelligence Engine ──────────────────────────────────────
    INTELLIGENCE_ROLLING_WEEKS: int = 4

    # ── Retraining Schedule ──────────────────────────────────────
    RETRAIN_CRON_ENABLED: bool = False
    RETRAIN_CRON_EXPRESSION: str = "0 2 1 * *"  # 2 AM on the 1st of each month

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()


def normalize_postgres_url(url: str) -> str:
    """Normalize provider URLs like postgres:// to SQLAlchemy's postgresql://."""
    if url.startswith("postgres://"):
        return "postgresql://" + url.removeprefix("postgres://")
    return url


def async_database_url(url: str | None = None) -> str:
    """Return a PostgreSQL URL suitable for SQLAlchemy's asyncpg engine."""
    normalized = normalize_postgres_url(url or settings.DATABASE_URL)
    if normalized.startswith("postgresql+asyncpg://"):
        return normalized
    if normalized.startswith("postgresql://"):
        return "postgresql+asyncpg://" + normalized.removeprefix("postgresql://")
    return normalized


def sync_database_url(url: str | None = None) -> str:
    """Return a PostgreSQL URL suitable for SQLAlchemy's sync psycopg2 engine."""
    normalized = normalize_postgres_url(url or settings.DATABASE_URL)
    return normalized.replace("postgresql+asyncpg://", "postgresql://", 1)
