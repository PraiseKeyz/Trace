import logging
import math
from typing import List, Tuple

from core.config import settings
from core.embeddings import get_embedding_engine
from core.schemas import (
    MatchRequest, MatchResponse, MatchedOpportunity,
    OpportunityData, MatchWithOpportunitiesRequest,
)

logger = logging.getLogger(__name__)

EARTH_RADIUS_KM = 6371.0


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    lat1_r, lon1_r = math.radians(lat1), math.radians(lon1)
    lat2_r, lon2_r = math.radians(lat2), math.radians(lon2)

    dlat = lat2_r - lat1_r
    dlon = lon2_r - lon1_r

    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.asin(math.sqrt(a))

    return EARTH_RADIUS_KM * c


def _calculate_skill_score(
    user_skills: List[str],
    user_skill_descriptions: List[str],
    required_skills: List[str],
    opp_description: str,
) -> Tuple[float, List[str]]:
    engine = get_embedding_engine()

    if not required_skills and not opp_description:
        return 50.0, []

    all_user_skills = list(set(user_skills + user_skill_descriptions))

    if not all_user_skills:
        return 0.0, []

    all_required = list(required_skills)
    if opp_description:
        all_required.append(opp_description)

    skill_score = engine.skill_match_score(all_user_skills, all_required)

    matched_skills = []
    if required_skills and all_user_skills:
        req_vecs = engine.encode_batch(required_skills)
        user_vecs = engine.encode_batch(all_user_skills)

        for i, req_skill in enumerate(required_skills):
            for j, user_skill in enumerate(all_user_skills):
                sim = engine.similarity(req_vecs[i], user_vecs[j])
                if sim > 0.5:
                    matched_skills.append(f"{user_skill} → {req_skill}")

    score = skill_score * 100
    return round(min(100, max(0, score)), 2), matched_skills


def _calculate_proximity_score(
    user_lat: float, user_lon: float,
    opp_lat: float, opp_lon: float,
    is_remote: bool,
) -> Tuple[float, float]:
    if is_remote:
        return 100.0, 0.0

    if (user_lat == 0 and user_lon == 0) or (opp_lat is None or opp_lon is None):
        return 50.0, -1.0

    if opp_lat == 0 and opp_lon == 0:
        return 50.0, -1.0

    distance = _haversine_distance(user_lat, user_lon, opp_lat, opp_lon)
    score = max(0, 100 * (1 - distance / settings.MAX_PROXIMITY_KM))

    return round(score, 2), round(distance, 2)


def _calculate_language_score(
    user_languages: List[str],
    required_languages: List[str],
) -> float:
    if not required_languages:
        return 100.0

    if not user_languages:
        return 0.0

    user_langs = {lang.lower().strip() for lang in user_languages}
    required_langs = {lang.lower().strip() for lang in required_languages}

    matches = user_langs & required_langs
    score = (len(matches) / len(required_langs)) * 100

    return round(min(100, max(0, score)), 2)


def _calculate_history_score(
    history_success_rate: float,
    history_gigs_by_type: dict,
    opportunity_type: str,
) -> float:
    if history_success_rate == 0:
        return 25.0

    success_score = history_success_rate * 100
    type_count = history_gigs_by_type.get(opportunity_type, 0)
    type_bonus = min(20, type_count * 4)

    score = success_score * 0.7 + type_bonus + 25 * 0.3

    return round(min(100, max(0, score)), 2)


def match_opportunities(
    user: MatchRequest,
    opportunities: List[OpportunityData],
) -> MatchResponse:
    engine = get_embedding_engine()
    matched = []

    for opp in opportunities:
        # 1. Skill overlap (40%) — AfroXLM-R powered
        skill_score, matched_skills = _calculate_skill_score(
            user_skills=user.skills,
            user_skill_descriptions=user.skill_descriptions,
            required_skills=opp.skills_required,
            opp_description=opp.description or opp.title,
        )

        # 2. Proximity (25%) — Haversine distance
        proximity_score, distance_km = _calculate_proximity_score(
            user_lat=user.location.latitude,
            user_lon=user.location.longitude,
            opp_lat=opp.latitude,
            opp_lon=opp.longitude,
            is_remote=opp.is_remote,
        )

        if not user.include_remote and opp.is_remote:
            continue

        # 3. Language match (15%)
        language_score = _calculate_language_score(
            user_languages=user.languages,
            required_languages=opp.languages_required,
        )

        # 4. Historical success (20%)
        history_score = _calculate_history_score(
            history_success_rate=user.history.success_rate,
            history_gigs_by_type=user.history.gigs_by_type,
            opportunity_type=opp.type,
        )

        # Weighted combination
        total_score = (
            skill_score * settings.WEIGHT_SKILL_OVERLAP +
            proximity_score * settings.WEIGHT_PROXIMITY +
            language_score * settings.WEIGHT_LANGUAGE_MATCH +
            history_score * settings.WEIGHT_HISTORICAL_SUCCESS
        )
        total_score = round(total_score, 2)

        if total_score < settings.MATCH_SCORE_THRESHOLD * 100:
            continue

        pay_range = None
        if opp.pay_min and opp.pay_max:
            pay_range = f"₦{opp.pay_min:,.0f} – ₦{opp.pay_max:,.0f}"
        elif opp.pay_min:
            pay_range = f"From ₦{opp.pay_min:,.0f}"
        elif opp.pay_max:
            pay_range = f"Up to ₦{opp.pay_max:,.0f}"

        matched.append(MatchedOpportunity(
            opportunity_id=opp.id,
            title=opp.title,
            match_score=total_score,
            skill_score=skill_score,
            proximity_score=proximity_score,
            language_score=language_score,
            history_score=history_score,
            pay_range=pay_range,
            distance_km=distance_km if distance_km >= 0 else None,
            is_remote=opp.is_remote,
            matched_skills=matched_skills,
        ))

    matched.sort(key=lambda m: m.match_score, reverse=True)
    matched = matched[:user.max_results]

    model_type = "sentence_transformer" if engine.is_multilingual else "fallback_tfidf"

    logger.info(
        f"Matching for user {user.user_id}: "
        f"{len(matched)}/{len(opportunities)} opportunities matched "
        f"(model: {model_type})"
    )

    return MatchResponse(
        user_id=user.user_id,
        total_opportunities_evaluated=len(opportunities),
        matched_opportunities=matched,
        model_type=model_type,
    )
