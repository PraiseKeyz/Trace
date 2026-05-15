import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { WalletService } from './wallet.service';
import { WithdrawDto } from './dto/withdraw.dto';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  getMyWallet(@Req() req: RequestWithUser) {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('withdraw')
  withdraw(@Req() req: RequestWithUser, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(req.user.id, dto);
  }
}
