import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { SquadService } from './squad.service';

@SkipThrottle()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly squadService: SquadService) {}

  @Post('squad')
  @HttpCode(200)
  handleSquadWebhook(
    @Body() payload: unknown,
    @Headers('x-squad-encrypted-body') encryptedBody?: string,
  ) {
    return this.squadService.processWebhook(payload, encryptedBody);
  }
}
