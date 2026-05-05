import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { ProviderApplication } from '../../entities/provider-application.entity';
import { ProviderService } from '../../entities/provider-service.entity';
import { Service } from '../../entities/service.entity';
import { UserRole, UserStatus, ProviderApplicationStatus, ProviderVerificationStatus } from '../../common/constants/user.enums';
import {
  CreateProviderApplicationDto,
  UpdateProviderProfileDto,
  SetAvailabilityDto,
  UpdateLocationDto,
  ProviderServiceDto,
  SearchProvidersDto,
} from './dto/providers.dto';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProviderProfile)
    private providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(ProviderApplication)
    private applicationRepository: Repository<ProviderApplication>,
    @InjectRepository(ProviderService)
    private providerServiceRepository: Repository<ProviderService>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async apply(userId: string, dto: CreateProviderApplicationDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.PROVIDER) {
      throw new BadRequestException('You are already a provider');
    }

    const existingApplication = await this.applicationRepository.findOne({
      where: { userId, status: ProviderApplicationStatus.PENDING },
    });
    if (existingApplication) {
      throw new BadRequestException('You already have a pending application');
    }

    const application = this.applicationRepository.create({
      userId,
      ...dto,
      status: ProviderApplicationStatus.PENDING,
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
      verificationStatus: ProviderVerificationStatus.PENDING,
    });
    await this.providerProfileRepository.save(providerProfile);

    application.providerProfileId = providerProfile.id;
    await this.applicationRepository.save(application);

    await this.userRepository.update(userId, { role: UserRole.PROVIDER });

    return application;
  }

  async getProfile(userId: string) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
      relations: ['user', 'services', 'services.service', 'applications'],
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProviderProfileDto) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    Object.assign(profile, dto);
    return this.providerProfileRepository.save(profile);
  }

  async setAvailability(userId: string, dto: SetAvailabilityDto) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    profile.isAvailable = dto.isAvailable;
    return this.providerProfileRepository.save(profile);
  }

  async updateLocation(userId: string, dto: UpdateLocationDto) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    profile.latitude = dto.latitude;
    profile.longitude = dto.longitude;
    return this.providerProfileRepository.save(profile);
  }

  async addService(userId: string, dto: ProviderServiceDto) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const service = await this.serviceRepository.findOne({
      where: { id: dto.serviceId },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
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

  async removeService(userId: string, serviceId: string) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const result = await this.providerServiceRepository.delete({
      providerId: profile.id,
      serviceId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Service not found on provider');
    }
    return { message: 'Service removed successfully' };
  }

  async searchProviders(dto: SearchProvidersDto) {
    const query = this.providerProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.services', 'ps')
      .leftJoinAndSelect('ps.service', 'service')
      .where('user.status = :status', { status: UserStatus.ACTIVE });

    if (dto.isAvailable !== undefined) {
      query.andWhere('profile.isAvailable = :isAvailable', { isAvailable: dto.isAvailable });
    }

    if (dto.serviceId) {
      query.andWhere('ps.serviceId = :serviceId', { serviceId: dto.serviceId });
    }

    if (dto.latitude && dto.longitude && dto.radiusKm) {
      query.andWhere(
        `ST_DWithin(
          ST_SetSRID(ST_MakePoint(profile.longitude, profile.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius * 1000
        )`,
        { latitude: dto.latitude, longitude: dto.longitude, radius: dto.radiusKm },
      );
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

  async getProviderJobs(userId: string, status?: string) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
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

  async getProviderStats(userId: string) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    return {
      totalJobsCompleted: profile.totalJobsCompleted,
      totalEarnings: profile.totalEarnings,
      rating: profile.rating,
      responseTimeMinutes: profile.responseTimeMinutes,
      isAvailable: profile.isAvailable,
    };
  }
}