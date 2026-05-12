import grpc
from concurrent import futures
import time
import sys
import os

# Add the api directory to the path so that generated trace_pb2_grpc can find trace_pb2
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

# Import the generated classes
import trace_pb2
import trace_pb2_grpc

# Import our actual business logic functions
from api.score import calculate_score, ScoreRequest
from api.match import match_opportunities, MatchRequest

class ScoringServiceServicer(trace_pb2_grpc.ScoringServiceServicer):
    def ScoreUser(self, request, context):
        # Convert gRPC request to our FastAPI Pydantic model structure if needed,
        # or just pass the data directly to the business logic.
        logic_request = ScoreRequest(
            user_id=request.user_id,
            transaction_history_score=request.transaction_history_score,
            platform_activity_score=request.platform_activity_score,
            community_vouching_score=request.community_vouching_score,
            profile_completeness_score=request.profile_completeness_score
        )
        
        # Call the existing logic we wrote for the REST API
        result = calculate_score(logic_request)
        
        # Convert back to gRPC response
        return trace_pb2.ScoreResponse(
            user_id=result["user_id"],
            identity_score=result["identity_score"],
            risk_tier=result["risk_tier"]
        )

class MatchingServiceServicer(trace_pb2_grpc.MatchingServiceServicer):
    def MatchOpportunities(self, request, context):
        logic_request = MatchRequest(
            user_id=request.user_id,
            skills=list(request.skills),
            location={"latitude": request.latitude, "longitude": request.longitude},
            languages=list(request.languages)
        )
        
        result = match_opportunities(logic_request)
        
        # Map the list of dictionaries back to the gRPC repeated message
        opportunities = [
            trace_pb2.MatchedOpportunity(
                opportunity_id=opp["opportunity_id"],
                match_score=opp["match_score"],
                title=opp["title"]
            )
            for opp in result["matched_opportunities"]
        ]
        
        return trace_pb2.MatchResponse(
            user_id=result["user_id"],
            opportunities=opportunities
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    trace_pb2_grpc.add_ScoringServiceServicer_to_server(ScoringServiceServicer(), server)
    trace_pb2_grpc.add_MatchingServiceServicer_to_server(MatchingServiceServicer(), server)
    
    # Standard gRPC port
    server.add_insecure_port('[::]:50051')
    print("gRPC server listening on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
