import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { EconomicProfileService } from '@/economic-profile/economic-profile.service';
import { CreateVirtualAccountDto } from './dto/create-virtual-account.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { LookupAccountDto } from './dto/lookup-account.dto';
import { TransferDto } from './dto/transfer.dto';
import { RequeryTransferDto } from './dto/requery-transfer.dto';
import { ListTransfersDto } from './dto/list-transfers.dto';

type SquadResponse<T = unknown> = {
  status?: number;
  success?: boolean;
  message?: string;
  data?: T;
};

type Bank = {
  code: string;
  name: string;
};

@Injectable()
export class SquadService {
  private readonly logger = new Logger(SquadService.name);
  private readonly baseUrl: string;
  private readonly secretKey?: string;
  private readonly banks: Bank[];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly economicProfileService: EconomicProfileService,
  ) {
    this.baseUrl =
      this.configService.get<string>('SQUAD_BASE_URL') ??
      'https://sandbox-api-d.squadco.com';
    this.secretKey = this.configService.get<string>('SQUAD_SECRET_KEY');
    this.banks = this.loadBanks();
  }

  getBanks() {
    return this.banks;
  }

  async createVirtualAccount(dto: CreateVirtualAccountDto) {
    return this.request('/virtual-account', {
      method: 'POST',
      body: dto,
    });
  }

  async createVirtualAccountForUser(userId: string, dto: CreateVirtualAccountDto) {
    const response = await this.createVirtualAccount(dto);
    const data = response.data as any;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        squad_customer_id: data?.customer_identifier ?? dto.customer_identifier,
        virtual_account_no: data?.virtual_account_number,
      },
    });

    return response;
  }

  async initiatePayment(dto: InitiatePaymentDto) {
    return this.request('/transaction/initiate', {
      method: 'POST',
      body: {
        ...dto,
        initiate_type: 'inline',
        currency: dto.currency ?? 'NGN',
        payment_channels: ['card', 'bank', 'ussd', 'transfer'],
        metadata: dto.metadata ?? {},
      },
    });
  }

  async lookupAccount(dto: LookupAccountDto) {
    return this.request('/payout/account/lookup', {
      method: 'POST',
      body: dto,
    });
  }

  async transfer(dto: TransferDto) {
    return this.request('/payout/transfer', {
      method: 'POST',
      body: dto,
    });
  }

  async requeryTransfer(dto: RequeryTransferDto) {
    return this.request('/payout/requery', {
      method: 'POST',
      body: dto,
    });
  }

  async listTransfers(query: ListTransfersDto) {
    const params = new URLSearchParams({
      page: String(query.page ?? 1),
      perPage: String(query.perPage ?? 20),
      dir: query.dir ?? 'DESC',
    });

    return this.request(`/payout/list?${params.toString()}`, {
      method: 'GET',
    });
  }

  verifyWebhookSignature(payload: unknown, encryptedBody?: string) {
    if (!this.secretKey) {
      throw new InternalServerErrorException('SQUAD_SECRET_KEY is not configured');
    }

    if (!encryptedBody) {
      throw new BadRequestException('x-squad-encrypted-body header is required');
    }

    const computedHash = createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex')
      .toUpperCase();

    const received = encryptedBody.toUpperCase();
    const computedBuffer = Buffer.from(computedHash);
    const receivedBuffer = Buffer.from(received);

    return (
      computedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(computedBuffer, receivedBuffer)
    );
  }

  async processWebhook(payload: any, encryptedBody?: string) {
    if (!this.verifyWebhookSignature(payload, encryptedBody)) {
      throw new BadRequestException('Invalid Squad webhook signature');
    }

    void this.recordWebhookTransaction(payload).catch((error) => {
      this.logger.error('Failed to process Squad webhook', error);
    });

    return { message: 'Webhook received' };
  }

  private async recordWebhookTransaction(payload: any) {
    const body = payload?.Body ?? payload;
    const reference =
      payload?.TransactionRef ??
      body?.transaction_ref ??
      body?.transaction_reference ??
      body?.gateway_ref;

    if (!reference) {
      this.logger.warn('Squad webhook skipped because it has no transaction reference');
      return;
    }

    const metadata = body?.meta ?? body?.metadata ?? {};
    const userId = metadata.user_id ?? metadata.userId;

    if (!userId) {
      this.logger.warn(`Squad webhook ${reference} skipped because metadata.user_id is missing`);
      return;
    }

    const status = this.mapTransactionStatus(body?.transaction_status);
    const amount = Number(body?.amount ?? body?.principal_amount ?? 0) / 100;

    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { squad_reference: reference },
    });

    await this.prisma.transaction.upsert({
      where: { squad_reference: reference },
      create: {
        user_id: userId,
        squad_reference: reference,
        type: this.mapTransactionType(body?.transaction_type ?? body?.channel),
        category: metadata.category ?? 'squad_payment',
        amount,
        currency: body?.currency ?? 'NGN',
        status,
        metadata: payload,
      },
      update: {
        status,
        metadata: payload,
      },
    });

    if (status === 'successful' && existingTransaction?.status !== 'successful') {
      await this.prisma.economicProfile.upsert({
        where: { user_id: userId },
        create: {
          user_id: userId,
          total_transaction_volume: amount,
          total_transaction_count: 1,
          last_transaction_at: new Date(),
        },
        update: {
          total_transaction_volume: { increment: amount },
          total_transaction_count: { increment: 1 },
          last_transaction_at: new Date(),
        },
      });

      await this.economicProfileService.recalculateScore(userId);
    }
  }

  private loadBanks() {
    const possiblePaths = [
      join(__dirname, 'data', 'nigerian-banks.json'),
      join(process.cwd(), 'src', 'squad', 'data', 'nigerian-banks.json'),
    ];

    for (const path of possiblePaths) {
      try {
        return JSON.parse(readFileSync(path, 'utf8')) as Bank[];
      } catch {
        continue;
      }
    }

    throw new InternalServerErrorException('Nigerian bank code list could not be loaded');
  }

  private async request<T = unknown>(
    path: string,
    options: { method: 'GET' | 'POST' | 'PATCH'; body?: unknown },
  ): Promise<SquadResponse<T>> {
    if (!this.secretKey) {
      throw new InternalServerErrorException('SQUAD_SECRET_KEY is not configured');
    }

    let response: globalThis.Response;

    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        method: options.method,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch (error) {
      this.logger.error(`Squad API request failed: ${path}`, error);
      throw new ServiceUnavailableException('Unable to reach Squad API');
    }

    const payload = (await response.json().catch(() => ({
      status: response.status,
      success: false,
      message: response.statusText,
      data: {},
    }))) as SquadResponse<T>;

    if (!response.ok) {
      throw new HttpException(
        payload.message || 'Squad API request failed',
        payload.status || response.status,
      );
    }

    return payload;
  }

  private mapTransactionStatus(status?: string) {
    return status?.toLowerCase() === 'success' || status?.toLowerCase() === 'successful'
      ? 'successful'
      : status?.toLowerCase() === 'failed'
        ? 'failed'
        : 'pending';
  }

  private mapTransactionType(type?: string) {
    const normalized = type?.toLowerCase();

    if (normalized?.includes('transfer')) {
      return 'transfer';
    }

    if (normalized?.includes('virtual-account')) {
      return 'credit';
    }

    return 'credit';
  }
}
