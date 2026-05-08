from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ScoreRequest(BaseModel):
    user_id: str
    transaction_history_score: float = 0.0
    platform_activity_score: float = 0.0
    community_vouching_score: float = 0.0
    profile_completeness_score: float = 0.0

@router.post("/calculate")
def calculate_score(request: ScoreRequest):
    """
    Calculate the Identity Score.
    40% Transaction history
    20% Platform activity
    25% Community vouching
    15% Profile completeness
    """
    # Placeholder for logic
    identity_score = (
        request.transaction_history_score * 0.40 +
        request.platform_activity_score * 0.20 +
        request.community_vouching_score * 0.25 +
        request.profile_completeness_score * 0.15
    )
    
    risk_tier = "High"
    if identity_score >= 75:
        risk_tier = "Very Low"
    elif identity_score >= 55:
        risk_tier = "Low"
    elif identity_score >= 30:
        risk_tier = "Medium"

    return {
        "user_id": request.user_id,
        "identity_score": identity_score,
        "risk_tier": risk_tier
    }
