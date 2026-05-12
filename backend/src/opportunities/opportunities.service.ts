import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ApplyOpportunityDto } from './dto/apply-opportunity.dto';
import { GrpcService, MatchedOpportunity } from '@/grpc/grpc.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly grpcService: GrpcService,
  ) { }

  async create(userId: string, dto: CreateOpportunityDto) {
    return this.prisma.opportunity.create({
      data: {
        posted_by: userId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        skills_required: dto.skills_required || [],
        languages_required: dto.languages_required || [],
        state: dto.state,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        is_remote: dto.is_remote || false,
        pay_min: dto.pay_min,
        pay_max: dto.pay_max,
        currency: dto.currency || 'NGN',
        payment_method: dto.payment_method || 'squad',
      },
    });
  }

  async findAll() {
    return this.prisma.opportunity.findMany({
      where: { status: 'open' },
      include: {
        poster: {
          select: {
            id: true,
            full_name: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            full_name: true,
            city: true,
            state: true,
          },
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    return opportunity;
  }

  async apply(userId: string, dto: ApplyOpportunityDto) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: dto.opportunity_id },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'open') {
      throw new BadRequestException('This opportunity is no longer open');
    }

    return this.prisma.opportunityApplication.create({
      data: {
        opportunity_id: dto.opportunity_id,
        applicant_id: userId,
        match_score: dto.match_score,
      },
    });
  }

  async getMatches(userId: string): Promise<MatchedOpportunity[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { economic_profile: true },
    });

    if (!user || !user.economic_profile) {
      throw new NotFoundException('User profile not found. Complete onboarding first.');
    }

    // Call Python AI service for matching
    const result = await this.grpcService.matchOpportunities({
      user_id: userId,
      skills: user.economic_profile.skills,
      latitude: Number(user.latitude || 0),
      longitude: Number(user.longitude || 0),
      languages: user.languages,
    });

    return result.opportunities;
  }

  async updateApplicationStatus(applicationId: string, status: string) {
    return this.prisma.opportunityApplication.update({
      where: { id: applicationId },
      data: { status },
    });
  }

  async selectApplicant(opportunityId: string, applicantId: string, userId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity || opportunity.posted_by !== userId) {
      throw new BadRequestException('Unauthorized or opportunity not found');
    }

    return this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        selected_applicant: applicantId,
        status: 'filled',
      },
    });
  }
}
