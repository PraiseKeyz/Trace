import { Module } from '@nestjs/common';
import { VouchService } from './vouch.service';
import { VouchController } from './vouch.controller';
import { PrismaModule } from '@/opportunities/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VouchController],
  providers: [VouchService],
  exports: [VouchService],
})
export class VouchModule {}
