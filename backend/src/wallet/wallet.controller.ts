import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  getMyWallet(@Req() req: RequestWithUser) {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('deposit')
  initiateDeposit(@Req() req: RequestWithUser, @Body() dto: DepositDto) {
    return this.walletService.initiateDeposit(req.user.id, dto);
  }

  @Post('withdraw')
  withdraw(@Req() req: RequestWithUser, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(req.user.id, dto);
  }
}
