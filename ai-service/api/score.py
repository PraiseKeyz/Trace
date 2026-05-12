import logging

from fastapi import APIRouter, HTTPException

from core.schemas import ScoreRequest, ScoreResponse
from core.cache import cache_get, cache_set, cache_delete
from engines import calculate_identity_score

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/calculate", response_model=ScoreResponse)
async def calculate_score(request: ScoreRequest):
    try:
        cache_key = f"score:{request.user_id}"
        previous = await cache_get(cache_key)
        old_score = previous.get("identity_score") if previous else None

        result = calculate_identity_score(request)

        if old_score is not None:
            from engines import _detect_threshold_crossing
            crossed = _detect_threshold_crossing(old_score, result.identity_score)
            if crossed:
                result.crossed_threshold = crossed
                result.score_change = result.identity_score - old_score
                logger.info(
                    f"User {request.user_id} crossed threshold: {crossed} "
                    f"(score: {old_score} → {result.identity_score})"
                )

        await cache_set(cache_key, result.model_dump())

        return result

    except Exception as e:
        logger.error(f"Score calculation failed for user {request.user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Score calculation error: {str(e)}")


@router.get("/cached/{user_id}")
async def get_cached_score(user_id: str):
    cache_key = f"score:{user_id}"
    cached = await cache_get(cache_key)

    if cached:
        return cached

    return {"user_id": user_id, "cached": False, "message": "No cached score. Trigger recalculation."}


@router.delete("/cache/{user_id}")
async def invalidate_score_cache(user_id: str):
    cache_key = f"score:{user_id}"
    await cache_delete(cache_key)
    return {"user_id": user_id, "cache_invalidated": True}
