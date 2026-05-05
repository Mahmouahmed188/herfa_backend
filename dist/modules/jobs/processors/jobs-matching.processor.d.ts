import { type Job } from 'bull';
import { Repository } from 'typeorm';
import { ProviderLocation } from '../../../entities/provider-location.entity';
import { Job as JobEntity } from '../../../entities/job.entity';
import { JobAssignment } from '../../../entities/job-assignment.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { TrackingGateway } from '../../tracking/tracking.gateway';
export declare class JobsMatchingProcessor {
    private providerLocationRepository;
    private jobRepository;
    private assignmentRepository;
    private notificationsService;
    private trackingGateway;
    private readonly logger;
    constructor(providerLocationRepository: Repository<ProviderLocation>, jobRepository: Repository<JobEntity>, assignmentRepository: Repository<JobAssignment>, notificationsService: NotificationsService, trackingGateway: TrackingGateway);
    handleMatching(job: Job<any>): Promise<void>;
}
