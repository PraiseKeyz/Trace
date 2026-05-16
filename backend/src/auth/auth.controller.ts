import { Controller, Post, Body, Res, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OnboardingDto } from './dto/onboarding.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle } from '@nestjs/throttler';
import type { RequestWithUser } from '@/common/interfaces/request-with-user.interface';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private get cookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN || undefined,
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    res.cookie('access_token', result.token, this.cookieOptions);
    return {
      message: result.message,
      data: { user: result.user },
    };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('access_token', result.token, this.cookieOptions);
    return {
      message: result.message,
      data: { user: result.user },
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const { maxAge: _maxAge, ...clearOptions } = this.cookieOptions;
    res.clearCookie('access_token', clearOptions);

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboard')
  async completeOnboarding(@Req() req: RequestWithUser, @Body() dto: OnboardingDto) {
    return this.authService.completeOnboarding(req.user.id, dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.phone);
  }


  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.phone);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.phone, dto.otp, dto.newPassword);
  }
}
