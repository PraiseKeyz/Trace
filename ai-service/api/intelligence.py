from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class IntelligenceRequest(BaseModel):
    category: str
    city: str
    timeframe: str = "past_week"

@router.post("/generate")
def generate_intelligence(request: IntelligenceRequest):
    """
    Called by the weekly cron job. Aggregates Squad transaction data per category and city.
    Generates:
    - Demand index (0-100)
    - Trend direction
    - Plain-English insight strings
    """
    # Placeholder response
    return {
        "category": request.category,
        "city": request.city,
        "demand_index": 50,
        "trend_direction": "stable",
        "insights": [
            "Demand in this category is stable.",
            "Average transaction values have remained consistent."
        ]
    }
