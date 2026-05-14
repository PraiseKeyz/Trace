import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { VouchService } from './vouch.service';
import { CreateVouchDto } from './dto/create-vouch.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('vouches')
export class VouchController {
  constructor(private readonly vouchService: VouchService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() dto: CreateVouchDto) {
    return this.vouchService.create(req.user.id, dto);
  }

  @Get('received')
  getReceived(@Req() req: RequestWithUser) {
    return this.vouchService.getReceived(req.user.id);
  }

  @Get('given')
  getGiven(@Req() req: RequestWithUser) {
    return this.vouchService.getGiven(req.user.id);
  }

  @Delete(':id')
  remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.vouchService.remove(id, req.user.id);
  }
}
