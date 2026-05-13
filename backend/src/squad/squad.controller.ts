import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { SquadService } from './squad.service';
import { CreateVirtualAccountDto } from './dto/create-virtual-account.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { LookupAccountDto } from './dto/lookup-account.dto';
import { TransferDto } from './dto/transfer.dto';
import { RequeryTransferDto } from './dto/requery-transfer.dto';
import { ListTransfersDto } from './dto/list-transfers.dto';

@Controller('squad')
export class SquadController {
  constructor(private readonly squadService: SquadService) {}

  @Get('banks')
  getBanks() {
    return this.squadService.getBanks();
  }

  @UseGuards(JwtAuthGuard)
  @Post('virtual-accounts')
  createVirtualAccount(
    @Req() req: RequestWithUser,
    @Body() dto: CreateVirtualAccountDto,
  ) {
    return this.squadService.createVirtualAccountForUser(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payment-links')
  initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.squadService.initiatePayment(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('accounts/resolve')
  lookupAccount(@Body() dto: LookupAccountDto) {
    return this.squadService.lookupAccount(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfers')
  transfer(@Body() dto: TransferDto) {
    return this.squadService.transfer(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfers/requery')
  requeryTransfer(@Body() dto: RequeryTransferDto) {
    return this.squadService.requeryTransfer(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transfers')
  listTransfers(@Query() query: ListTransfersDto) {
    return this.squadService.listTransfers(query);
  }
}
