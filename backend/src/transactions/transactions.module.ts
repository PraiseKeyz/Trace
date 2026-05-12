import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { EconomicProfileModule } from '@/economic-profile/economic-profile.module';
import { PrismaModule } from '@/opportunities/prisma/prisma.module';

@Module({
  imports: [PrismaModule, EconomicProfileModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }
