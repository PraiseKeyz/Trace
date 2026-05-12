import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { GrpcService } from '@/grpc/grpc.service';
import { UpdateSkillsDto } from './dto/update-skills.dto';
import { EconomicProfile } from '../../generated/prisma/client';

@Injectable()
export class EconomicProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly grpcService: GrpcService,
  ) {}

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

    // Determine finance eligibility based on risk tier
    const isFinanceEligible = ['Very Low', 'Low'].includes(result.risk_tier);

    // Persist the updated scores from the AI
    return this.prisma.economicProfile.update({
      where: { user_id: userId },
      data: {
        identity_score: Math.round(result.identity_score),
        risk_tier: result.risk_tier.toLowerCase(),
        is_finance_eligible: isFinanceEligible,
        last_active: new Date(),
      },
    });
  }
}
