import { Controller, Get, Patch, Post, Body, Req, UseGuards } from '@nestjs/common';
import { EconomicProfileService } from './economic-profile.service';
import { UpdateSkillsDto } from './dto/update-skills.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('economic-profile')
export class EconomicProfileController {
  constructor(private readonly economicProfileService: EconomicProfileService) {}

  @Get('me')
  async getMyProfile(@Req() req: RequestWithUser) {
    return this.economicProfileService.getMyProfile(req.user.id);
  }

  @Patch('me/skills')
  async updateSkills(@Req() req: RequestWithUser, @Body() dto: UpdateSkillsDto) {
    return this.economicProfileService.updateSkills(req.user.id, dto);
  }

  @Post('me/recalculate')
  async recalculateScore(@Req() req: RequestWithUser) {
    return this.economicProfileService.recalculateScore(req.user.id);
  }
}
