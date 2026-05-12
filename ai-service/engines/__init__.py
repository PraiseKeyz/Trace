import logging
import math
from typing import Optional, Tuple

from core.config import settings
from core.schemas import (
    ScoreRequest, ScoreResponse, ScoreBreakdown,
    TransactionData, ActivityData, VouchData, ProfileData,
)

logger = logging.getLogger(__name__)


RISK_TIERS = [
    (75, "very_low", True, 500_000.0),
    (55, "low",      True, 200_000.0),
    (30, "medium",   True,  50_000.0),
    (0,  "high",     False,     0.0),
]


def _calculate_transaction_score(data: TransactionData) -> float:
    # Volume score: log-scale with cap at ₦5M total
    volume_score = 0.0
    if data.total_volume > 0:
        volume_score = min(100, (math.log10(data.total_volume + 1) / math.log10(5_000_001)) * 100)

    # Frequency score: normalised against 50 transactions as "excellent"
    frequency_score = min(100, (data.total_count / 50) * 100)

    # Consistency score: how regularly do they transact?
    consistency_score = data.consistency_ratio * 100

    # Completion score: do their transactions complete or fail?
    completion_score = data.completed_ratio * 100

    score = (
        volume_score * 0.35 +
        frequency_score * 0.25 +
        consistency_score * 0.25 +
        completion_score * 0.15
    )

    return round(min(100, max(0, score)), 2)


def _calculate_activity_score(data: ActivityData) -> float:
    gig_score = min(100, (data.gigs_completed / 10) * 100)
    active_days_score = min(100, (data.days_active_last_30 / 20) * 100)
    response_score = data.response_rate * 100
    application_score = min(100, (data.gigs_applied / 15) * 100)

    score = (
        gig_score * 0.40 +
        active_days_score * 0.25 +
        response_score * 0.20 +
        application_score * 0.15
    )

    return round(min(100, max(0, score)), 2)


def _calculate_vouch_score(data: VouchData) -> float:
    if data.total_vouches == 0:
        return 0.0

    vouch_count_score = min(100, (data.total_vouches / 10) * 100)

    verification_ratio = (data.verified_vouches / max(1, data.total_vouches))
    verification_score = verification_ratio * 100

    diversity_ratio = data.unique_vouchers / max(1, data.total_vouches)
    diversity_score = diversity_ratio * 100

    voucher_quality_score = data.voucher_avg_score

    score = (
        vouch_count_score * 0.25 +
        verification_score * 0.35 +
        diversity_score * 0.20 +
        voucher_quality_score * 0.20
    )

    return round(min(100, max(0, score)), 2)


def _calculate_profile_score(data: ProfileData) -> float:
    field_weights = {
        "has_full_name": 15,
        "has_phone_verified": 25,
        "has_email": 5,
        "has_location": 15,
        "has_skills": 15,
        "has_trade_category": 10,
        "has_languages": 5,
        "has_profile_photo": 10,
    }

    score = sum(
        weight for field, weight in field_weights.items()
        if getattr(data, field, False)
    )

    return round(min(100, max(0, float(score))), 2)


def _assign_risk_tier(score: int) -> Tuple[str, bool, float]:
    for threshold, tier, eligible, max_loan in RISK_TIERS:
        if score >= threshold:
            return tier, eligible, max_loan
    return "high", False, 0.0


def _detect_threshold_crossing(old_score: Optional[int], new_score: int) -> Optional[str]:
    if old_score is None:
        return None

    thresholds = [
        (75, "Very Low risk — eligible for up to ₦500,000"),
        (55, "Low risk — eligible for up to ₦200,000"),
        (30, "Medium risk — eligible for up to ₦50,000"),
    ]

    for threshold, message in thresholds:
        if old_score < threshold <= new_score:
            return message

    return None


def calculate_identity_score(request: ScoreRequest) -> ScoreResponse:
    transaction_score = _calculate_transaction_score(request.transaction_data)
    activity_score = _calculate_activity_score(request.activity_data)
    vouch_score = _calculate_vouch_score(request.vouch_data)
    profile_score = _calculate_profile_score(request.profile_data)

    # Weighted combination
    identity_score = int(round(
        transaction_score * settings.WEIGHT_TRANSACTION_HISTORY +
        activity_score * settings.WEIGHT_PLATFORM_ACTIVITY +
        vouch_score * settings.WEIGHT_COMMUNITY_VOUCHING +
        profile_score * settings.WEIGHT_PROFILE_COMPLETENESS
    ))

    identity_score = max(0, min(100, identity_score))

    risk_tier, is_finance_eligible, max_loan_amount = _assign_risk_tier(identity_score)

    breakdown = ScoreBreakdown(
        transaction_score=transaction_score,
        activity_score=activity_score,
        vouch_score=vouch_score,
        profile_score=profile_score,
    )

    logger.info(
        f"Score calculated for user {request.user_id}: "
        f"{identity_score} ({risk_tier}) — "
        f"T:{transaction_score} A:{activity_score} "
        f"V:{vouch_score} P:{profile_score}"
    )

    return ScoreResponse(
        user_id=request.user_id,
        identity_score=identity_score,
        breakdown=breakdown,
        risk_tier=risk_tier,
        is_finance_eligible=is_finance_eligible,
        max_loan_amount=max_loan_amount,
    )
