import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EconomicProfileModule } from '@/economic-profile/economic-profile.module';
import { PrismaModule } from '@/opportunities/prisma/prisma.module';
import { SquadController } from './squad.controller';
import { WebhooksController } from './webhooks.controller';
import { SquadService } from './squad.service';
import { ScoreRecalculationProcessor } from './score-recalculation.processor';

@Module({
  imports: [
    PrismaModule,
    EconomicProfileModule,
    BullModule.registerQueue({
      name: 'score-recalculation',
    }),
  ],
  controllers: [SquadController, WebhooksController],
  providers: [SquadService, ScoreRecalculationProcessor],
  exports: [SquadService],
})
export class SquadModule { }
