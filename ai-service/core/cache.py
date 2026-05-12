import json
import logging
from typing import Optional, Any

import redis.asyncio as aioredis

from core.config import settings

logger = logging.getLogger(__name__)

_redis: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis
    if _redis is None:
        _redis = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
    return _redis


async def close_redis():
    global _redis
    if _redis:
        await _redis.close()
        _redis = None


async def cache_get(key: str) -> Optional[Any]:
    try:
        r = await get_redis()
        raw = await r.get(key)
        if raw:
            return json.loads(raw)
    except Exception as e:
        logger.warning(f"Cache GET failed for key={key}: {e}")
    return None


async def cache_set(key: str, value: Any, ttl: int = None):
    try:
        r = await get_redis()
        ttl = ttl or settings.CACHE_TTL_SECONDS
        await r.set(key, json.dumps(value), ex=ttl)
    except Exception as e:
        logger.warning(f"Cache SET failed for key={key}: {e}")


async def cache_delete(key: str):
    try:
        r = await get_redis()
        await r.delete(key)
    except Exception as e:
        logger.warning(f"Cache DELETE failed for key={key}: {e}")


async def cache_delete_pattern(pattern: str):
    try:
        r = await get_redis()
        keys = []
        async for key in r.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            await r.delete(*keys)
    except Exception as e:
        logger.warning(f"Cache DELETE pattern failed for pattern={pattern}: {e}")
