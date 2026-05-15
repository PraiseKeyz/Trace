import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ApplyOpportunityDto } from './dto/apply-opportunity.dto';
import { ApproveOpportunityDto } from './dto/approve-opportunity.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.opportunitiesService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // exact routes before /:id
  @Get('matches')
  getMatches(@Req() req: RequestWithUser) {
    return this.opportunitiesService.getMatches(req.user.id);
  }

  @Get('my-applications')
  getMyApplications(@Req() req: RequestWithUser) {
    return this.opportunitiesService.getMyApplications(req.user.id);
  }

  @Get('my-posts')
  getMyPosts(@Req() req: RequestWithUser) {
    return this.opportunitiesService.getMyPosts(req.user.id);
  }

  @Post('apply')
  apply(@Req() req: RequestWithUser, @Body() dto: ApplyOpportunityDto) {
    return this.opportunitiesService.apply(req.user.id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  // ── Escrow flow ────────────────────────────────────────────────────────────

  @Post(':id/approve/:applicantId')
  approveApplicant(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('applicantId') applicantId: string,
    @Body() dto: ApproveOpportunityDto,
  ) {
    return this.opportunitiesService.approveApplicant(id, applicantId, req.user.id, dto);
  }

  @Post(':id/mark-done')
  markDone(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.opportunitiesService.markDone(id, req.user.id);
  }

  @Post(':id/confirm')
  confirmCompletion(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.opportunitiesService.confirmCompletion(id, req.user.id);
  }

  @Post(':id/dispute')
  raiseDispute(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.opportunitiesService.raiseDispute(id, req.user.id);
  }
}
