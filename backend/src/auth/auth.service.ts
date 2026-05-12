import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { randomInt } from 'crypto';
import { OnboardingDto } from './dto/onboarding.dto';
import { SmsService } from '@/sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private smsService: SmsService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existingUser) {
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await argon2.hash(dto.password);
    const otpCode = randomInt(100000, 999999).toString();
    const otpHash = await argon2.hash(otpCode);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        password_hash: hashedPassword,
        otp_code: otpHash,
        otp_expires_at: otpExpiresAt,
      },
    });

    await this.smsService.sendOtp(user.phone, otpCode);

    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Registration successful. Check your phone for an OTP.',
      user: {
        id: user.id,
        phone: user.phone,
        onboardingComplete: user.onboarding_complete,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await argon2.verify(user.password_hash, dto.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, phone: user.phone, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        phone: user.phone,
        onboardingComplete: user.onboarding_complete,
      },
      token,
    };
  }

  async completeOnboarding(userId: string, dto: OnboardingDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        full_name: dto.fullName,
        state: dto.state,
        city: dto.city,
        latitude: dto.latitude,
        longitude: dto.longitude,
        role: ['user'],
        onboarding_complete: true,
      },
    });

    // Bootstrap the economic profile with default values on first onboarding
    await this.prisma.economicProfile.upsert({
      where: { user_id: userId },
      create: { user_id: userId },
      update: {},
    });

    return {
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        phone: user.phone,
        onboardingComplete: user.onboarding_complete,
      },
    };
  }

  async resendOtp(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (user) {
      const otpCode = randomInt(100000, 999999).toString();
      const otpHash = await argon2.hash(otpCode);
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { otp_code: otpHash, otp_expires_at: otpExpiresAt },
      });

      await this.smsService.sendOtp(user.phone, otpCode);
    }

    return { message: 'If this number is registered, an OTP has been sent.' };
  }

  async verifyOtp(phone: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user || !user.otp_code || !user.otp_expires_at || new Date() > user.otp_expires_at) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    const isOtpValid = await argon2.verify(user.otp_code, otp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otp_code: null,
        otp_expires_at: null,
        is_phone_verified: true,
      },
    });

    return { message: 'Verification successful' };
  }

  async forgotPassword(phone: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (user) {
      const otpCode = randomInt(100000, 999999).toString();
      const otpHash = await argon2.hash(otpCode);
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { otp_code: otpHash, otp_expires_at: otpExpiresAt },
      });

      await this.smsService.sendOtp(user.phone, otpCode);
    }

    return { message: 'If this number is registered, a reset OTP has been sent.' };
  }

  async resetPassword(phone: string, otp: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user || !user.otp_code || !user.otp_expires_at || new Date() > user.otp_expires_at) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const isOtpValid = await argon2.verify(user.otp_code, otp);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const hashedPassword = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword,
        otp_code: null,
        otp_expires_at: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }
}
