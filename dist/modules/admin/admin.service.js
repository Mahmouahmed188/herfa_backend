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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const provider_application_entity_1 = require("../../entities/provider-application.entity");
const job_entity_1 = require("../../entities/job.entity");
const payment_entity_1 = require("../../entities/payment.entity");
const user_enums_1 = require("../../common/constants/user.enums");
let AdminService = class AdminService {
    userRepository;
    applicationRepository;
    jobRepository;
    paymentRepository;
    constructor(userRepository, applicationRepository, jobRepository, paymentRepository) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.paymentRepository = paymentRepository;
    }
    async getDashboardStats() {
        const totalUsers = await this.userRepository.count();
        const totalProviders = await this.userRepository.count({ where: { role: user_enums_1.UserRole.PROVIDER } });
        const totalCustomers = await this.userRepository.count({ where: { role: user_enums_1.UserRole.CUSTOMER } });
        const activeJobs = await this.jobRepository.count({ where: { status: user_enums_1.JobStatus.IN_PROGRESS } });
        const completedJobs = await this.jobRepository.count({ where: { status: user_enums_1.JobStatus.COMPLETED } });
        const totalRevenue = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.status = :status', { status: user_enums_1.PaymentStatus.COMPLETED })
            .getRawOne();
        return {
            totalUsers,
            totalProviders,
            totalCustomers,
            activeJobs,
            completedJobs,
            totalRevenue: totalRevenue?.total || 0,
        };
    }
    async getAllUsers(page = 1, limit = 20, role, status) {
        const qb = this.userRepository.createQueryBuilder('user');
        if (role)
            qb.andWhere('user.role = :role', { role });
        if (status)
            qb.andWhere('user.status = :status', { status });
        const [users, total] = await qb.skip((page - 1) * limit).take(limit).orderBy('user.createdAt', 'DESC').getManyAndCount();
        return { data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async getPendingApplications(page = 1, limit = 20) {
        const [applications, total] = await this.applicationRepository.findAndCount({
            where: { status: user_enums_1.ProviderApplicationStatus.PENDING },
            relations: ['user', 'providerProfile'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data: applications, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async approveApplication(applicationId) {
        const application = await this.applicationRepository.findOne({
            where: { id: applicationId },
            relations: ['user'],
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        application.status = user_enums_1.ProviderApplicationStatus.APPROVED;
        await this.applicationRepository.save(application);
        if (application.providerProfile) {
            await this.userRepository.manager.query(`UPDATE provider_profiles SET verification_status = 'verified' WHERE id = $1`, [application.providerProfile.id]);
        }
        return { message: 'Application approved' };
    }
    async rejectApplication(applicationId, reason) {
        const application = await this.applicationRepository.findOne({ where: { id: applicationId } });
        if (!application)
            throw new common_1.NotFoundException('Application not found');
        application.status = user_enums_1.ProviderApplicationStatus.REJECTED;
        application.rejectionReason = reason;
        application.reviewedAt = new Date();
        return this.applicationRepository.save(application);
    }
    async updateUserStatus(userId, status) {
        await this.userRepository.update(userId, { status });
        return { message: `User status updated to ${status}` };
    }
    async getAllJobs(page = 1, limit = 20, status) {
        const qb = this.jobRepository.createQueryBuilder('job')
            .leftJoinAndSelect('job.customer', 'customer')
            .leftJoinAndSelect('job.assignments', 'assignments');
        if (status)
            qb.where('job.status = :status', { status });
        const [jobs, total] = await qb.skip((page - 1) * limit).take(limit).orderBy('job.createdAt', 'DESC').getManyAndCount();
        return { data: jobs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(provider_application_entity_1.ProviderApplication)),
    __param(2, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map