import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { ServiceListing } from '../../entities/service-listing.entity';
import { ServiceImage } from '../../entities/service-image.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceFilterDto,
  ServiceImageDto,
} from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceListing)
    private listingRepository: Repository<ServiceListing>,
    @InjectRepository(ServiceImage)
    private imageRepository: Repository<ServiceImage>,
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
  ) {}

  async create(userId: string, dto: CreateServiceDto) {
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId, isActive: true },
    });
    if (!category) {
      throw new BadRequestException('Category not found or inactive');
    }

    const listing = this.listingRepository.create({
      ...dto,
      providerId: userId,
      currency: dto.currency || 'SAR',
    });
    return this.listingRepository.save(listing);
  }

  async findByProvider(userId: string) {
    return this.listingRepository.find({
      where: { providerId: userId },
      relations: ['category', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId?: string) {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'provider'],
    });
    if (!listing) {
      throw new NotFoundException('Service not found');
    }
    if (userId && listing.providerId !== userId) {
      throw new ForbiddenException('You do not own this service');
    }
    return listing;
  }

  async update(userId: string, id: string, dto: UpdateServiceDto) {
    const listing = await this.findById(id, userId);
    Object.assign(listing, dto);
    return this.listingRepository.save(listing);
  }

  async remove(userId: string, id: string) {
    const listing = await this.findById(id, userId);
    await this.listingRepository.remove(listing);
    return { message: 'Service deleted successfully' };
  }

  async toggleStatus(userId: string, id: string, isActive: boolean) {
    const listing = await this.findById(id, userId);
    listing.isActive = isActive;
    return this.listingRepository.save(listing);
  }

  async search(dto: ServiceFilterDto) {
    const query = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.category', 'category')
      .leftJoinAndSelect('listing.images', 'images')
      .leftJoinAndSelect('listing.provider', 'provider')
      .where('listing.isActive = :isActive', { isActive: true });

    if (dto.categoryId) {
      query.andWhere('listing.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    if (dto.providerId) {
      query.andWhere('listing.providerId = :providerId', {
        providerId: dto.providerId,
      });
    }

    if (dto.minPrice !== undefined) {
      query.andWhere('listing.basePrice >= :minPrice', {
        minPrice: dto.minPrice,
      });
    }

    if (dto.maxPrice !== undefined) {
      query.andWhere('listing.basePrice <= :maxPrice', {
        maxPrice: dto.maxPrice,
      });
    }

    if (dto.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('listing.title ILIKE :search', {
            search: `%${dto.search}%`,
          }).orWhere('listing.description ILIKE :search', {
            search: `%${dto.search}%`,
          });
        }),
      );
    }

    const sortBy =
      dto.sortBy === 'basePrice' ? 'listing.basePrice' : 'listing.createdAt';
    const sortOrder = dto.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    query.orderBy(sortBy, sortOrder);

    const page = dto.page || 1;
    const limit = dto.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async addImage(userId: string, serviceId: string, dto: ServiceImageDto) {
    await this.findById(serviceId, userId);
    const image = this.imageRepository.create({
      serviceId,
      imageUrl: dto.imageUrl,
      isPrimary: dto.isPrimary || false,
    });
    if (dto.isPrimary) {
      await this.imageRepository.update(
        { serviceId, isPrimary: true },
        { isPrimary: false },
      );
    }
    return this.imageRepository.save(image);
  }

  async setPrimaryImage(userId: string, serviceId: string, imageId: string) {
    await this.findById(serviceId, userId);
    const image = await this.imageRepository.findOne({
      where: { id: imageId, serviceId },
    });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    await this.imageRepository.update(
      { serviceId, isPrimary: true },
      { isPrimary: false },
    );
    image.isPrimary = true;
    return this.imageRepository.save(image);
  }

  async removeImage(userId: string, serviceId: string, imageId: string) {
    await this.findById(serviceId, userId);
    const result = await this.imageRepository.delete({
      id: imageId,
      serviceId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Image not found');
    }
    return { message: 'Image removed successfully' };
  }

  async findAllAdmin() {
    return this.listingRepository.find({
      relations: ['category', 'provider', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  async deactivateAsAdmin(id: string) {
    const listing = await this.listingRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Service not found');
    }
    listing.isActive = false;
    return this.listingRepository.save(listing);
  }
}
