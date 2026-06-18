import { Process, Processor } from '@nestjs/bull';
import { type Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderLocation } from '../../../entities/provider-location.entity';
import { Job as JobEntity } from '../../../entities/job.entity';
import { JobAssignment } from '../../../entities/job-assignment.entity';
import {
  JobAssignmentStatus,
  NotificationType,
} from '../../../common/constants/user.enums';
import { NotificationsService } from '../../notifications/notifications.service';
import { TrackingGateway } from '../../tracking/tracking.gateway';
import { Logger } from '@nestjs/common';

@Processor('jobs-matching')
export class JobsMatchingProcessor {
  private readonly logger = new Logger(JobsMatchingProcessor.name);

  constructor(
    @InjectRepository(ProviderLocation)
    private providerLocationRepository: Repository<ProviderLocation>,
    @InjectRepository(JobEntity)
    private jobRepository: Repository<JobEntity>,
    @InjectRepository(JobAssignment)
    private assignmentRepository: Repository<JobAssignment>,
    private notificationsService: NotificationsService,
    private trackingGateway: TrackingGateway,
  ) {}

  @Process('match-providers')
  async handleMatching(job: Job<any>) {
    const { jobId, latitude, longitude, serviceId, radius } = job.data;
    this.logger.log(`Matching providers for job ${jobId} within ${radius}km`);

    // 1. Find providers within radius who are online and offer the service
    // Using PostGIS ST_DWithin for high-performance spatial filtering
    const providers = await this.providerLocationRepository
      .createQueryBuilder('pl')
      .innerJoinAndSelect('pl.provider', 'profile')
      .innerJoinAndSelect('profile.services', 'ps')
      .where('pl.isOnline = :isOnline', { isOnline: true })
      .andWhere('pl.isOnJob = :isOnJob', { isOnJob: false })
      .andWhere('ps.serviceId = :serviceId', { serviceId })
      .andWhere(
        `ST_DWithin(
          pl.location,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius * 1000
        )`,
        { longitude, latitude, radius },
      )
      .getMany();

    if (providers.length === 0) {
      this.logger.warn(
        `No providers found for job ${jobId} in ${radius}km radius`,
      );
      // Optional: Logic to re-queue with larger radius after some delay
      return;
    }

    this.logger.log(
      `Found ${providers.length} matching providers for job ${jobId}`,
    );

    for (const pl of providers) {
      // 2. Create Job Assignment for each candidate
      const assignment = this.assignmentRepository.create({
        jobId,
        providerId: pl.providerId,
        status: JobAssignmentStatus.PENDING,
      });
      await this.assignmentRepository.save(assignment);

      // 3. Notify provider via WebSocket (TrackingGateway)
      this.trackingGateway.emitToUser(pl.provider.userId, 'newJobAvailable', {
        jobId,
        distance: pl['distance'], // ST_Distance could be added to query if needed
      });

      // 4. Send Push Notification
      await this.notificationsService.create({
        userId: pl.provider.userId,
        type: NotificationType.JOB_CREATED,
        title: 'New Job Opportunity!',
        message: 'A new service request is available in your area.',
        data: { jobId },
      });
    }
  }
}
