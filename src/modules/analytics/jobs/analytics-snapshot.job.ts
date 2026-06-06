import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AnalyticsSnapshotService } from '../services/analytics-snapshot.service';

@Processor('analytics-snapshot')
export class AnalyticsSnapshotJob {
  private readonly logger = new Logger(AnalyticsSnapshotJob.name);

  constructor(
    private readonly analyticsSnapshotService: AnalyticsSnapshotService,
  ) {}

  @Process('daily')
  async handleDailySnapshot(job: Job) {
    this.logger.log(`Processing daily snapshot job ${job.id}`);
    await this.analyticsSnapshotService.computeAndStore('daily');
    this.logger.log('Daily snapshot completed');
  }

  @Process('weekly')
  async handleWeeklySnapshot(job: Job) {
    this.logger.log(`Processing weekly snapshot job ${job.id}`);
    await this.analyticsSnapshotService.computeAndStore('weekly');
    this.logger.log('Weekly snapshot completed');
  }

  @Process('monthly')
  async handleMonthlySnapshot(job: Job) {
    this.logger.log(`Processing monthly snapshot job ${job.id}`);
    await this.analyticsSnapshotService.computeAndStore('monthly');
    this.logger.log('Monthly snapshot completed');
  }
}
