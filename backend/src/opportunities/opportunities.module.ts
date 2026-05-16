import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { PrismaModule } from '@/opportunities/prisma/prisma.module';
import { GrpcModule } from '@/grpc/grpc.module';

@Module({
  imports: [
    PrismaModule,
    GrpcModule,
    BullModule.registerQueue({ name: 'score-recalculation' }),
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
