import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThan, LessThan } from 'typeorm';
import { Job } from '../../entities/job.entity';
import { JobStatusHistory } from '../../entities/job-status-history.entity';
import { JobAssignment } from '../../entities/job-assignment.entity';
import {
  JobStatus,
  JobAssignmentStatus,
  NotificationType,
} from '../../common/constants/user.enums';
import {
  CreateJobDto,
  UpdateJobDto,
  AcceptJobDto,
  RejectJobDto,
  JobQueryDto,
} from './dto/jobs.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(JobStatusHistory)
    private statusHistoryRepository: Repository<JobStatusHistory>,
    @InjectRepository(JobAssignment)
    private assignmentRepository: Repository<JobAssignment>,
    private notificationsService: NotificationsService,
    @InjectQueue('jobs-matching')
    private jobsMatchingQueue: Queue,
  ) {}

  async create(customerId: string, dto: CreateJobDto) {
    const job = this.jobRepository.create({
      customerId,
      serviceId: dto.serviceId,
      title: dto.title,
      description: dto.description,
      address: dto.address,
      latitude: dto.latitude,
      longitude: dto.longitude,
      location: `POINT(${dto.longitude} ${dto.latitude})`,
      estimatedPrice: dto.estimatedPrice,
      scheduledDate: dto.scheduledDate
        ? new Date(dto.scheduledDate)
        : undefined,
      scheduledTime: dto.scheduledTime,
      images: dto.images,
      notes: dto.notes,
      status: JobStatus.PENDING,
    });

    const savedJob = await this.jobRepository.save(job);

    await this.createStatusHistory(savedJob.id, JobStatus.PENDING, customerId);

    // Queue matching task
    await this.jobsMatchingQueue.add('match-providers', {
      jobId: savedJob.id,
      latitude: dto.latitude,
      longitude: dto.longitude,
      serviceId: dto.serviceId,
      radius: 10, // Initial 10km radius
    });

    return savedJob;
  }

  async findById(id: string) {
    const job = await this.jobRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'customer.customerProfile',
        'assignments',
        'assignments.provider',
        'assignments.provider.user',
        'statusHistory',
        'reviews',
        'payments',
      ],
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async findByCustomer(customerId: string, query: JobQueryDto) {
    const qb = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.customer', 'customer')
      .leftJoinAndSelect('job.assignments', 'assignments')
      .leftJoinAndSelect('assignments.provider', 'provider')
      .leftJoinAndSelect('provider.user', 'providerUser')
      .where('job.customerId = :customerId', { customerId });

    if (query.status) {
      qb.andWhere('job.status = :status', { status: query.status });
    }

    if (query.startDate) {
      qb.andWhere('job.createdAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      qb.andWhere('job.createdAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('job.createdAt', 'DESC');

    const [jobs, total] = await qb.getManyAndCount();

    return {
      data: jobs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByProvider(providerId: string, query: JobQueryDto) {
    const qb = this.jobRepository
      .createQueryBuilder('job')
      .innerJoin('job.assignments', 'assignment')
      .leftJoinAndSelect('job.customer', 'customer')
      .leftJoinAndSelect('assignment.provider', 'provider')
      .where('provider.userId = :providerId', { providerId });

    if (query.status) {
      qb.andWhere('job.status = :status', { status: query.status });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('job.createdAt', 'DESC');

    const [jobs, total] = await qb.getManyAndCount();

    return {
      data: jobs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(id: string, customerId: string, dto: UpdateJobDto) {
    const job = await this.findById(id);

    if (job.customerId !== customerId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    if (job.status !== JobStatus.PENDING) {
      throw new BadRequestException('Can only update pending jobs');
    }

    Object.assign(job, dto);
    return this.jobRepository.save(job);
  }

  async cancel(id: string, customerId: string, reason?: string) {
    const job = await this.findById(id);

    if (job.customerId !== customerId) {
      throw new ForbiddenException('You can only cancel your own jobs');
    }

    if (
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot cancel completed or already cancelled jobs',
      );
    }

    job.status = JobStatus.CANCELLED;
    job.cancelledAt = new Date();
    job.cancellationReason = reason || '';

    await this.jobRepository.save(job);
    await this.createStatusHistory(id, JobStatus.CANCELLED, customerId, reason);

    return job;
  }

  async acceptAssignment(providerId: string, dto: AcceptJobDto) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: dto.assignmentId },
      relations: ['job', 'provider'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.provider.userId !== providerId) {
      throw new ForbiddenException('You can only accept your own assignments');
    }

    if (assignment.status !== JobAssignmentStatus.PENDING) {
      throw new BadRequestException('Assignment is not pending');
    }

    assignment.status = JobAssignmentStatus.ACCEPTED;
    assignment.acceptedAt = new Date();
    if (dto.quotedPrice) {
      assignment.quotedPrice = dto.quotedPrice;
    }

    await this.assignmentRepository.save(assignment);

    const job = assignment.job;
    job.providerId = assignment.providerId;
    job.status = JobStatus.ASSIGNED;
    await this.jobRepository.save(job);

    await this.createStatusHistory(job.id, JobStatus.ASSIGNED, providerId);

    await this.notificationsService.create({
      userId: job.customerId,
      type: NotificationType.JOB_ASSIGNED,
      title: 'Job Assigned',
      message: `Your job has been accepted by a provider`,
      data: { jobId: job.id },
    });

    return assignment;
  }

  async rejectAssignment(
    providerId: string,
    assignmentId: string,
    dto: RejectJobDto,
  ) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id: assignmentId },
      relations: ['job', 'provider'],
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.provider.userId !== providerId) {
      throw new ForbiddenException('You can only reject your own assignments');
    }

    assignment.status = JobAssignmentStatus.REJECTED;
    assignment.rejectedAt = new Date();
    assignment.rejectionReason = dto.rejectionReason || '';

    return this.assignmentRepository.save(assignment);
  }

  async updateJobStatus(jobId: string, providerId: string, status: JobStatus) {
    const job = await this.findById(jobId);

    if (job.providerId !== providerId) {
      throw new ForbiddenException('You can only update jobs assigned to you');
    }

    job.status = status;
    if (status === JobStatus.COMPLETED) {
      job.completedAt = new Date();
    }

    await this.jobRepository.save(job);
    await this.createStatusHistory(jobId, status, providerId);

    return job;
  }

  async assignJob(jobId: string, providerId: string) {
    const job = await this.findById(jobId);

    if (job.status !== JobStatus.PENDING) {
      throw new BadRequestException('Job is not pending');
    }

    const existingAssignment = await this.assignmentRepository.findOne({
      where: { jobId, providerId },
    });

    if (existingAssignment) {
      throw new BadRequestException('Job already assigned to this provider');
    }

    const assignment = this.assignmentRepository.create({
      jobId,
      providerId,
      status: JobAssignmentStatus.PENDING,
    });

    await this.assignmentRepository.save(assignment);

    return assignment;
  }

  private async createStatusHistory(
    jobId: string,
    status: JobStatus,
    changedBy: string,
    notes?: string,
  ) {
    const history = this.statusHistoryRepository.create({
      jobId,
      status,
      changedBy,
      notes,
    });
    return this.statusHistoryRepository.save(history);
  }

  async getAvailableJobs(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ) {
    const jobs = await this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.customer', 'customer')
      .where('job.status = :status', { status: JobStatus.PENDING })
      .andWhere(
        `ST_DWithin(
          ST_SetSRID(ST_MakePoint(job.longitude, job.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius * 1000
        )`,
        { latitude, longitude, radius: radiusKm },
      )
      .orderBy('job.createdAt', 'DESC')
      .take(50)
      .setParameters({ latitude, longitude })
      .getMany();

    return jobs;
  }
}
