import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { CreateVouchDto } from './dto/create-vouch.dto';

function calculateWeight(txCount: number): number {
  if (txCount >= 6) return 5;
  if (txCount >= 3) return 3;
  if (txCount >= 1) return 2;
  return 1;
}

@Injectable()
export class VouchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(voucherId: string, dto: CreateVouchDto) {
    if (voucherId === dto.recipient_id) {
      throw new BadRequestException('You cannot vouch for yourself');
    }

    const recipient = await this.prisma.user.findUnique({
      where: { id: dto.recipient_id },
      select: { id: true, full_name: true },
    });
    if (!recipient) throw new NotFoundException('User not found');

    // Weight is determined by successful transactions between the two users
    const txCount = await this.prisma.transaction.count({
      where: {
        OR: [
          { user_id: voucherId, counterparty_id: dto.recipient_id },
          { user_id: dto.recipient_id, counterparty_id: voucherId },
        ],
        status: 'successful',
      },
    });

    const weight = calculateWeight(txCount);

    let vouch: Awaited<ReturnType<typeof this.prisma.vouch.create>>;
    try {
      vouch = await this.prisma.vouch.create({
        data: {
          voucher_id: voucherId,
          recipient_id: dto.recipient_id,
          message: dto.message,
          weight,
        },
        include: {
          voucher: { select: { id: true, full_name: true, phone: true } },
          recipient: { select: { id: true, full_name: true, phone: true } },
        },
      });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new ConflictException('You have already vouched for this person');
      }
      throw err;
    }

    await this.prisma.economicProfile.update({
      where: { user_id: dto.recipient_id },
      data: { vouch_count: { increment: 1 } },
    });

    // TODO: trigger AI engine score recalculation via gRPC
    // await this.grpcClient.emit('score_recalculate', { user_id: dto.recipient_id })

    return vouch;
  }

  async getReceived(userId: string) {
    return this.prisma.vouch.findMany({
      where: { recipient_id: userId },
      include: {
        voucher: { select: { id: true, full_name: true, phone: true, persona: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getGiven(userId: string) {
    return this.prisma.vouch.findMany({
      where: { voucher_id: userId },
      include: {
        recipient: { select: { id: true, full_name: true, phone: true, persona: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async remove(vouchId: string, voucherId: string) {
    const vouch = await this.prisma.vouch.findUnique({ where: { id: vouchId } });
    if (!vouch) throw new NotFoundException('Vouch not found');
    if (vouch.voucher_id !== voucherId) throw new ForbiddenException('Not your vouch');

    await this.prisma.vouch.delete({ where: { id: vouchId } });

    await this.prisma.economicProfile.update({
      where: { user_id: vouch.recipient_id },
      data: { vouch_count: { decrement: 1 } },
    });

    // TODO: trigger AI engine score recalculation via gRPC
    // await this.grpcClient.emit('score_recalculate', { user_id: vouch.recipient_id })

    return { message: 'Vouch removed successfully' };
  }
}
