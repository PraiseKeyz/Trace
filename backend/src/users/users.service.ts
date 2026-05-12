import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import * as argon2 from 'argon2';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SafeUser, SafeUserSelect } from '@/common/constants/user-select.constant';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: SafeUserSelect,
    });
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<SafeUser> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.full_name !== undefined && { full_name: dto.full_name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.languages !== undefined && { languages: dto.languages }),
        ...(dto.preferred_language !== undefined && { preferred_language: dto.preferred_language }),
        ...(dto.data_sharing_consent !== undefined && { data_sharing_consent: dto.data_sharing_consent }),
      },
      select: SafeUserSelect,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    // Fetch the full user (needs password_hash) — this is the only place UsersService touches raw Prisma
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await argon2.verify(user.password_hash, dto.currentPassword);
    if (!isMatch) throw new UnauthorizedException('Current password is incorrect');

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const hashedPassword = await argon2.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password_hash: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }
}
