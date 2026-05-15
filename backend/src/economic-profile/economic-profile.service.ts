import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { GrpcService } from '@/grpc/grpc.service';
import { UpdateSkillsDto } from './dto/update-skills.dto';
import { EconomicProfile } from '../../generated/prisma/client';

@Injectable()
export class EconomicProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly grpcService: GrpcService,
  ) { }

  // Called automatically when user completes onboarding
  async createInitialProfile(userId: string): Promise<EconomicProfile> {
    return this.prisma.economicProfile.upsert({
      where: { user_id: userId },
      create: { user_id: userId },
      update: {}, // No-op if already exists
    });
  }

  async getMyProfile(userId: string): Promise<EconomicProfile> {
    const profile = await this.prisma.economicProfile.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new NotFoundException('Economic profile not found. Complete onboarding first.');
    }

    return profile;
  }

  async updateSkills(userId: string, dto: UpdateSkillsDto): Promise<EconomicProfile> {
    await this.getMyProfile(userId); // Ensure profile exists

    return this.prisma.economicProfile.update({
      where: { user_id: userId },
      data: {
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.trade_category !== undefined && { trade_category: dto.trade_category }),
        ...(dto.years_active !== undefined && { years_active: dto.years_active }),
      },
    });
  }

  async recalculateScore(userId: string): Promise<EconomicProfile> {
    const profile = await this.getMyProfile(userId);

    // Call Python AI service via gRPC
    const result = await this.grpcService.scoreUser({
      user_id: userId,
      transaction_history_score: Number(profile.transaction_score),
      platform_activity_score: Number(profile.activity_score),
      community_vouching_score: Number(profile.vouch_score),
      profile_completeness_score: Number(profile.profile_completeness),
    });

    const riskTierFromResponse = result.risk_tier ?? result.riskTier;
    const identityScore = result.identity_score ?? result.identityScore ?? (
      riskTierFromResponse ? 0 : undefined
    );
    const riskTier = riskTierFromResponse ?? (
      identityScore === undefined ? undefined : this.riskTierFromScore(identityScore)
    );

    if (identityScore === undefined || !riskTier) {
      throw new BadGatewayException(
        `AI scoring service returned an invalid score response: ${JSON.stringify(result)}`,
      );
    }

    // Determine finance eligibility based on risk tier
    const normalizedRiskTier = riskTier.toLowerCase().replace(/_/g, ' ');
    const isFinanceEligible = ['very low', 'low'].includes(normalizedRiskTier);

    // Persist the updated scores from the AI
    return this.prisma.economicProfile.update({
      where: { user_id: userId },
      data: {
        identity_score: Math.round(identityScore),
        risk_tier: normalizedRiskTier,
        is_finance_eligible: isFinanceEligible,
        last_active: new Date(),
      },
    });
  }

  private riskTierFromScore(score: number): string {
    if (score >= 75) return 'Very Low';
    if (score >= 55) return 'Low';
    if (score >= 30) return 'Medium';
    return 'High';
  }
}
