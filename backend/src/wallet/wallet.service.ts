import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { SquadService } from '@/squad/squad.service';
import { WithdrawDto } from './dto/withdraw.dto';
import { DepositDto } from './dto/deposit.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly squadService: SquadService,
  ) {}

  // Cast until `pnpm prisma generate` is run with the new Wallet model in schema
  private get walletClient() {
    return (this.prisma as any).wallet;
  }

  async getOrCreateWallet(userId: string) {
    return this.walletClient.upsert({
      where: { user_id: userId },
      create: { user_id: userId, balance: 0, currency: 'NGN' },
      update: {},
    });
  }

  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: Number(wallet.balance),
      currency: wallet.currency,
      updated_at: wallet.updated_at,
    };
  }

  async initiateDeposit(userId: string, dto: DepositDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const email = user.email ?? `${user.phone.replace(/\D/g, '')}@trace.ng`;
    const name = user.full_name ?? user.phone;
    const frontendUrl = process.env.FRONTEND_URL?.split(',')[0]?.trim() ?? 'http://localhost:3001';

    const response = await this.squadService.initiatePayment({
      email,
      amount: dto.amount * 100,           // naira → kobo at the API boundary
      initiate_type: 'inline',
      currency: 'NGN',
      customer_name: name,
      callback_url: `${frontendUrl}/dashboard/payment/callback`,
      payment_channels: ['card', 'bank', 'ussd', 'transfer'],
      metadata: {
        user_id: userId,
        category: 'wallet_deposit',
        amount_naira: dto.amount,
      },
    });

    const data = response.data as any;

    return {
      checkout_url: data?.checkout_url as string,
      transaction_ref: data?.transaction_ref as string,
      amount: dto.amount,
    };
  }

  async withdraw(userId: string, dto: WithdrawDto) {
    const wallet = await this.getOrCreateWallet(userId);
    const balance = Number(wallet.balance);

    if (dto.amount > balance) {
      throw new BadRequestException(
        `Insufficient wallet balance. Available: ₦${balance.toLocaleString()}`,
      );
    }

    const transferRef = `TRC_WD_${randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;

    // Debit wallet first (optimistic debit to prevent double-spend)
    await this.walletClient.update({
      where: { user_id: userId },
      data: { balance: { decrement: dto.amount } },
    });

    try {
      await this.squadService.transfer({
        transaction_reference: transferRef,
        amount: String(dto.amount * 100), // kobo
        bank_code: dto.bank_code,
        account_number: dto.account_number,
        account_name: dto.account_name,
        currency_id: 'NGN',
        remark: dto.remark ?? 'Wallet withdrawal via Trace',
      });
    } catch (err) {
      // Reverse the debit if Squad transfer fails
      await this.walletClient.update({
        where: { user_id: userId },
        data: { balance: { increment: dto.amount } },
      });
      this.logger.error(`Withdrawal transfer failed for user ${userId}`, err);
      throw err;
    }

    // Record the withdrawal transaction
    await this.prisma.transaction.create({
      data: {
        user_id: userId,
        squad_reference: transferRef,
        type: 'withdrawal',
        category: 'wallet_withdrawal',
        amount: dto.amount,
        currency: 'NGN',
        status: 'successful',
        metadata: {
          bank_code: dto.bank_code,
          account_number: dto.account_number,
          account_name: dto.account_name,
          remark: dto.remark,
        } as any,
      },
    });

    return {
      message: 'Withdrawal successful',
      transfer_reference: transferRef,
      amount: dto.amount,
      new_balance: balance - dto.amount,
    };
  }
}
