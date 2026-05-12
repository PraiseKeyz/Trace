import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '@/opportunities/prisma/prisma.module';

@Global()
@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [UsersController],
  providers: [UserRepository, UsersService],
  exports: [UserRepository, UsersService],
})
export class UsersModule { }
