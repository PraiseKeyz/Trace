import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { GrpcService } from './grpc.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AI_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'trace',
            protoPath: join(__dirname, '../../proto/trace.proto'),
            url: configService.get<string>('AI_SERVICE_URL') || 'localhost:50051',
          },
        }),
      },
    ]),
  ],
  providers: [GrpcService],
  exports: [GrpcService],
})
export class GrpcModule { }
