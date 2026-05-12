import logging
from typing import Dict, List, Optional

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler

from core.schemas import RetrainRequest, RetrainResponse, GigOutcomeData
from core.config import settings

logger = logging.getLogger(__name__)

MIN_RETRAINING_SAMPLES = 20

DEFAULT_WEIGHTS = {
    "skill_overlap": settings.WEIGHT_SKILL_OVERLAP,
    "proximity": settings.WEIGHT_PROXIMITY,
    "language_match": settings.WEIGHT_LANGUAGE_MATCH,
    "historical_success": settings.WEIGHT_HISTORICAL_SUCCESS,
}


def _outcomes_to_features(outcomes: List[GigOutcomeData]) -> tuple:
    X = []
    y = []

    for outcome in outcomes:
        features = [
            outcome.match_score_at_time or 0.0,
            float(outcome.was_accepted),
            float(outcome.was_completed),
            float(outcome.was_rehired),
            outcome.employer_rating or 0.0,
            len(outcome.skills_matched),
        ]
        X.append(features)

        # Success label: completed AND (rehired OR vouched OR rating >= 4)
        is_success = (
            outcome.was_completed and (
                outcome.was_rehired or
                outcome.was_vouched or
                (outcome.employer_rating is not None and outcome.employer_rating >= 4.0)
            )
        )
        y.append(float(is_success))

    return np.array(X), np.array(y)


def _adjust_weights(
    outcomes: List[GigOutcomeData],
    current_weights: Dict[str, float],
) -> Dict[str, float]:
    X, y = _outcomes_to_features(outcomes)

    if len(X) < MIN_RETRAINING_SAMPLES:
        logger.warning(
            f"Only {len(X)} samples — need at least {MIN_RETRAINING_SAMPLES} "
            f"for retraining. Keeping current weights."
        )
        return current_weights

    if len(np.unique(y)) < 2:
        logger.warning("Only one class in outcomes — cannot retrain. Keeping current weights.")
        return current_weights

    try:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = LogisticRegression(max_iter=1000, random_state=42)
        model.fit(X_scaled, y)

        coefficients = np.abs(model.coef_[0])

        coeff_sum = coefficients.sum()
        if coeff_sum > 0:
            importance = coefficients / coeff_sum
        else:
            return current_weights

        skill_importance = (importance[1] + importance[5]) / 2
        proximity_importance = importance[2]
        language_importance = importance[0] * 0.3
        history_importance = (importance[3] + importance[4]) / 2

        total = skill_importance + proximity_importance + language_importance + history_importance
        if total > 0:
            new_weights = {
                "skill_overlap": skill_importance / total,
                "proximity": proximity_importance / total,
                "language_match": language_importance / total,
                "historical_success": history_importance / total,
            }
        else:
            return current_weights

        # Bound changes: max ±5% per cycle to prevent wild swings
        MAX_CHANGE = 0.05
        adjusted = {}
        for key in current_weights:
            old = current_weights[key]
            proposed = new_weights.get(key, old)
            change = max(-MAX_CHANGE, min(MAX_CHANGE, proposed - old))
            adjusted[key] = round(old + change, 4)

        # Renormalise to sum to 1.0
        total = sum(adjusted.values())
        adjusted = {k: round(v / total, 4) for k, v in adjusted.items()}

        logger.info(f"Weights adjusted: {current_weights} → {adjusted}")
        return adjusted

    except Exception as e:
        logger.error(f"Retraining failed: {e}")
        return current_weights


def retrain_matching_model(request: RetrainRequest) -> RetrainResponse:
    current_weights = request.current_weights or DEFAULT_WEIGHTS.copy()
    outcomes = request.outcomes

    if len(outcomes) < MIN_RETRAINING_SAMPLES:
        return RetrainResponse(
            updated_weights=current_weights,
            training_samples=len(outcomes),
            message=(
                f"Insufficient data for retraining ({len(outcomes)} samples, "
                f"need {MIN_RETRAINING_SAMPLES}). Weights unchanged."
            ),
        )

    X, y = _outcomes_to_features(outcomes)
    accuracy_before = None

    try:
        if len(np.unique(y)) >= 2:
            model_before = LogisticRegression(max_iter=1000, random_state=42)
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            scores = cross_val_score(model_before, X_scaled, y, cv=min(5, len(y)), scoring="accuracy")
            accuracy_before = round(float(scores.mean()), 4)
    except Exception:
        pass

    updated_weights = _adjust_weights(outcomes, current_weights)

    accuracy_after = accuracy_before

    changes = []
    for key in updated_weights:
        old = current_weights.get(key, 0)
        new = updated_weights[key]
        if old != new:
            changes.append(f"{key}: {old:.2%} → {new:.2%}")

    if changes:
        message = f"Weights updated based on {len(outcomes)} outcomes. Changes: {', '.join(changes)}"
    else:
        message = f"Weights unchanged after analysing {len(outcomes)} outcomes."

    logger.info(message)

    return RetrainResponse(
        updated_weights=updated_weights,
        training_samples=len(outcomes),
        accuracy_before=accuracy_before,
        accuracy_after=accuracy_after,
        message=message,
    )
