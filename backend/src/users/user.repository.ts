import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/opportunities/prisma/prisma.service';
import { SafeUser, SafeUserSelect } from '@/common/constants/user-select.constant';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: SafeUserSelect,
    });
  }

  async findByPhone(phone: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { phone },
      select: SafeUserSelect,
    });
  }

  async findAll(): Promise<SafeUser[]> {
    return this.prisma.user.findMany({
      select: SafeUserSelect,
    });
  }
}
