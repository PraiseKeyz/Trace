import logging
import os
import sys
from concurrent import futures
from typing import List

import grpc
from sqlalchemy import create_engine, text

from core.config import settings
from core.schemas import MatchRequest, UserLocation, OpportunityData
from engines import calculate_identity_score_from_subscores
from engines.matching_engine import match_opportunities

# Generated grpcio stubs expect trace_pb2 as a top-level module.
sys.path.append(os.path.join(os.path.dirname(__file__), "api"))
import trace_pb2       # noqa: E402
import trace_pb2_grpc  # noqa: E402

logger = logging.getLogger(__name__)

# ── Sync DB engine ────────────────────────────────────────────────────────────
# gRPC handlers run in a ThreadPoolExecutor — asyncpg (async-only) cannot be
# used there. We create a separate synchronous engine using psycopg2 which
# IS installed (psycopg2-binary in requirements.txt).
_SYNC_DB_URL = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
_sync_engine = create_engine(
    _SYNC_DB_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
)


def _fetch_open_opportunities() -> List[OpportunityData]:
    """Return all open opportunities from the shared Postgres database."""
    with _sync_engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT id::text,
                   title,
                   description,
                   type,
                   skills_required,
                   languages_required,
                   latitude,
                   longitude,
                   is_remote,
                   pay_min,
                   pay_max,
                   city,
                   state
            FROM   opportunities
            WHERE  status = 'open'
            LIMIT  500
        """)).mappings().fetchall()

    opps: List[OpportunityData] = []
    for row in rows:
        opps.append(OpportunityData(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            type=row["type"] or "gig",
            skills_required=list(row["skills_required"] or []),
            languages_required=list(row["languages_required"] or []),
            latitude=float(row["latitude"]) if row["latitude"] is not None else None,
            longitude=float(row["longitude"]) if row["longitude"] is not None else None,
            is_remote=bool(row["is_remote"]),
            pay_min=float(row["pay_min"]) if row["pay_min"] is not None else None,
            pay_max=float(row["pay_max"]) if row["pay_max"] is not None else None,
            city=row["city"],
            state=row["state"],
        ))

    logger.debug("Fetched %d open opportunities from DB for matching", len(opps))
    return opps


# ── gRPC risk tier mapping ────────────────────────────────────────────────────

def _grpc_risk_tier(risk_tier: str) -> str:
    return {
        "very_low": "Very Low",
        "low": "Low",
        "medium": "Medium",
        "high": "High",
    }.get(risk_tier, risk_tier)


# ── Servicers ─────────────────────────────────────────────────────────────────

class ScoringServiceServicer(trace_pb2_grpc.ScoringServiceServicer):
    def ScoreUser(self, request, context):
        try:
            result = calculate_identity_score_from_subscores(
                user_id=request.user_id,
                transaction_score=request.transaction_history_score,
                activity_score=request.platform_activity_score,
                vouch_score=request.community_vouching_score,
                profile_score=request.profile_completeness_score,
            )
            return trace_pb2.ScoreResponse(
                user_id=result.user_id,
                identity_score=float(result.identity_score),
                risk_tier=_grpc_risk_tier(result.risk_tier),
            )
        except Exception as exc:
            logger.exception("gRPC ScoreUser failed for user %s", request.user_id)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(exc))
            return trace_pb2.ScoreResponse()


class MatchingServiceServicer(trace_pb2_grpc.MatchingServiceServicer):
    def MatchOpportunities(self, request, context):
        try:
            user = MatchRequest(
                user_id=request.user_id,
                skills=list(request.skills),
                skill_descriptions=list(request.skills),
                location=UserLocation(
                    latitude=float(request.latitude),
                    longitude=float(request.longitude),
                ),
                languages=list(request.languages),
            )

            # Fetch candidate opportunities from the shared database.
            try:
                candidates = _fetch_open_opportunities()
            except Exception as db_exc:
                logger.warning(
                    "DB fetch failed for MatchOpportunities — returning empty: %s", db_exc
                )
                candidates = []

            result = match_opportunities(user=user, opportunities=candidates)

            # Matching engine scores are 0–100; proto field is float.
            # Frontend MatchBadge does `Math.round(score * 100)` so we normalise to 0–1.
            grpc_opps = [
                trace_pb2.MatchedOpportunity(
                    opportunity_id=opp.opportunity_id,
                    match_score=round(opp.match_score / 100.0, 4),
                    title=opp.title,
                )
                for opp in result.matched_opportunities
            ]

            return trace_pb2.MatchResponse(
                user_id=result.user_id,
                opportunities=grpc_opps,
            )

        except Exception as exc:
            logger.exception("gRPC MatchOpportunities failed for user %s", request.user_id)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(exc))
            return trace_pb2.MatchResponse()


# ── Server lifecycle ──────────────────────────────────────────────────────────

def create_server() -> grpc.Server:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    trace_pb2_grpc.add_ScoringServiceServicer_to_server(ScoringServiceServicer(), server)
    trace_pb2_grpc.add_MatchingServiceServicer_to_server(MatchingServiceServicer(), server)
    return server


def serve() -> None:
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    )

    # Verify the sync DB engine can connect before accepting requests.
    try:
        with _sync_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Sync DB engine connected (psycopg2)")
    except Exception as exc:
        logger.error("❌ Sync DB engine failed to connect: %s", exc)

    server = create_server()
    bind_address = f"{settings.GRPC_SERVICE_HOST}:{settings.GRPC_SERVICE_PORT}"
    server.add_insecure_port(bind_address)
    logger.info("gRPC server listening on %s", bind_address)
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
