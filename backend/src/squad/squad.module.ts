import { Module } from '@nestjs/common';
import { EconomicProfileModule } from '@/economic-profile/economic-profile.module';
import { PrismaModule } from '@/opportunities/prisma/prisma.module';
import { SquadController } from './squad.controller';
import { WebhooksController } from './webhooks.controller';
import { SquadService } from './squad.service';

@Module({
  imports: [PrismaModule, EconomicProfileModule],
  controllers: [SquadController, WebhooksController],
  providers: [SquadService],
  exports: [SquadService],
})
export class SquadModule {}
