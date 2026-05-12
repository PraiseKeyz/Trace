import logging

from fastapi import APIRouter, HTTPException

from core.schemas import (
    MatchRequest, MatchResponse, MatchWithOpportunitiesRequest,
    OpportunityData, RetrainRequest, RetrainResponse,
)
from core.embeddings import get_embedding_engine
from engines.matching_engine import match_opportunities
from engines.retraining_engine import retrain_matching_model

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/opportunities", response_model=MatchResponse)
async def match_user_opportunities(request: MatchWithOpportunitiesRequest):
    try:
        result = match_opportunities(
            user=request.user,
            opportunities=request.opportunities,
        )
        return result

    except Exception as e:
        logger.error(f"Matching failed for user {request.user.user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Matching error: {str(e)}")


@router.post("/embed")
async def embed_text(texts: list[str]):
    try:
        engine = get_embedding_engine()

        if len(texts) == 0:
            raise HTTPException(status_code=400, detail="No texts provided")

        embeddings = engine.encode_batch(texts)

        result = {
            "texts": texts,
            "model": "afro_xlmr" if engine.is_multilingual else "fallback_tfidf",
            "embedding_dimension": embeddings.shape[1] if len(embeddings.shape) > 1 else 0,
            "count": len(texts),
        }

        # If exactly 2 texts, also compute similarity
        if len(texts) == 2:
            similarity = engine.similarity(embeddings[0], embeddings[1])
            result["similarity"] = round(similarity, 4)
            result["similarity_percent"] = round(similarity * 100, 1)

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Embedding failed: {e}")
        raise HTTPException(status_code=500, detail=f"Embedding error: {str(e)}")


@router.post("/skill-similarity")
async def skill_similarity(
    user_skills: list[str],
    required_skills: list[str],
):
    try:
        engine = get_embedding_engine()
        overall_score = engine.skill_match_score(user_skills, required_skills)

        user_vecs = engine.encode_batch(user_skills)
        req_vecs = engine.encode_batch(required_skills)

        comparisons = []
        for i, user_skill in enumerate(user_skills):
            for j, req_skill in enumerate(required_skills):
                sim = engine.similarity(user_vecs[i], req_vecs[j])
                comparisons.append({
                    "user_skill": user_skill,
                    "required_skill": req_skill,
                    "similarity": round(sim, 4),
                    "similarity_percent": round(sim * 100, 1),
                })

        return {
            "overall_score": round(overall_score, 4),
            "overall_percent": round(overall_score * 100, 1),
            "model": "afro_xlmr" if engine.is_multilingual else "fallback_tfidf",
            "comparisons": comparisons,
        }

    except Exception as e:
        logger.error(f"Skill similarity failed: {e}")
        raise HTTPException(status_code=500, detail=f"Similarity error: {str(e)}")


@router.post("/retrain", response_model=RetrainResponse)
async def retrain_model(request: RetrainRequest):
    try:
        result = retrain_matching_model(request)
        return result

    except Exception as e:
        logger.error(f"Retraining failed: {e}")
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")
