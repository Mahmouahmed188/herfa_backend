"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("../../entities/job.entity");
const job_status_history_entity_1 = require("../../entities/job-status-history.entity");
const job_assignment_entity_1 = require("../../entities/job-assignment.entity");
const user_enums_1 = require("../../common/constants/user.enums");
const notifications_service_1 = require("../notifications/notifications.service");
const bull_1 = require("@nestjs/bull");
let JobsService = class JobsService {
    jobRepository;
    statusHistoryRepository;
    assignmentRepository;
    notificationsService;
    jobsMatchingQueue;
    constructor(jobRepository, statusHistoryRepository, assignmentRepository, notificationsService, jobsMatchingQueue) {
        this.jobRepository = jobRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.assignmentRepository = assignmentRepository;
        this.notificationsService = notificationsService;
        this.jobsMatchingQueue = jobsMatchingQueue;
    }
    async create(customerId, dto) {
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
            scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined,
            scheduledTime: dto.scheduledTime,
            images: dto.images,
            notes: dto.notes,
            status: user_enums_1.JobStatus.PENDING,
        });
        const savedJob = await this.jobRepository.save(job);
        await this.createStatusHistory(savedJob.id, user_enums_1.JobStatus.PENDING, customerId);
        await this.jobsMatchingQueue.add('match-providers', {
            jobId: savedJob.id,
            latitude: dto.latitude,
            longitude: dto.longitude,
            serviceId: dto.serviceId,
            radius: 10,
        });
        return savedJob;
    }
    async findById(id) {
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
            throw new common_1.NotFoundException('Job not found');
        }
        return job;
    }
    async findByCustomer(customerId, query) {
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
            qb.andWhere('job.createdAt >= :startDate', { startDate: new Date(query.startDate) });
        }
        if (query.endDate) {
            qb.andWhere('job.createdAt <= :endDate', { endDate: new Date(query.endDate) });
        }
        const page = query.page || 1;
        const limit = query.limit || 20;
        qb.skip((page - 1) * limit).take(limit).orderBy('job.createdAt', 'DESC');
        const [jobs, total] = await qb.getManyAndCount();
        return {
            data: jobs,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findByProvider(providerId, query) {
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
        qb.skip((page - 1) * limit).take(limit).orderBy('job.createdAt', 'DESC');
        const [jobs, total] = await qb.getManyAndCount();
        return {
            data: jobs,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async update(id, customerId, dto) {
        const job = await this.findById(id);
        if (job.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only update your own jobs');
        }
        if (job.status !== user_enums_1.JobStatus.PENDING) {
            throw new common_1.BadRequestException('Can only update pending jobs');
        }
        Object.assign(job, dto);
        return this.jobRepository.save(job);
    }
    async cancel(id, customerId, reason) {
        const job = await this.findById(id);
        if (job.customerId !== customerId) {
            throw new common_1.ForbiddenException('You can only cancel your own jobs');
        }
        if (job.status === user_enums_1.JobStatus.COMPLETED || job.status === user_enums_1.JobStatus.CANCELLED) {
            throw new common_1.BadRequestException('Cannot cancel completed or already cancelled jobs');
        }
        job.status = user_enums_1.JobStatus.CANCELLED;
        job.cancelledAt = new Date();
        job.cancellationReason = reason || '';
        await this.jobRepository.save(job);
        await this.createStatusHistory(id, user_enums_1.JobStatus.CANCELLED, customerId, reason);
        return job;
    }
    async acceptAssignment(providerId, dto) {
        const assignment = await this.assignmentRepository.findOne({
            where: { id: dto.assignmentId },
            relations: ['job', 'provider'],
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (assignment.provider.userId !== providerId) {
            throw new common_1.ForbiddenException('You can only accept your own assignments');
        }
        if (assignment.status !== user_enums_1.JobAssignmentStatus.PENDING) {
            throw new common_1.BadRequestException('Assignment is not pending');
        }
        assignment.status = user_enums_1.JobAssignmentStatus.ACCEPTED;
        assignment.acceptedAt = new Date();
        if (dto.quotedPrice) {
            assignment.quotedPrice = dto.quotedPrice;
        }
        await this.assignmentRepository.save(assignment);
        const job = assignment.job;
        job.providerId = assignment.providerId;
        job.status = user_enums_1.JobStatus.ASSIGNED;
        await this.jobRepository.save(job);
        await this.createStatusHistory(job.id, user_enums_1.JobStatus.ASSIGNED, providerId);
        await this.notificationsService.create({
            userId: job.customerId,
            type: user_enums_1.NotificationType.JOB_ASSIGNED,
            title: 'Job Assigned',
            message: `Your job has been accepted by a provider`,
            data: { jobId: job.id },
        });
        return assignment;
    }
    async rejectAssignment(providerId, assignmentId, dto) {
        const assignment = await this.assignmentRepository.findOne({
            where: { id: assignmentId },
            relations: ['job', 'provider'],
        });
        if (!assignment) {
            throw new common_1.NotFoundException('Assignment not found');
        }
        if (assignment.provider.userId !== providerId) {
            throw new common_1.ForbiddenException('You can only reject your own assignments');
        }
        assignment.status = user_enums_1.JobAssignmentStatus.REJECTED;
        assignment.rejectedAt = new Date();
        assignment.rejectionReason = dto.rejectionReason || '';
        return this.assignmentRepository.save(assignment);
    }
    async updateJobStatus(jobId, providerId, status) {
        const job = await this.findById(jobId);
        if (job.providerId !== providerId) {
            throw new common_1.ForbiddenException('You can only update jobs assigned to you');
        }
        job.status = status;
        if (status === user_enums_1.JobStatus.COMPLETED) {
            job.completedAt = new Date();
        }
        await this.jobRepository.save(job);
        await this.createStatusHistory(jobId, status, providerId);
        return job;
    }
    async assignJob(jobId, providerId) {
        const job = await this.findById(jobId);
        if (job.status !== user_enums_1.JobStatus.PENDING) {
            throw new common_1.BadRequestException('Job is not pending');
        }
        const existingAssignment = await this.assignmentRepository.findOne({
            where: { jobId, providerId },
        });
        if (existingAssignment) {
            throw new common_1.BadRequestException('Job already assigned to this provider');
        }
        const assignment = this.assignmentRepository.create({
            jobId,
            providerId,
            status: user_enums_1.JobAssignmentStatus.PENDING,
        });
        await this.assignmentRepository.save(assignment);
        return assignment;
    }
    async createStatusHistory(jobId, status, changedBy, notes) {
        const history = this.statusHistoryRepository.create({
            jobId,
            status,
            changedBy,
            notes,
        });
        return this.statusHistoryRepository.save(history);
    }
    async getAvailableJobs(latitude, longitude, radiusKm = 50) {
        const jobs = await this.jobRepository
            .createQueryBuilder('job')
            .leftJoinAndSelect('job.customer', 'customer')
            .where('job.status = :status', { status: user_enums_1.JobStatus.PENDING })
            .andWhere(`ST_DWithin(
          ST_SetSRID(ST_MakePoint(job.longitude, job.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius * 1000
        )`, { latitude, longitude, radius: radiusKm })
            .orderBy('job.createdAt', 'DESC')
            .take(50)
            .setParameters({ latitude, longitude })
            .getMany();
        return jobs;
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(1, (0, typeorm_1.InjectRepository)(job_status_history_entity_1.JobStatusHistory)),
    __param(2, (0, typeorm_1.InjectRepository)(job_assignment_entity_1.JobAssignment)),
    __param(4, (0, bull_1.InjectQueue)('jobs-matching')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService, Object])
], JobsService);
//# sourceMappingURL=jobs.service.js.map