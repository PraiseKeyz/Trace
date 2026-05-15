import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './sms/sms.module';
import { UsersModule } from './users/users.module';
import { GrpcModule } from './grpc/grpc.module';
import { EconomicProfileModule } from './economic-profile/economic-profile.module';
import { TransactionsModule } from './transactions/transactions.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { SquadModule } from './squad/squad.module';
import { VouchModule } from './vouch/vouch.module';
import { UploadModule } from './upload/upload.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([{
      name: 'global',
      ttl: 60000,
      limit: 120,
    }]),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') ?? 'localhost',
          port: configService.get<number>('REDIS_PORT') ?? 6379,
          password: configService.get<string>('REDIS_PASSWORD') ?? undefined
        },
      }),
    }),

    AuthModule,
    SmsModule,
    UsersModule,
    GrpcModule,
    EconomicProfileModule,
    TransactionsModule,
    OpportunitiesModule,
    SquadModule,
    VouchModule,
    UploadModule,
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

