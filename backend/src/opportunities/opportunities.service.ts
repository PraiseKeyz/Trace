import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { OpportunityApplicationStatus } from '../../generated/prisma/enums';
import { SquadService } from '@/squad/squad.service';
import { GrpcService, MatchedOpportunity } from '@/grpc/grpc.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ApplyOpportunityDto } from './dto/apply-opportunity.dto';
import { ApproveOpportunityDto } from './dto/approve-opportunity.dto';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly squadService: SquadService,
    private readonly grpcService: GrpcService,
    @InjectQueue('score-recalculation') private readonly scoreQueue: Queue,
  ) {}

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

  async findAll(page = 1, limit = 20) {
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.opportunity.findMany({
        where: { status: 'open' },
        include: {
          poster: { select: { id: true, full_name: true, city: true, state: true } },
        },
        orderBy: { created_at: 'desc' },
        take,
        skip,
      }),
      this.prisma.opportunity.count({ where: { status: 'open' } }),
    ]);

    return { items, page, limit: take, total, totalPages: Math.ceil(total / take) };
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        poster: { select: { id: true, full_name: true, city: true, state: true } },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                full_name: true,
                economic_profile: {
                  select: { identity_score: true, risk_tier: true, skills: true },
                },
              },
            },
          },
        },
      },
    });

    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return opportunity;
  }

  async apply(userId: string, dto: ApplyOpportunityDto) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: dto.opportunity_id },
    });

    if (!opportunity) throw new NotFoundException('Opportunity not found');
    if (opportunity.status !== 'open') {
      throw new BadRequestException('This opportunity is no longer accepting applications');
    }
    if (opportunity.posted_by === userId) {
      throw new BadRequestException('You cannot apply to your own opportunity');
    }

    return this.prisma.opportunityApplication.create({
      data: {
        opportunity_id: dto.opportunity_id,
        applicant_id: userId,
        match_score: dto.match_score,
        cover_note: dto.cover_note,
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

    const result = await this.grpcService.matchOpportunities({
      user_id: userId,
      skills: user.economic_profile.skills,
      latitude: Number(user.latitude || 0),
      longitude: Number(user.longitude || 0),
      languages: user.languages,
    });

    return result.opportunities ?? [];
  }

  async getMyApplications(userId: string) {
    return this.prisma.opportunityApplication.findMany({
      where: { applicant_id: userId },
      include: {
        opportunity: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            escrow_amount: true,
            worker_done_at: true,
            auto_release_at: true,
            pay_min: true,
            pay_max: true,
            currency: true,
            city: true,
            state: true,
            poster: { select: { id: true, full_name: true } },
          },
        },
      },
      orderBy: { applied_at: 'desc' },
    });
  }

  async getMyPosts(userId: string) {
    return this.prisma.opportunity.findMany({
      where: { posted_by: userId },
      include: {
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                full_name: true,
                city: true,
                state: true,
                economic_profile: {
                  select: { identity_score: true, risk_tier: true, skills: true },
                },
              },
            },
          },
          orderBy: { applied_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ── Poster: approve an applicant and lock funds ───────────────────────────

  async approveApplicant(
    opportunityId: string,
    applicantId: string,
    posterId: string,
    dto: ApproveOpportunityDto,
  ) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) throw new NotFoundException('Opportunity not found');
    if (opportunity.posted_by !== posterId) throw new ForbiddenException('Not your opportunity');
    if (opportunity.status !== 'open') {
      throw new BadRequestException('This opportunity is no longer open');
    }

    const payMin = Number(opportunity.pay_min ?? 0);
    if (payMin > 0 && dto.agreed_amount < payMin) {
      throw new BadRequestException(
        `Agreed amount cannot be below the minimum pay of ₦${payMin.toLocaleString()}`,
      );
    }

    // Set escrow_amount and selected_applicant, then lock funds
    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        selected_applicant: applicantId,
        escrow_amount: dto.agreed_amount,
        status: 'filled',
        funds_locked_at: new Date(),
      },
    });

    // Mark the chosen application as accepted, reject the rest
    await this.prisma.opportunityApplication.updateMany({
      where: { opportunity_id: opportunityId, applicant_id: { not: applicantId } },
      data: { status: 'rejected' },
    });
    await this.prisma.opportunityApplication.updateMany({
      where: { opportunity_id: opportunityId, applicant_id: applicantId },
      data: { status: 'accepted' },
    });

    // Lock funds via Squad
    const escrow = await this.squadService.lockEscrow(opportunityId, posterId);

    return {
      message: 'Applicant approved and funds locked in escrow',
      escrow_reference: escrow.escrow_reference,
      agreed_amount: dto.agreed_amount,
      checkout_url: escrow.checkout_url,
    };
  }

  // ── Worker: mark job as done ──────────────────────────────────────────────

  async markDone(opportunityId: string, workerId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) throw new NotFoundException('Opportunity not found');
    if (opportunity.selected_applicant !== workerId) {
      throw new ForbiddenException('You are not the assigned worker for this opportunity');
    }
    if (opportunity.status !== 'filled') {
      throw new BadRequestException(
        `Cannot mark done — current status is '${opportunity.status}'`,
      );
    }

    const workerDoneAt = new Date();
    const autoReleaseAt = new Date(workerDoneAt.getTime() + SEVEN_DAYS_MS);

    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        status: 'worker_done',
        worker_done_at: workerDoneAt,
        auto_release_at: autoReleaseAt,
      },
    });

    // Queue auto-release after 7 days via BullMQ
    await this.scoreQueue.add(
      'auto-release-escrow',
      { opportunityId },
      { delay: SEVEN_DAYS_MS, attempts: 3, backoff: { type: 'exponential', delay: 60_000 } },
    );

    return {
      message: 'Job marked as done. The poster has 7 days to confirm or raise a dispute.',
      auto_release_at: autoReleaseAt,
    };
  }

  // ── Poster: confirm completion → release funds ────────────────────────────

  async confirmCompletion(opportunityId: string, posterId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) throw new NotFoundException('Opportunity not found');
    if (opportunity.posted_by !== posterId) throw new ForbiddenException('Not your opportunity');
    if (opportunity.status !== 'worker_done') {
      throw new BadRequestException(
        'Can only confirm after the worker has marked the job as done',
      );
    }

    await this.squadService.autoReleaseEscrow(opportunityId);

    return { message: 'Job confirmed — payment released to the worker' };
  }

  // ── Poster: raise a dispute → freeze funds ────────────────────────────────

  async raiseDispute(opportunityId: string, posterId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) throw new NotFoundException('Opportunity not found');
    if (opportunity.posted_by !== posterId) throw new ForbiddenException('Not your opportunity');
    if (!['filled', 'worker_done'].includes(opportunity.status)) {
      throw new BadRequestException('No active escrow to dispute');
    }

    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: 'disputed' },
    });

    return {
      message: 'Dispute raised — funds are frozen. Our team will review within 48 hours.',
    };
  }

  // ── Legacy: kept for backward compatibility ───────────────────────────────

  async updateApplicationStatus(applicationId: string, status: OpportunityApplicationStatus) {
    return this.prisma.opportunityApplication.update({
      where: { id: applicationId },
      data: { status },
    });
  }
}
