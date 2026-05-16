import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { CreateVirtualAccountDto } from './dto/create-virtual-account.dto';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { LookupAccountDto } from './dto/lookup-account.dto';
import { TransferDto } from './dto/transfer.dto';
import { RequeryTransferDto } from './dto/requery-transfer.dto';
import { ListTransfersDto } from './dto/list-transfers.dto';
import { RefundDto } from './dto/refund.dto';
import { QueryVaTransactionsDto } from './dto/query-va-transactions.dto';

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
  private readonly merchantId?: string;
  private readonly banks: Bank[];

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @InjectQueue('score-recalculation') private readonly scoreQueue: Queue,
  ) {
    this.baseUrl =
      this.configService.get<string>('SQUAD_BASE_URL') ??
      'https://sandbox-api-d.squadco.com';
    this.secretKey = this.configService.get<string>('SQUAD_SECRET_KEY');
    this.merchantId = this.configService.get<string>('SQUAD_MERCHANT_ID');
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


  async verifyTransaction(transactionRef: string) {
    return this.request(`/transaction/verify/${transactionRef}`, {
      method: 'GET',
    });
  }


  async getWalletBalance(currencyId: string = 'NGN') {
    return this.request(`/merchant/balance?currency_id=${currencyId}`, {
      method: 'GET',
    });
  }


  async refund(dto: RefundDto) {
    return this.request('/transaction/refund', {
      method: 'POST',
      body: dto,
    });
  }

  async queryVaTransactionsByCustomer(customerIdentifier: string) {
    return this.request(
      `/virtual-account/customer/transactions/${customerIdentifier}`,
      { method: 'GET' },
    );
  }

  async queryAllMerchantTransactions(query: QueryVaTransactionsDto) {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.perPage) params.set('perPage', String(query.perPage));
    if (query.virtualAccount) params.set('virtualAccount', query.virtualAccount);
    if (query.customerIdentifier) params.set('customerIdentifier', query.customerIdentifier);
    if (query.startDate) params.set('startDate', query.startDate);
    if (query.endDate) params.set('endDate', query.endDate);
    if (query.transactionReference) params.set('transactionReference', query.transactionReference);
    if (query.session_id) params.set('session_id', query.session_id);
    if (query.dir) params.set('dir', query.dir);

    return this.request(
      `/virtual-account/merchant/transactions?${params.toString()}`,
      { method: 'GET' },
    );
  }



  async getCustomerByVirtualAccount(virtualAccountNumber: string) {
    return this.request(
      `/virtual-account/customer/${virtualAccountNumber}`,
      { method: 'GET' },
    );
  }

  async getCustomerByIdentifier(customerIdentifier: string) {
    return this.request(
      `/virtual-account/${customerIdentifier}`,
      { method: 'GET' },
    );
  }


  async lockEscrow(opportunityId: string, employerId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { poster: true },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.posted_by !== employerId) {
      throw new BadRequestException('Only the employer who posted this gig can lock escrow');
    }

    if (!opportunity.selected_applicant) {
      throw new BadRequestException('No applicant selected for this opportunity');
    }

    if (opportunity.escrow_reference) {
      throw new BadRequestException('Escrow already locked for this opportunity');
    }

    const amount = Number(opportunity.escrow_amount ?? opportunity.pay_max ?? opportunity.pay_min ?? 0);
    if (amount <= 0) {
      throw new BadRequestException('Opportunity has no valid pay amount for escrow');
    }

    const paymentResponse = await this.initiatePayment({
      email: opportunity.poster.email ?? `${opportunity.poster.phone}@trace.ng`,
      amount: amount * 100, // Squad expects kobo
      initiate_type: 'inline',
      currency: 'NGN',
      customer_name: opportunity.poster.full_name ?? 'Trace Employer',
      callback_url: this.configService.get<string>('SQUAD_CALLBACK_URL') ?? 'https://trace.ng/callback',
      metadata: {
        type: 'escrow_lock',
        opportunity_id: opportunityId,
        employer_id: employerId,
        worker_id: opportunity.selected_applicant,
        user_id: employerId,
      },
    });

    const escrowRef = (paymentResponse.data as any)?.transaction_ref
      ?? `ESCROW_${this.merchantId ?? 'TRC'}_${randomUUID()}`;

    // Update opportunity with escrow reference
    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        escrow_reference: escrowRef,
        status: 'in_progress',
      },
    });

    // Record the escrow lock transaction
    await this.prisma.transaction.create({
      data: {
        user_id: employerId,
        counterparty_id: opportunity.selected_applicant,
        squad_reference: escrowRef,
        type: 'escrow_lock',
        category: 'gig_escrow',
        amount,
        currency: opportunity.currency,
        status: 'pending',
        metadata: {
          opportunity_id: opportunityId,
          opportunity_title: opportunity.title,
        } as any,
      },
    });

    return {
      message: 'Escrow locked successfully',
      escrow_reference: escrowRef,
      amount,
      checkout_url: (paymentResponse.data as any)?.checkout_url,
    };
  }

  async releaseEscrow(opportunityId: string, employerId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { selected: true },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.posted_by !== employerId) {
      throw new BadRequestException('Only the employer can release escrow');
    }

    if (!opportunity.escrow_reference) {
      throw new BadRequestException('No escrow to release for this opportunity');
    }

    if (!opportunity.selected_applicant || !opportunity.selected) {
      throw new BadRequestException('No worker assigned to this opportunity');
    }

    const worker = opportunity.selected;

    // Verify the escrow payment was successful before releasing
    const verification = await this.verifyTransaction(opportunity.escrow_reference);
    const txStatus = (verification.data as any)?.transaction_status;
    if (txStatus !== 'Success' && txStatus !== 'success') {
      throw new BadRequestException(
        `Cannot release escrow: payment status is '${txStatus}'. Must be successful.`,
      );
    }

    const amount = Number(opportunity.pay_max ?? opportunity.pay_min ?? 0);
    const transferRef = `${this.merchantId ?? 'TRC'}_REL_${randomUUID()}`;

    // Check wallet balance before releasing
    const balanceResponse = await this.getWalletBalance();
    const balanceKobo = Number((balanceResponse.data as any)?.balance ?? 0);
    if (balanceKobo < amount * 100) {
      throw new BadRequestException('Insufficient wallet balance to release escrow');
    }

    // If worker has a virtual account, we can look it up; otherwise transfer to their bank
    if (worker.virtual_account_no) {

      await this.transfer({
        transaction_reference: transferRef,
        amount: String(amount * 100),
        bank_code: '058',
        account_number: worker.virtual_account_no,
        account_name: worker.full_name ?? 'Trace Worker',
        currency_id: 'NGN',
        remark: `Escrow release for: ${opportunity.title}`,
      });
    }

    // Update opportunity status
    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: 'completed' },
    });

    // Update the escrow transaction record
    await this.prisma.transaction.updateMany({
      where: { squad_reference: opportunity.escrow_reference },
      data: { status: 'successful' },
    });

    // Record the release as a credit to the worker
    await this.prisma.transaction.create({
      data: {
        user_id: opportunity.selected_applicant,
        counterparty_id: employerId,
        squad_reference: transferRef,
        type: 'escrow_release',
        category: 'gig_payment',
        amount,
        currency: opportunity.currency,
        status: 'successful',
        metadata: {
          opportunity_id: opportunityId,
          opportunity_title: opportunity.title,
        } as any,
      },
    });

    // Update worker's economic profile and trigger score recalculation
    await this.prisma.economicProfile.upsert({
      where: { user_id: opportunity.selected_applicant },
      create: {
        user_id: opportunity.selected_applicant,
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

    // Queue score recalculation via BullMQ (Gap #8)
    await this.scoreQueue.add('recalculate-score', {
      userId: opportunity.selected_applicant,
    });

    return {
      message: 'Escrow released — worker has been paid',
      transfer_reference: transferRef,
      amount,
      worker_id: opportunity.selected_applicant,
    };
  }


  async autoReleaseEscrow(opportunityId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { selected: true },
    });

    if (!opportunity) return;
    if (!['worker_done', 'filled'].includes(opportunity.status)) return; // already handled

    const worker = opportunity.selected;
    const amount = Number(opportunity.escrow_amount ?? opportunity.pay_max ?? opportunity.pay_min ?? 0);

    if (amount > 0 && worker?.virtual_account_no) {
      const transferRef = `${this.merchantId ?? 'TRC'}_AUTO_${randomUUID()}`;
      try {
        await this.transfer({
          transaction_reference: transferRef,
          amount: String(amount * 100),
          bank_code: '058',
          account_number: worker.virtual_account_no,
          account_name: worker.full_name ?? 'Trace Worker',
          currency_id: 'NGN',
          remark: `Auto-release for: ${opportunity.title}`,
        });

        await this.prisma.transaction.create({
          data: {
            user_id: opportunity.selected_applicant!,
            counterparty_id: opportunity.posted_by,
            squad_reference: transferRef,
            type: 'escrow_release',
            category: 'gig_payment',
            amount,
            currency: opportunity.currency,
            status: 'successful',
            metadata: { opportunity_id: opportunityId, opportunity_title: opportunity.title } as any,
          },
        });

        await this.prisma.economicProfile.upsert({
          where: { user_id: opportunity.selected_applicant! },
          create: {
            user_id: opportunity.selected_applicant!,
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

        await this.scoreQueue.add('recalculate-score', { userId: opportunity.selected_applicant });
      } catch (err) {
        this.logger.error(`Auto-release transfer failed for opportunity ${opportunityId}`, err);
      }
    }

    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: 'confirmed' },
    });

    await this.prisma.transaction.updateMany({
      where: { squad_reference: opportunity.escrow_reference ?? undefined },
      data: { status: 'successful' },
    });

    this.logger.log(`Escrow auto-released for opportunity ${opportunityId}`);
  }

  async cancelEscrow(opportunityId: string, userId: string, reason: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.posted_by !== userId) {
      throw new BadRequestException('Only the employer can cancel escrow');
    }

    if (!opportunity.escrow_reference) {
      throw new BadRequestException('No escrow to cancel for this opportunity');
    }

    const amount = Number(opportunity.pay_max ?? opportunity.pay_min ?? 0);

    // Refund via Squad
    await this.refund({
      gateway_transaction_ref: opportunity.escrow_reference,
      transaction_ref: opportunity.escrow_reference,
      refund_amount: amount * 100, // kobo
      refund_type: 'full',
      reason_for_refund: reason || 'Gig cancelled',
    });

    // Update opportunity
    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: {
        status: 'cancelled',
        escrow_reference: null,
      },
    });

    // Update escrow transaction
    await this.prisma.transaction.updateMany({
      where: { squad_reference: opportunity.escrow_reference },
      data: { status: 'refunded' },
    });

    return {
      message: 'Escrow cancelled and refund initiated',
      opportunity_id: opportunityId,
    };
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
    this.logger.log(`[Webhook] Incoming payload: ${JSON.stringify(payload)}`);

    if (!this.verifyWebhookSignature(payload, encryptedBody)) {
      this.logger.warn('[Webhook] Signature verification FAILED — request rejected');
      throw new BadRequestException('Invalid Squad webhook signature');
    }

    this.logger.log('[Webhook] Signature verified ✓ — processing asynchronously');

    void this.recordWebhookTransaction(payload).catch((error) => {
      this.logger.error('[Webhook] recordWebhookTransaction threw an error', error);
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

    this.logger.log(`[Webhook] Processing reference: ${reference}`);

    if (!reference) {
      this.logger.warn('[Webhook] Skipped — no transaction reference in payload');
      return;
    }

    const metadata = body?.meta ?? body?.metadata ?? {};
    const userId = metadata.user_id ?? metadata.userId;

    if (!userId) {
      this.logger.warn(`[Webhook] Skipped ref=${reference} — metadata.user_id is missing`);
      return;
    }

    // Signature already verified — trust the webhook payload directly
    const status = this.mapTransactionStatus(body?.transaction_status);
    const amount = Number(body?.amount ?? body?.principal_amount ?? 0) / 100;

    this.logger.log(`[Webhook] payload status=${body?.transaction_status} amount=₦${amount} ref=${reference}`);

    const existingTransaction = await this.prisma.transaction.findUnique({
      where: { squad_reference: reference },
    });

    if (existingTransaction?.status === 'successful') {
      this.logger.warn(`[Webhook] ref=${reference} already credited — skipping to prevent double credit`);
      return;
    }

    const tx = await this.prisma.transaction.upsert({
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
      update: { status, metadata: payload },
    });

    this.logger.log(`[Webhook] Transaction upserted — id=${tx.id} status=${status} amount=₦${amount}`);

    if (status === 'successful') {
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

      await (this.prisma as any).wallet.upsert({
        where: { user_id: userId },
        create: { user_id: userId, balance: amount, currency: 'NGN' },
        update: { balance: { increment: amount } },
      });

      this.logger.log(`[Webhook] ✓ Wallet credited ₦${amount} for user=${userId} ref=${reference}`);

      await this.scoreQueue.add('recalculate-score', { userId });
    } else {
      this.logger.log(`[Webhook] Status='${status}' — wallet not credited for ref=${reference}`);
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
      this.logger.error(
        `Squad API ${options.method} ${path} → HTTP ${response.status}: ${JSON.stringify(payload)}`,
      );
      if (response.status === 401 || response.status === 403) {
        throw new HttpException(
          'Squad API authentication failed. Check SQUAD_SECRET_KEY in your environment.',
          502,
        );
      }
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
