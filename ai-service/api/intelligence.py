import logging

from fastapi import APIRouter, HTTPException

from core.schemas import IntelligenceRequest, IntelligenceResponse
from core.cache import cache_get, cache_set, cache_delete_pattern
from engines.intelligence_engine import generate_intelligence

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate", response_model=IntelligenceResponse)
async def generate_market_intelligence(request: IntelligenceRequest):
    try:
        cache_key = f"intelligence:{request.category}:{request.city}:{request.timeframe}"
        cached = await cache_get(cache_key)
        if cached:
            logger.info(f"Returning cached intelligence for {request.category}/{request.city}")
            return IntelligenceResponse(**cached)

        result = generate_intelligence(request)

        # Cache the result (longer TTL — valid for a day)
        await cache_set(cache_key, result.model_dump(), ttl=86400)

        return result

    except Exception as e:
        logger.error(
            f"Intelligence generation failed for "
            f"{request.category}/{request.city}: {e}"
        )
        raise HTTPException(
            status_code=500,
            detail=f"Intelligence generation error: {str(e)}"
        )


@router.get("/feed/{category}/{city}")
async def get_intelligence_feed(category: str, city: str):
    cache_key = f"intelligence:{category}:{city}:past_week"
    cached = await cache_get(cache_key)

    if cached:
        return cached

    return {
        "category": category,
        "city": city,
        "cached": False,
        "message": "No cached intelligence. Trigger generation via cron job.",
    }


@router.delete("/cache")
async def invalidate_intelligence_cache():
    await cache_delete_pattern("intelligence:*")
    return {"cache_cleared": True, "pattern": "intelligence:*"}


@router.post("/batch-generate")
async def batch_generate_intelligence(requests: list[IntelligenceRequest]):
    results = []

    for req in requests:
        try:
            result = generate_intelligence(req)

            cache_key = f"intelligence:{req.category}:{req.city}:{req.timeframe}"
            await cache_set(cache_key, result.model_dump(), ttl=86400)

            results.append(result.model_dump())

        except Exception as e:
            logger.error(
                f"Batch intelligence failed for {req.category}/{req.city}: {e}"
            )
            results.append({
                "category": req.category,
                "city": req.city,
                "error": str(e),
            })

    return {
        "total_processed": len(results),
        "results": results,
    }
