from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class MatchRequest(BaseModel):
    user_id: str
    skills: List[str] = []
    location: dict = {"latitude": 0.0, "longitude": 0.0}
    languages: List[str] = []
    history: dict = {}

@router.post("/opportunities")
def match_opportunities(request: MatchRequest):
    """
    Returns ranked opportunities for a given user.
    Match score logic:
    40% Skill overlap
    25% Proximity
    15% Language match
    20% Historical success
    """
    # Placeholder response
    return {
        "user_id": request.user_id,
        "matched_opportunities": []
    }
