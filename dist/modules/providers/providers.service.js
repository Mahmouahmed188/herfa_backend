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
exports.ProvidersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const provider_profile_entity_1 = require("../../entities/provider-profile.entity");
const provider_application_entity_1 = require("../../entities/provider-application.entity");
const provider_service_entity_1 = require("../../entities/provider-service.entity");
const service_entity_1 = require("../../entities/service.entity");
const user_enums_1 = require("../../common/constants/user.enums");
let ProvidersService = class ProvidersService {
    userRepository;
    providerProfileRepository;
    applicationRepository;
    providerServiceRepository;
    serviceRepository;
    constructor(userRepository, providerProfileRepository, applicationRepository, providerServiceRepository, serviceRepository) {
        this.userRepository = userRepository;
        this.providerProfileRepository = providerProfileRepository;
        this.applicationRepository = applicationRepository;
        this.providerServiceRepository = providerServiceRepository;
        this.serviceRepository = serviceRepository;
    }
    async apply(userId, dto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === user_enums_1.UserRole.PROVIDER) {
            throw new common_1.BadRequestException('You are already a provider');
        }
        const existingApplication = await this.applicationRepository.findOne({
            where: { userId, status: user_enums_1.ProviderApplicationStatus.PENDING },
        });
        if (existingApplication) {
            throw new common_1.BadRequestException('You already have a pending application');
        }
        const application = this.applicationRepository.create({
            userId,
            ...dto,
            status: user_enums_1.ProviderApplicationStatus.PENDING,
        });
        await this.applicationRepository.save(application);
        const providerProfile = this.providerProfileRepository.create({
            userId,
            businessName: dto.businessName,
            businessDescription: dto.businessDescription,
            address: dto.address,
            latitude: dto.latitude,
            longitude: dto.longitude,
            serviceRadiusKm: dto.serviceRadiusKm,
            bio: dto.bio,
            verificationStatus: user_enums_1.ProviderVerificationStatus.PENDING,
        });
        await this.providerProfileRepository.save(providerProfile);
        application.providerProfileId = providerProfile.id;
        await this.applicationRepository.save(application);
        await this.userRepository.update(userId, { role: user_enums_1.UserRole.PROVIDER });
        return application;
    }
    async getProfile(userId) {
        const profile = await this.providerProfileRepository.findOne({
            where: { userId },
            relations: ['user', 'services', 'services.service', 'applications'],
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        return profile;
    }
    async getProfileByIdOrUserId(id) {
        let profile = await this.providerProfileRepository.findOne({
            where: { id },
            relations: ['user', 'services', 'services.service'],
        });
        if (!profile) {
            profile = await this.providerProfileRepository.findOne({
                where: { userId: id },
                relations: ['user', 'services', 'services.service'],
            });
        }
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        return profile;
    }
    async updateProfile(userId, dto) {
        const profile = await this.providerProfileRepository.findOne({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        Object.assign(profile, dto);
        return this.providerProfileRepository.save(profile);
    }
    async setAvailability(userId, dto) {
        const profile = await this.providerProfileRepository.findOne({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        profile.isAvailable = dto.isAvailable;
        return this.providerProfileRepository.save(profile);
    }
    async updateLocation(userId, dto) {
        const profile = await this.providerProfileRepository.findOne({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        profile.latitude = dto.latitude;
        profile.longitude = dto.longitude;
        return this.providerProfileRepository.save(profile);
    }
    async addService(userId, dto) {
        const profile = await this.providerProfileRepository.findOne({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        const service = await this.serviceRepository.findOne({
            where: { id: dto.serviceId },
        });
        if (!service) {
            throw new common_1.NotFoundException('Service not found');
        }
        const existingProviderService = await this.providerServiceRepository.findOne({
            where: { providerId: profile.id, serviceId: dto.serviceId },
        });
        if (existingProviderService) {
            existingProviderService.price = dto.price;
            existingProviderService.priceUnit = dto.priceUnit || '';
            return this.providerServiceRepository.save(existingProviderService);
        }
        const providerService = this.providerServiceRepository.create({
            providerId: profile.id,
            serviceId: dto.serviceId,
            price: dto.price,
            priceUnit: dto.priceUnit || '',
        });
        return this.providerServiceRepository.save(providerService);
    }
    async removeService(userId, serviceId) {
        const profile = await this.providerProfileRepository.findOne({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        const result = await this.providerServiceRepository.delete({
            providerId: profile.id,
            serviceId,
        });
        if (result.affected === 0) {
            throw new common_1.NotFoundException('Service not found on provider');
        }
        return { message: 'Service removed successfully' };
    }
    async searchProviders(dto) {
        const query = this.providerProfileRepository
            .createQueryBuilder('profile')
            .leftJoinAndSelect('profile.user', 'user')
            .leftJoinAndSelect('profile.services', 'ps')
            .leftJoinAndSelect('ps.service', 'service')
            .where('user.status = :status', { status: user_enums_1.UserStatus.ACTIVE });
        if (dto.isAvailable !== undefined) {
            query.andWhere('profile.isAvailable = :isAvailable', { isAvailable: dto.isAvailable });
        }
        if (dto.serviceId) {
            query.andWhere('ps.serviceId = :serviceId', { serviceId: dto.serviceId });
        }
        if (dto.latitude && dto.longitude && dto.radiusKm) {
            query.andWhere(`ST_DWithin(
          ST_SetSRID(ST_MakePoint(profile.longitude, profile.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius * 1000
        )`, { latitude: dto.latitude, longitude: dto.longitude, radius: dto.radiusKm });
        }
        const page = dto.page || 1;
        const limit = dto.limit || 20;
        query.skip((page - 1) * limit).take(limit);
        const [providers, total] = await query.getManyAndCount();
        return {
            data: providers,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getProviderJobs(userId, status) {
        const profile = await this.providerProfileRepository.findOne({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        const query = this.providerProfileRepository.manager
            .createQueryBuilder('profile', 'profile')
            .innerJoin('profile.jobAssignments', 'assignment')
            .innerJoin('assignment.job', 'job')
            .leftJoinAndSelect('job.customer', 'customer')
            .leftJoinAndSelect('job.service', 'service')
            .where('profile.id = :profileId', { profileId: profile.id });
        if (status) {
            query.andWhere('job.status = :status', { status });
        }
        return query.getMany();
    }
    async getProviderStats(userId) {
        const profile = await this.providerProfileRepository.findOne({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Provider profile not found');
        }
        return {
            totalJobsCompleted: profile.totalJobsCompleted,
            totalEarnings: profile.totalEarnings,
            rating: profile.rating,
            responseTimeMinutes: profile.responseTimeMinutes,
            isAvailable: profile.isAvailable,
        };
    }
};
exports.ProvidersService = ProvidersService;
exports.ProvidersService = ProvidersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(provider_profile_entity_1.ProviderProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(provider_application_entity_1.ProviderApplication)),
    __param(3, (0, typeorm_1.InjectRepository)(provider_service_entity_1.ProviderService)),
    __param(4, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProvidersService);
//# sourceMappingURL=providers.service.js.map