import { Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { PrismaModule } from '@/opportunities/prisma/prisma.module';
import { GrpcModule } from '@/grpc/grpc.module';

@Module({
  imports: [PrismaModule, GrpcModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule { }
