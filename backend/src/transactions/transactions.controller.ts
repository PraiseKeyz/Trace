import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Req() req: RequestWithUser, @Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.id, createTransactionDto);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.transactionsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.transactionsService.findOne(id, req.user.id);
  }
}
