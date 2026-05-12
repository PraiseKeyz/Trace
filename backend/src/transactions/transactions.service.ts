import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { EconomicProfileService } from '@/economic-profile/economic-profile.service';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly economicProfileService: EconomicProfileService,
  ) { }

  async create(userId: string, dto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        user_id: userId,
        counterparty_id: dto.counterparty_id,
        squad_reference: dto.squad_reference,
        type: dto.type,
        category: dto.category,
        amount: dto.amount,
        currency: dto.currency || 'NGN',
        status: dto.status || 'pending',
        metadata: dto.metadata,
      },
    });

    if (transaction.status === 'successful') {
      await this.updateEconomicStats(userId, transaction.amount);
    }

    return transaction;
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { user_id: userId },
          { counterparty_id: userId },
        ],
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.transaction.findFirst({
      where: {
        id,
        OR: [
          { user_id: userId },
          { counterparty_id: userId },
        ],
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: { status },
    });

    if (status === 'successful') {
      await this.updateEconomicStats(transaction.user_id, transaction.amount);
    }

    return transaction;
  }

  private async updateEconomicStats(userId: string, amount: any) {
    // Update basic stats in EconomicProfile
    await this.prisma.economicProfile.update({
      where: { user_id: userId },
      data: {
        total_transaction_volume: { increment: amount },
        total_transaction_count: { increment: 1 },
        last_transaction_at: new Date(),
      },
    });

    // Trigger score recalculation via gRPC
    await this.economicProfileService.recalculateScore(userId);
  }
}
