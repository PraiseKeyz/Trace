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
    # AfroXLM-R model for multilingual African language embeddings
    EMBEDDING_MODEL_NAME: str = "Davlan/afro-xlmr-large"
    EMBEDDING_DIMENSION: int = 1024  # afro-xlmr-large output dim
    EMBEDDING_CACHE_SIZE: int = 10_000  # LRU cache entries for embeddings
    MODEL_DEVICE: str = "cpu"  # "cpu" or "cuda"

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


settings = Settings()
