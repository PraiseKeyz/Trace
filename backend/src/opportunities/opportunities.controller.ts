import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ApplyOpportunityDto } from './dto/apply-opportunity.dto';
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
  findAll() {
    return this.opportunitiesService.findAll();
  }

  @Get('matches')
  getMatches(@Req() req: RequestWithUser) {
    return this.opportunitiesService.getMatches(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Post('apply')
  apply(@Req() req: RequestWithUser, @Body() dto: ApplyOpportunityDto) {
    return this.opportunitiesService.apply(req.user.id, dto);
  }

  @Patch(':id/select-applicant/:applicantId')
  selectApplicant(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Param('applicantId') applicantId: string,
  ) {
    return this.opportunitiesService.selectApplicant(id, applicantId, req.user.id);
  }
}
