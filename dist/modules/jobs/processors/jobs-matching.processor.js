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
var JobsMatchingProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsMatchingProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const provider_location_entity_1 = require("../../../entities/provider-location.entity");
const job_entity_1 = require("../../../entities/job.entity");
const job_assignment_entity_1 = require("../../../entities/job-assignment.entity");
const user_enums_1 = require("../../../common/constants/user.enums");
const notifications_service_1 = require("../../notifications/notifications.service");
const tracking_gateway_1 = require("../../tracking/tracking.gateway");
const common_1 = require("@nestjs/common");
let JobsMatchingProcessor = JobsMatchingProcessor_1 = class JobsMatchingProcessor {
    providerLocationRepository;
    jobRepository;
    assignmentRepository;
    notificationsService;
    trackingGateway;
    logger = new common_1.Logger(JobsMatchingProcessor_1.name);
    constructor(providerLocationRepository, jobRepository, assignmentRepository, notificationsService, trackingGateway) {
        this.providerLocationRepository = providerLocationRepository;
        this.jobRepository = jobRepository;
        this.assignmentRepository = assignmentRepository;
        this.notificationsService = notificationsService;
        this.trackingGateway = trackingGateway;
    }
    async handleMatching(job) {
        const { jobId, latitude, longitude, serviceId, radius } = job.data;
        this.logger.log(`Matching providers for job ${jobId} within ${radius}km`);
        const providers = await this.providerLocationRepository
            .createQueryBuilder('pl')
            .innerJoinAndSelect('pl.provider', 'profile')
            .innerJoinAndSelect('profile.services', 'ps')
            .where('pl.isOnline = :isOnline', { isOnline: true })
            .andWhere('pl.isOnJob = :isOnJob', { isOnJob: false })
            .andWhere('ps.serviceId = :serviceId', { serviceId })
            .andWhere(`ST_DWithin(
          pl.location,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius * 1000
        )`, { longitude, latitude, radius })
            .getMany();
        if (providers.length === 0) {
            this.logger.warn(`No providers found for job ${jobId} in ${radius}km radius`);
            return;
        }
        this.logger.log(`Found ${providers.length} matching providers for job ${jobId}`);
        for (const pl of providers) {
            const assignment = this.assignmentRepository.create({
                jobId,
                providerId: pl.providerId,
                status: user_enums_1.JobAssignmentStatus.PENDING,
            });
            await this.assignmentRepository.save(assignment);
            this.trackingGateway.emitToUser(pl.provider.userId, 'newJobAvailable', {
                jobId,
                distance: pl['distance'],
            });
            await this.notificationsService.create({
                userId: pl.provider.userId,
                type: user_enums_1.NotificationType.JOB_CREATED,
                title: 'New Job Opportunity!',
                message: 'A new service request is available in your area.',
                data: { jobId },
            });
        }
    }
};
exports.JobsMatchingProcessor = JobsMatchingProcessor;
__decorate([
    (0, bull_1.Process)('match-providers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobsMatchingProcessor.prototype, "handleMatching", null);
exports.JobsMatchingProcessor = JobsMatchingProcessor = JobsMatchingProcessor_1 = __decorate([
    (0, bull_1.Processor)('jobs-matching'),
    __param(0, (0, typeorm_1.InjectRepository)(provider_location_entity_1.ProviderLocation)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(2, (0, typeorm_1.InjectRepository)(job_assignment_entity_1.JobAssignment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        tracking_gateway_1.TrackingGateway])
], JobsMatchingProcessor);
//# sourceMappingURL=jobs-matching.processor.js.map