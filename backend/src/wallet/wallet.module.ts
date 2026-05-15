import { Module } from '@nestjs/common';
import { PrismaModule } from '@/opportunities/prisma/prisma.module';
import { SquadModule } from '@/squad/squad.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [PrismaModule, SquadModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
