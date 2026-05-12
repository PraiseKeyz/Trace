import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './sms/sms.module';
import { UsersModule } from './users/users.module';
import { GrpcModule } from './grpc/grpc.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Global config — all modules can now inject ConfigService without importing ConfigModule themselves
    ConfigModule.forRoot({ isGlobal: true }),

    // Global rate limiter: max 10 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{
      name: 'global',
      ttl: 60000,  // 60 seconds
      limit: 10,
    }]),

    AuthModule,
    SmsModule,
    UsersModule,
    GrpcModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply throttling globally to every endpoint
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
