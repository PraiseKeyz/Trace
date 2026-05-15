import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EconomicProfileService } from '@/economic-profile/economic-profile.service';
import { SquadService } from './squad.service';

type JobData =
  | { userId: string }
  | { opportunityId: string };

@Processor('score-recalculation')
export class ScoreRecalculationProcessor extends WorkerHost {
  private readonly logger = new Logger(ScoreRecalculationProcessor.name);

  constructor(
    private readonly economicProfileService: EconomicProfileService,
    private readonly squadService: SquadService,
  ) {
    super();
  }

  async process(job: Job<JobData>) {
    if (job.name === 'auto-release-escrow') {
      const { opportunityId } = job.data as { opportunityId: string };
      this.logger.log(`Auto-releasing escrow for opportunity ${opportunityId} (job ${job.id})`);
      try {
        await this.squadService.autoReleaseEscrow(opportunityId);
        this.logger.log(`Escrow auto-released for opportunity ${opportunityId}`);
      } catch (error) {
        this.logger.error(`Auto-release failed for opportunity ${opportunityId}`, error);
        throw error;
      }
      return;
    }

    // Default: score recalculation
    const { userId } = job.data as { userId: string };
    this.logger.log(`Recalculating score for user ${userId} (job ${job.id})`);
    try {
      const profile = await this.economicProfileService.recalculateScore(userId);
      this.logger.log(
        `Score recalculated for user ${userId}: ${profile.identity_score} (${profile.risk_tier})`,
      );
      return profile;
    } catch (error) {
      this.logger.error(`Score recalculation failed for user ${userId}`, error);
      throw error;
    }
  }
}
