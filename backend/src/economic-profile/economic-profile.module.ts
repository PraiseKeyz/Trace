import { Module } from '@nestjs/common';
import { EconomicProfileService } from './economic-profile.service';
import { EconomicProfileController } from './economic-profile.controller';
import { GrpcModule } from '@/grpc/grpc.module';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [GrpcModule, PrismaModule],
  controllers: [EconomicProfileController],
  providers: [EconomicProfileService],
  exports: [EconomicProfileService],
})
export class EconomicProfileModule {}
