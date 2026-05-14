import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EconomicProfileService } from '@/economic-profile/economic-profile.service';

@Processor('score-recalculation')
export class ScoreRecalculationProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoreRecalculationProcessor.name);

  constructor(
    private readonly economicProfileService: EconomicProfileService,
  ) {
    super();
  }

  async process(job: Job<{ userId: string }>) {
    const { userId } = job.data;

    this.logger.log(`Processing score recalculation for user ${userId} (job ${job.id})`);

    try {
      const profile = await this.economicProfileService.recalculateScore(userId);
      this.logger.log(
        `Score recalculated for user ${userId}: identity_score=${profile.identity_score}, risk_tier=${profile.risk_tier}`,
      );
      return profile;
    } catch (error) {
      this.logger.error(`Failed to recalculate score for user ${userId}`, error);
      throw error; // Let BullMQ handle retries
    }
  }
}
