from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ═══════════════════════════════════════════════════════════════════
# Identity Engine (Score Calculation) Schemas
# ═══════════════════════════════════════════════════════════════════

class TransactionData(BaseModel):
    total_volume: float = Field(0.0, description="Total transaction volume in NGN")
    total_count: int = Field(0, description="Total number of transactions")
    avg_monthly_volume: float = Field(0.0, description="Average monthly transaction volume")
    months_active: int = Field(0, description="Number of months with at least one transaction")
    consistency_ratio: float = Field(0.0, description="Ratio of active months to total months since signup")
    completed_ratio: float = Field(1.0, description="Ratio of completed to total transactions")


class ActivityData(BaseModel):
    gigs_completed: int = Field(0, description="Number of gigs completed")
    gigs_applied: int = Field(0, description="Number of gigs applied to")
    days_active_last_30: int = Field(0, description="Number of days active in last 30 days")
    profile_views: int = Field(0, description="Number of profile views received")
    response_rate: float = Field(0.0, description="Rate of responding to opportunities (0-1)")


class VouchData(BaseModel):
    total_vouches: int = Field(0, description="Total vouches received")
    verified_vouches: int = Field(0, description="Vouches verified via Squad transactions")
    unique_vouchers: int = Field(0, description="Number of unique people who vouched")
    voucher_avg_score: float = Field(0.0, description="Average identity score of vouchers")


class ProfileData(BaseModel):
    has_full_name: bool = False
    has_phone_verified: bool = False
    has_email: bool = False
    has_location: bool = False
    has_skills: bool = False
    has_trade_category: bool = False
    has_languages: bool = False
    has_profile_photo: bool = False


class ScoreRequest(BaseModel):
    user_id: str
    transaction_data: TransactionData = Field(default_factory=TransactionData)
    activity_data: ActivityData = Field(default_factory=ActivityData)
    vouch_data: VouchData = Field(default_factory=VouchData)
    profile_data: ProfileData = Field(default_factory=ProfileData)


class ScoreBreakdown(BaseModel):
    transaction_score: float = Field(description="Transaction history sub-score (0-100)")
    activity_score: float = Field(description="Platform activity sub-score (0-100)")
    vouch_score: float = Field(description="Community vouching sub-score (0-100)")
    profile_score: float = Field(description="Profile completeness sub-score (0-100)")


class ScoreResponse(BaseModel):
    user_id: str
    identity_score: int = Field(description="Master identity score (0-100)")
    breakdown: ScoreBreakdown
    risk_tier: str = Field(description="'high', 'medium', 'low', or 'very_low'")
    is_finance_eligible: bool
    max_loan_amount: float
    score_change: Optional[int] = Field(None, description="Change from previous score")
    crossed_threshold: Optional[str] = Field(None, description="New threshold crossed, if any")


# ═══════════════════════════════════════════════════════════════════
# Matching Engine Schemas
# ═══════════════════════════════════════════════════════════════════

class UserLocation(BaseModel):
    latitude: float = 0.0
    longitude: float = 0.0


class UserHistoryData(BaseModel):
    total_gigs_completed: int = 0
    gigs_by_type: Dict[str, int] = Field(default_factory=dict)
    success_rate: float = 0.0
    avg_employer_rating: float = 0.0


class MatchRequest(BaseModel):
    user_id: str
    skills: List[str] = Field(default_factory=list, description="User's skills (any language)")
    skill_descriptions: List[str] = Field(
        default_factory=list,
        description="Natural language skill descriptions (any African language or English)"
    )
    location: UserLocation = Field(default_factory=UserLocation)
    languages: List[str] = Field(default_factory=list)
    history: UserHistoryData = Field(default_factory=UserHistoryData)
    max_results: int = Field(20, description="Maximum opportunities to return")
    include_remote: bool = Field(True, description="Include remote opportunities")


class OpportunityData(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    type: str = "gig"
    skills_required: List[str] = Field(default_factory=list)
    languages_required: List[str] = Field(default_factory=list)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_remote: bool = False
    pay_min: Optional[float] = None
    pay_max: Optional[float] = None
    city: Optional[str] = None
    state: Optional[str] = None


class MatchedOpportunity(BaseModel):
    opportunity_id: str
    title: str
    match_score: float = Field(description="Overall match percentage (0-100)")
    skill_score: float = Field(description="Skill overlap score (0-100)")
    proximity_score: float = Field(description="Proximity score (0-100)")
    language_score: float = Field(description="Language match score (0-100)")
    history_score: float = Field(description="Historical success score (0-100)")
    pay_range: Optional[str] = None
    distance_km: Optional[float] = None
    is_remote: bool = False
    matched_skills: List[str] = Field(default_factory=list, description="Skills that matched")


class MatchResponse(BaseModel):
    user_id: str
    total_opportunities_evaluated: int
    matched_opportunities: List[MatchedOpportunity]
    model_type: str = Field(description="'afro_xlmr' or 'fallback_tfidf'")


class MatchWithOpportunitiesRequest(BaseModel):
    user: MatchRequest
    opportunities: List[OpportunityData]


# ═══════════════════════════════════════════════════════════════════
# Intelligence Engine Schemas
# ═══════════════════════════════════════════════════════════════════

class TransactionAggregate(BaseModel):
    category: str
    city: str
    total_volume: float = 0.0
    transaction_count: int = 0
    avg_transaction_value: float = 0.0
    unique_users: int = 0
    period_start: Optional[str] = None
    period_end: Optional[str] = None


class IntelligenceRequest(BaseModel):
    category: str
    city: str
    timeframe: str = "past_week"
    current_period: TransactionAggregate = Field(default_factory=lambda: TransactionAggregate(category="", city=""))
    historical_periods: List[TransactionAggregate] = Field(
        default_factory=list,
        description="Rolling historical data (up to 4 weeks)"
    )


class IntelligenceResponse(BaseModel):
    category: str
    city: str
    demand_index: int = Field(description="Demand index 0-100, normalised against rolling average")
    trend_direction: str = Field(description="'rising', 'falling', or 'stable'")
    trend_percentage: float = Field(description="Percentage change from previous period")
    avg_transaction_value: float
    transaction_count: int
    insights: List[str] = Field(description="2-3 plain-English insight strings for the trader's feed")
    confidence: str = Field(description="'high', 'medium', or 'low' based on data volume")


# ═══════════════════════════════════════════════════════════════════
# Retraining Schemas
# ═══════════════════════════════════════════════════════════════════

class GigOutcomeData(BaseModel):
    opportunity_id: str
    user_id: str
    was_accepted: bool = False
    was_completed: bool = False
    was_rehired: bool = False
    was_vouched: bool = False
    employer_rating: Optional[float] = None
    match_score_at_time: Optional[float] = None
    skills_matched: List[str] = Field(default_factory=list)
    opportunity_type: str = "gig"


class RetrainRequest(BaseModel):
    outcomes: List[GigOutcomeData]
    current_weights: Dict[str, float] = Field(default_factory=dict)


class RetrainResponse(BaseModel):
    updated_weights: Dict[str, float]
    training_samples: int
    accuracy_before: Optional[float] = None
    accuracy_after: Optional[float] = None
    message: str


# ═══════════════════════════════════════════════════════════════════
# Health Check
# ═══════════════════════════════════════════════════════════════════

class HealthResponse(BaseModel):
    status: str
    version: str
    model_loaded: bool
    model_name: str
    multilingual: bool
    database_connected: bool
    redis_connected: bool
