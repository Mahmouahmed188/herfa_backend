import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { ProviderApplication } from '../../entities/provider-application.entity';
import { ProviderService } from '../../entities/provider-service.entity';
import { Service } from '../../entities/service.entity';
import { ProviderCategory } from '../../entities/provider-category.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import {
  UserRole,
  UserStatus,
  ProviderApplicationStatus,
  ProviderVerificationStatus,
} from '../../common/constants/user.enums';
import {
  CreateProviderApplicationDto,
  UpdateProviderProfileDto,
  SetAvailabilityDto,
  UpdateLocationDto,
  ProviderServiceDto,
} from './dto/providers.dto';
import { ProviderCategoryDto } from './dto/provider-category.dto';
import { ProviderSearchDto, SortOrder } from '../../common/dto/pagination.dto';

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
    @InjectRepository(ProviderCategory)
    private providerCategoryRepository: Repository<ProviderCategory>,
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
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
      relations: [
        'user',
        'services',
        'services.service',
        'applications',
        'categories',
        'categories.category',
      ],
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }
    return profile;
  }

  async getProfileByIdOrUserId(id: string) {
    let profile = await this.providerProfileRepository.findOne({
      where: { id },
      relations: [
        'user',
        'services',
        'services.service',
        'categories',
        'categories.category',
      ],
    });
    if (!profile) {
      profile = await this.providerProfileRepository.findOne({
        where: { userId: id },
        relations: [
          'user',
          'services',
          'services.service',
          'categories',
          'categories.category',
        ],
      });
    }
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

    const existingProviderService =
      await this.providerServiceRepository.findOne({
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

  async getCategories(userId: string) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const categories = await this.providerCategoryRepository.find({
      where: { providerId: profile.id },
      relations: ['category'],
    });
    return categories.map((pc) => pc.category);
  }

  async setCategories(userId: string, dto: ProviderCategoryDto) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const categories = await this.categoryRepository.findByIds(dto.categoryIds);
    if (categories.length !== dto.categoryIds.length) {
      throw new BadRequestException('One or more category IDs do not exist');
    }

    await this.providerCategoryRepository.delete({ providerId: profile.id });

    const providerCategories = dto.categoryIds.map((categoryId) =>
      this.providerCategoryRepository.create({
        providerId: profile.id,
        categoryId,
      }),
    );
    await this.providerCategoryRepository.save(providerCategories);

    return { providerId: profile.id, categoryIds: dto.categoryIds };
  }

  async removeCategory(userId: string, categoryId: string) {
    const profile = await this.providerProfileRepository.findOne({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const result = await this.providerCategoryRepository.delete({
      providerId: profile.id,
      categoryId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Category not assigned to provider');
    }
    return { message: 'Category removed from profile' };
  }

  async searchProviders(dto: ProviderSearchDto) {
    const query = this.providerProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user')
      .leftJoinAndSelect('profile.categories', 'pc')
      .leftJoinAndSelect('pc.category', 'category')
      .where('user.status = :status', { status: UserStatus.ACTIVE });

    if (dto.isAvailable !== undefined) {
      const isAvailable = dto.isAvailable === 'true';
      query.andWhere('profile.isAvailable = :isAvailable', { isAvailable });
    }

    if (dto.categoryId) {
      query.andWhere('pc.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    if (dto.latitude && dto.longitude && dto.radiusKm) {
      query.andWhere(
        `ST_DWithin(
          ST_SetSRID(ST_MakePoint(profile.longitude, profile.latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
          :radius * 1000
        )`,
        {
          latitude: dto.latitude,
          longitude: dto.longitude,
          radius: dto.radiusKm,
        },
      );
    }

    const sortBy =
      dto.sortBy === 'rating' ? 'profile.rating' : 'profile.experienceYears';
    const sortOrder = dto.sortOrder === SortOrder.DESC ? 'DESC' : 'ASC';
    query.orderBy(sortBy, sortOrder);

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
      experienceYears: profile.experienceYears,
    };
  }

  async verifyProvider(profileId: string, status: string) {
    const validStatuses = ['verified', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        'Invalid verification status. Must be "verified" or "rejected"',
      );
    }

    const profile = await this.providerProfileRepository.findOne({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    profile.verificationStatus = status;
    return this.providerProfileRepository.save(profile);
  }

  async suspendProvider(profileId: string, isSuspended: boolean) {
    const profile = await this.providerProfileRepository.findOne({
      where: { id: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: profile.userId },
    });
    if (user) {
      user.status = isSuspended ? UserStatus.SUSPENDED : UserStatus.ACTIVE;
      await this.userRepository.save(user);
    }

    return {
      message: isSuspended
        ? 'Provider has been suspended'
        : 'Provider has been reactivated',
    };
  }
}
