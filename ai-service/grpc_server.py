import logging
import os
import sys
from concurrent import futures

import grpc

from core.config import settings
from core.schemas import MatchRequest, UserLocation
from engines import calculate_identity_score_from_subscores
from engines.matching_engine import match_opportunities

# Generated grpcio files import trace_pb2 as a top-level module.
sys.path.append(os.path.join(os.path.dirname(__file__), "api"))
import trace_pb2  # noqa: E402
import trace_pb2_grpc  # noqa: E402

logger = logging.getLogger(__name__)


def _grpc_risk_tier(risk_tier: str) -> str:
    return {
        "very_low": "Very Low",
        "low": "Low",
        "medium": "Medium",
        "high": "High",
    }.get(risk_tier, risk_tier)


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
                    latitude=request.latitude,
                    longitude=request.longitude,
                ),
                languages=list(request.languages),
            )

            # The current gRPC protocol sends only the user profile. It does not
            # send candidate opportunities, so we preserve the existing matcher
            # contract and return an empty result set until the protocol includes
            # opportunity data or a backend-owned opportunity lookup is added.
            result = match_opportunities(user=user, opportunities=[])

            opportunities = [
                trace_pb2.MatchedOpportunity(
                    opportunity_id=opp.opportunity_id,
                    match_score=float(opp.match_score),
                    title=opp.title,
                )
                for opp in result.matched_opportunities
            ]

            return trace_pb2.MatchResponse(
                user_id=result.user_id,
                opportunities=opportunities,
            )
        except Exception as exc:
            logger.exception("gRPC MatchOpportunities failed for user %s", request.user_id)
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(exc))
            return trace_pb2.MatchResponse()


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
    server = create_server()
    bind_address = f"{settings.GRPC_SERVICE_HOST}:{settings.GRPC_SERVICE_PORT}"
    server.add_insecure_port(bind_address)
    logger.info("gRPC server listening on %s", bind_address)
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
