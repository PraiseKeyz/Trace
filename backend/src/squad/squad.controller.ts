import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import { SquadService } from './squad.service';
import { CreateVirtualAccountDto } from './dto/create-virtual-account.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { LookupAccountDto } from './dto/lookup-account.dto';
import { TransferDto } from './dto/transfer.dto';
import { RequeryTransferDto } from './dto/requery-transfer.dto';
import { ListTransfersDto } from './dto/list-transfers.dto';
import { RefundDto } from './dto/refund.dto';
import { QueryVaTransactionsDto } from './dto/query-va-transactions.dto';

@Controller('squad')
export class SquadController {
  constructor(private readonly squadService: SquadService) { }

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
  @Post('my-virtual-account')
  generateMyVirtualAccount(@Req() req: RequestWithUser) {
    const user = req.user;

    if (!user.email) {
      throw new BadRequestException('Please add an email to your profile before generating a virtual account');
    }
    if (!user.dob) {
      throw new BadRequestException('Please set your date of birth on your profile before generating a virtual account');
    }
    if (!user.gender) {
      throw new BadRequestException('Please set your gender on your profile before generating a virtual account');
    }

    const genderMap: Record<string, '1' | '2'> = {
      male: '1', m: '1', '1': '1',
      female: '2', f: '2', '2': '2',
    };
    const gender = genderMap[user.gender.toLowerCase()];
    if (!gender) {
      throw new BadRequestException(`Unrecognised gender value '${user.gender}' on your profile`);
    }

    const address = [user.city, user.state].filter(Boolean).join(', ') || 'Nigeria';
    const [firstName, ...rest] = (user.full_name ?? '').trim().split(/\s+/);

    return this.squadService.createVirtualAccountForUser(user.id, {
      customer_identifier: user.id,
      first_name: firstName || user.phone,
      last_name: rest.join(' ') || '-',
      mobile_num: user.phone,
      email: user.email,
      bvn: process.env.BVN!,
      dob: user.dob,
      address,
      gender,
      beneficiary_account: process.env.SQUAD_BENEFICIARY_ACCOUNT_NUMBER,
    });
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


  @UseGuards(JwtAuthGuard)
  @Get('transactions/verify/:ref')
  verifyTransaction(@Param('ref') ref: string) {
    return this.squadService.verifyTransaction(ref);
  }



  @UseGuards(JwtAuthGuard)
  @Get('wallet/balance')
  getWalletBalance(@Query('currency_id') currencyId?: string) {
    return this.squadService.getWalletBalance(currencyId);
  }


  @UseGuards(JwtAuthGuard)
  @Post('refunds')
  refund(@Body() dto: RefundDto) {
    return this.squadService.refund(dto);
  }


  @UseGuards(JwtAuthGuard)
  @Get('virtual-accounts/transactions/customer/:customerIdentifier')
  queryVaTransactionsByCustomer(
    @Param('customerIdentifier') customerIdentifier: string,
  ) {
    return this.squadService.queryVaTransactionsByCustomer(customerIdentifier);
  }

  @UseGuards(JwtAuthGuard)
  @Get('virtual-accounts/transactions')
  queryAllMerchantTransactions(@Query() query: QueryVaTransactionsDto) {
    return this.squadService.queryAllMerchantTransactions(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('virtual-accounts/customer/account/:accountNumber')
  getCustomerByVirtualAccount(@Param('accountNumber') accountNumber: string) {
    return this.squadService.getCustomerByVirtualAccount(accountNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Get('virtual-accounts/customer/identifier/:identifier')
  getCustomerByIdentifier(@Param('identifier') identifier: string) {
    return this.squadService.getCustomerByIdentifier(identifier);
  }


  @UseGuards(JwtAuthGuard)
  @Post('escrow/:opportunityId/lock')
  lockEscrow(
    @Req() req: RequestWithUser,
    @Param('opportunityId') opportunityId: string,
  ) {
    return this.squadService.lockEscrow(opportunityId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('escrow/:opportunityId/release')
  releaseEscrow(
    @Req() req: RequestWithUser,
    @Param('opportunityId') opportunityId: string,
  ) {
    return this.squadService.releaseEscrow(opportunityId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('escrow/:opportunityId/cancel')
  cancelEscrow(
    @Req() req: RequestWithUser,
    @Param('opportunityId') opportunityId: string,
    @Body('reason') reason: string,
  ) {
    return this.squadService.cancelEscrow(opportunityId, req.user.id, reason);
  }
}

