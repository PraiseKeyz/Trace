import logging
import math
from typing import List, Optional

from core.config import settings
from core.schemas import (
    IntelligenceRequest, IntelligenceResponse,
    TransactionAggregate,
)

logger = logging.getLogger(__name__)

TREND_RISING_THRESHOLD = 10.0
TREND_FALLING_THRESHOLD = -10.0

MIN_TRANSACTIONS_HIGH_CONFIDENCE = 50
MIN_TRANSACTIONS_MEDIUM_CONFIDENCE = 15


def _calculate_demand_index(
    current: TransactionAggregate,
    historical: List[TransactionAggregate],
) -> int:
    current_count = current.transaction_count

    if not historical:
        if current_count == 0:
            return 0
        return min(100, int((current_count / 100) * 50 + 25))

    historical_counts = [h.transaction_count for h in historical]
    rolling_avg = sum(historical_counts) / len(historical_counts)

    if rolling_avg == 0:
        return min(100, current_count * 5)

    # Normalise: 50 = at average, 100 = 2x average
    raw_index = (current_count / rolling_avg) * 50
    demand_index = int(min(100, max(0, raw_index)))

    return demand_index


def _determine_trend(
    current: TransactionAggregate,
    historical: List[TransactionAggregate],
) -> tuple[str, float]:
    if not historical:
        return "stable", 0.0

    prev = historical[0]

    if prev.transaction_count == 0:
        if current.transaction_count > 0:
            return "rising", 100.0
        return "stable", 0.0

    pct_change = (
        (current.transaction_count - prev.transaction_count) /
        prev.transaction_count * 100
    )

    if pct_change >= TREND_RISING_THRESHOLD:
        direction = "rising"
    elif pct_change <= TREND_FALLING_THRESHOLD:
        direction = "falling"
    else:
        direction = "stable"

    return direction, round(pct_change, 1)


def _assess_confidence(
    current: TransactionAggregate,
    historical: List[TransactionAggregate],
) -> str:
    total_data_points = current.transaction_count + sum(
        h.transaction_count for h in historical
    )

    if total_data_points >= MIN_TRANSACTIONS_HIGH_CONFIDENCE:
        return "high"
    elif total_data_points >= MIN_TRANSACTIONS_MEDIUM_CONFIDENCE:
        return "medium"
    return "low"


def _generate_insights(
    category: str,
    city: str,
    demand_index: int,
    trend_direction: str,
    trend_percentage: float,
    current: TransactionAggregate,
    historical: List[TransactionAggregate],
) -> List[str]:
    insights = []

    # Insight 1: Demand level
    if demand_index >= 75:
        insights.append(
            f"🔥 {category} demand in {city} is very high right now — "
            f"this is a great time to offer your services."
        )
    elif demand_index >= 50:
        insights.append(
            f"📈 {category} demand in {city} is above average. "
            f"There are good opportunities available."
        )
    elif demand_index >= 25:
        insights.append(
            f"📊 {category} demand in {city} is moderate. "
            f"Steady activity, but consider expanding your reach."
        )
    else:
        insights.append(
            f"📉 {category} demand in {city} is currently low. "
            f"Consider diversifying or targeting nearby cities."
        )

    # Insight 2: Trend direction
    if trend_direction == "rising":
        insights.append(
            f"⬆️ {category} activity in {city} is up {abs(trend_percentage):.0f}% "
            f"compared to last week."
        )
    elif trend_direction == "falling":
        insights.append(
            f"⬇️ {category} activity in {city} is down {abs(trend_percentage):.0f}% "
            f"from last week."
        )
    else:
        insights.append(
            f"➡️ {category} activity in {city} has remained stable this week."
        )

    # Insight 3: Transaction value context
    if current.avg_transaction_value > 0:
        avg_val = current.avg_transaction_value

        if historical:
            hist_avg_values = [
                h.avg_transaction_value for h in historical
                if h.avg_transaction_value > 0
            ]
            if hist_avg_values:
                overall_avg = sum(hist_avg_values) / len(hist_avg_values)
                if avg_val > overall_avg * 1.15:
                    insights.append(
                        f"💰 Average transaction values are higher than usual "
                        f"(₦{avg_val:,.0f} vs ₦{overall_avg:,.0f} average). "
                        f"Customers may be willing to pay more."
                    )
                elif avg_val < overall_avg * 0.85:
                    insights.append(
                        f"💵 Average transaction values have dipped "
                        f"(₦{avg_val:,.0f} vs ₦{overall_avg:,.0f} average). "
                        f"Consider competitive pricing."
                    )
                else:
                    insights.append(
                        f"💰 Average transaction value this week: ₦{avg_val:,.0f}. "
                        f"Consistent with recent weeks."
                    )
            else:
                insights.append(
                    f"💰 Average transaction value this week: ₦{avg_val:,.0f}."
                )
        else:
            insights.append(
                f"💰 Average transaction value this week: ₦{avg_val:,.0f}."
            )

    return insights[:3]


def generate_intelligence(request: IntelligenceRequest) -> IntelligenceResponse:
    demand_index = _calculate_demand_index(
        current=request.current_period,
        historical=request.historical_periods,
    )

    trend_direction, trend_percentage = _determine_trend(
        current=request.current_period,
        historical=request.historical_periods,
    )

    confidence = _assess_confidence(
        current=request.current_period,
        historical=request.historical_periods,
    )

    insights = _generate_insights(
        category=request.category,
        city=request.city,
        demand_index=demand_index,
        trend_direction=trend_direction,
        trend_percentage=trend_percentage,
        current=request.current_period,
        historical=request.historical_periods,
    )

    logger.info(
        f"Intelligence generated for {request.category}/{request.city}: "
        f"demand={demand_index}, trend={trend_direction} ({trend_percentage:+.1f}%), "
        f"confidence={confidence}"
    )

    return IntelligenceResponse(
        category=request.category,
        city=request.city,
        demand_index=demand_index,
        trend_direction=trend_direction,
        trend_percentage=trend_percentage,
        avg_transaction_value=request.current_period.avg_transaction_value,
        transaction_count=request.current_period.transaction_count,
        insights=insights,
        confidence=confidence,
    )
