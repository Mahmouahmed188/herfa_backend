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
exports.JobsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jobs_service_1 = require("./jobs.service");
const jobs_dto_1 = require("./dto/jobs.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const verification_guard_1 = require("../../common/guards/verification.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let JobsController = class JobsController {
    jobsService;
    constructor(jobsService) {
        this.jobsService = jobsService;
    }
    async create(user, dto) {
        return this.jobsService.create(user.id, dto);
    }
    async getCustomerJobs(user, query) {
        return this.jobsService.findByCustomer(user.id, query);
    }
    async getProviderJobs(user, query) {
        return this.jobsService.findByProvider(user.id, query);
    }
    async getAvailableJobs(latitude, longitude, radiusKm) {
        return this.jobsService.getAvailableJobs(latitude, longitude, radiusKm);
    }
    async getJob(id) {
        return this.jobsService.findById(id);
    }
    async updateJob(id, user, dto) {
        return this.jobsService.update(id, user.id, dto);
    }
    async cancelJob(id, user, reason) {
        return this.jobsService.cancel(id, user.id, reason);
    }
    async acceptAssignment(user, dto) {
        return this.jobsService.acceptAssignment(user.id, dto);
    }
    async rejectAssignment(id, user, dto) {
        return this.jobsService.rejectAssignment(user.id, id, dto);
    }
    async updateStatus(id, user, status) {
        return this.jobsService.updateJobStatus(id, user.id, status);
    }
};
exports.JobsController = JobsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new job' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, jobs_dto_1.CreateJobDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'Get customer jobs' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, jobs_dto_1.JobQueryDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getCustomerJobs", null);
__decorate([
    (0, common_1.Get)('assigned'),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider assigned jobs' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, jobs_dto_1.JobQueryDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getProviderJobs", null);
__decorate([
    (0, common_1.Get)('available'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available jobs for provider' }),
    __param(0, (0, common_1.Query)('latitude')),
    __param(1, (0, common_1.Query)('longitude')),
    __param(2, (0, common_1.Query)('radiusKm')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getAvailableJobs", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get job by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "getJob", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update job' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, jobs_dto_1.UpdateJobDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "updateJob", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel job' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "cancelJob", null);
__decorate([
    (0, common_1.Post)('assignments/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept job assignment' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, jobs_dto_1.AcceptJobDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "acceptAssignment", null);
__decorate([
    (0, common_1.Post)('assignments/:id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject job assignment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, jobs_dto_1.RejectJobDto]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "rejectAssignment", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update job status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], JobsController.prototype, "updateStatus", null);
exports.JobsController = JobsController = __decorate([
    (0, swagger_1.ApiTags)('Jobs'),
    (0, common_1.Controller)('jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, verification_guard_1.VerificationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [jobs_service_1.JobsService])
], JobsController);
//# sourceMappingURL=jobs.controller.js.map