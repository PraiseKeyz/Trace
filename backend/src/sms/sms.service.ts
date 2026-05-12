import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: Twilio;
  private readonly isMockMode: boolean;

  constructor() {
    this.isMockMode = process.env.NODE_ENV !== 'production';

    if (!this.isMockMode) {
      this.twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      );
    }
  }

  async sendSms(to: string, body: string): Promise<boolean> {
    if (this.isMockMode) {
      this.logger.log(`\n\n=== [MOCK SMS] ===\nTo: ${to}\nMessage: ${body}\n==================\n`);
      return true;
    }

    try {
      await this.twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      this.logger.log(`SMS sent successfully to ${to}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send SMS to ${to}`, error.stack);
      return false;
    }
  }

  async sendOtp(to: string, otp: string): Promise<boolean> {
    const message = `Your Trace OTP code is: ${otp}. Do not share this code with anyone.`;
    return this.sendSms(to, message);
  }
}
