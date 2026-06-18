import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { AlertService } from '../services/alert.service';

@Processor('alert-detection')
export class AlertDetectionJob {
  private readonly logger = new Logger(AlertDetectionJob.name);

  constructor(private readonly alertService: AlertService) {}

  @Process('check')
  async handleAlertCheck(job: Job) {
    this.logger.log(`Processing alert detection job ${job.id}`);
    const alerts = await this.alertService.check();

    if (alerts.length > 0) {
      this.logger.warn(`Detected ${alerts.length} operational alert(s):`);
      for (const alert of alerts) {
        this.logger.warn(
          `[${alert.severity}] ${alert.alertType}: ${alert.message}`,
        );
      }
    } else {
      this.logger.log('No operational alerts detected');
    }
  }
}
