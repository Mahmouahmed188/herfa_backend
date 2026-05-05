import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from '../../entities/job.entity';
import { JobStatusHistory } from '../../entities/job-status-history.entity';
import { JobAssignment } from '../../entities/job-assignment.entity';
import { ProviderLocation } from '../../entities/provider-location.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrackingModule } from '../tracking/tracking.module';
import { JobsMatchingProcessor } from './processors/jobs-matching.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobStatusHistory, JobAssignment, ProviderLocation]),
    BullModule.registerQueue({
      name: 'jobs-matching',
    }),
    forwardRef(() => NotificationsModule),
    TrackingModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsMatchingProcessor],
  exports: [JobsService],
})
export class JobsModule {}