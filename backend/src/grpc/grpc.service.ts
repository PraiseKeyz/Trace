import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices/interfaces';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

// ─── Service interfaces (mirror the .proto definitions) ───────────────────────

export interface ScoreRequest {
  user_id: string;
  transaction_history_score: number;
  platform_activity_score: number;
  community_vouching_score: number;
  profile_completeness_score: number;
}

export interface ScoreResponse {
  user_id?: string;
  userId?: string;
  identity_score?: number;
  identityScore?: number;
  risk_tier?: string;
  riskTier?: string;
}

export interface MatchRequest {
  user_id: string;
  skills: string[];
  latitude: number;
  longitude: number;
  languages: string[];
}

export interface MatchedOpportunity {
  opportunity_id: string;
  match_score: number;
  title: string;
}

export interface MatchResponse {
  user_id: string;
  opportunities: MatchedOpportunity[];
}

export interface ScoringServiceClient {
  ScoreUser(request: ScoreRequest): Observable<ScoreResponse>;
}

export interface MatchingServiceClient {
  MatchOpportunities(request: MatchRequest): Observable<MatchResponse>;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class GrpcService implements OnModuleInit {
  private readonly logger = new Logger(GrpcService.name);
  private scoringService: ScoringServiceClient;
  private matchingService: MatchingServiceClient;

  constructor(@Inject('AI_SERVICE') private readonly client: ClientGrpc) { }

  onModuleInit() {
    this.scoringService = this.client.getService<ScoringServiceClient>('ScoringService');
    this.matchingService = this.client.getService<MatchingServiceClient>('MatchingService');
  }

  async scoreUser(request: ScoreRequest): Promise<ScoreResponse> {
    try {
      const result = await firstValueFrom(this.scoringService.ScoreUser(request));
      this.logger.debug(`gRPC ScoreUser response: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error('gRPC ScoreUser failed', error);
      throw error;
    }
  }

  async matchOpportunities(request: MatchRequest): Promise<MatchResponse> {
    try {
      return await firstValueFrom(this.matchingService.MatchOpportunities(request));
    } catch (error) {
      this.logger.error('gRPC MatchOpportunities failed', error);
      throw error;
    }
  }
}
