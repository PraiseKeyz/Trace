import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import axios from 'axios';

type SmsProvider = 'mock' | 'twilio' | 'textbelt';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly provider: SmsProvider;
  private twilioClient: Twilio;

  constructor() {
    this.provider = this.resolveProvider();

    if (this.provider === 'twilio') {
      this.twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    }

    this.logger.log(`SMS provider: ${this.provider}`);
  }

  private resolveProvider(): SmsProvider {
    const env = process.env.SMS_PROVIDER?.toLowerCase();
    if (env === 'twilio' || env === 'textbelt' || env === 'mock') return env;
    // Fallback: mock in dev, twilio in prod
    return process.env.NODE_ENV === 'production' ? 'twilio' : 'mock';
  }

  private formatPhone(raw: string): string {
    const phone = raw.trim();
    if (phone.startsWith('0')) return '+234' + phone.slice(1);
    if (!phone.startsWith('+')) return '+' + phone;
    return phone;
  }

  async sendSms(to: string, body: string): Promise<boolean> {
    const phone = this.formatPhone(to);

    switch (this.provider) {
      case 'mock':
        return this.sendMock(phone, body);
      case 'twilio':
        return this.sendTwilio(phone, body);
      case 'textbelt':
        return this.sendTextbelt(phone, body);
    }
  }

  async sendOtp(to: string, otp: string): Promise<boolean> {
    const message = `Your Trace OTP code is: ${otp}. Do not share this code with anyone.`;
    return this.sendSms(to, message);
  }

  // ── Providers ──────────────────────────────────────────────────────────────

  private sendMock(phone: string, body: string): boolean {
    this.logger.log(
      `\n\n=== [MOCK SMS] ===\nTo: ${phone}\nMessage: ${body}\n==================\n`,
    );
    return true;
  }

  private async sendTwilio(phone: string, body: string): Promise<boolean> {
    try {
      await this.twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      this.logger.log(`[Twilio] SMS sent to ${phone}`);
      return true;
    } catch (error: any) {
      this.logger.error(`[Twilio] Failed to send to ${phone}`, error.stack);
      return false;
    }
  }

  private async sendTextbelt(phone: string, body: string): Promise<boolean> {
    try {
      const { data } = await axios.post('https://textbelt.com/text', {
        phone,
        message: body,
        key: process.env.TEXTBELT_API_KEY ?? 'textbelt',
      });

      if (data.success) {
        this.logger.log(`[Textbelt] SMS sent to ${phone} (quota left: ${data.quotaRemaining})`);
        return true;
      }

      this.logger.warn(`[Textbelt] Send failed to ${phone}: ${data.error}`);
      return false;
    } catch (error: any) {
      this.logger.error(`[Textbelt] Request failed to ${phone}`, error.message);
      return false;
    }
  }
}
