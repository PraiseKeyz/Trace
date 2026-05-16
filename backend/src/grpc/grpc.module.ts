import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices/module/clients.module';
import { Transport } from '@nestjs/microservices/enums';
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
            protoPath: join(process.cwd(), 'proto/trace.proto'),
            url: configService.get<string>('AI_SERVICE_URL') || 'localhost:50051',
            loader: { keepCase: true },
          },
        }),
      },
    ]),
  ],
  providers: [GrpcService],
  exports: [GrpcService],
})
export class GrpcModule { }
