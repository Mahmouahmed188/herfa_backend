import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { ServiceListing } from '../../entities/service-listing.entity';
import { ServiceImage } from '../../entities/service-image.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('ServicesService', () => {
  let service: ServicesService;

  const mockListing = {
    id: 'listing-1',
    providerId: 'user-1',
    categoryId: 'cat-1',
    title: 'Faucet Installation',
    description: 'Professional faucet installation',
    basePrice: 150,
    currency: 'SAR',
    estimatedDurationMinutes: 60,
    isActive: true,
    images: [],
    category: { id: 'cat-1', name: 'Plumbing' },
    provider: { id: 'user-1' },
  };

  const queryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockListing], 1]),
  };

  const mockRepositories = {
    listing: {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    },
    image: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    category: { findOne: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: getRepositoryToken(ServiceListing),
          useValue: mockRepositories.listing,
        },
        {
          provide: getRepositoryToken(ServiceImage),
          useValue: mockRepositories.image,
        },
        {
          provide: getRepositoryToken(ServiceCategory),
          useValue: mockRepositories.category,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a service listing', async () => {
      mockRepositories.category.findOne.mockResolvedValue({
        id: 'cat-1',
        isActive: true,
      });
      mockRepositories.listing.create.mockReturnValue(mockListing);
      mockRepositories.listing.save.mockResolvedValue(mockListing);

      const result = await service.create('user-1', {
        title: 'Faucet Installation',
        description: 'Professional faucet installation',
        categoryId: 'cat-1',
        basePrice: 150,
        estimatedDurationMinutes: 60,
      });
      expect(result.title).toBe('Faucet Installation');
    });

    it('should throw BadRequestException if category not found', async () => {
      mockRepositories.category.findOne.mockResolvedValue(null);
      await expect(
        service.create('user-1', {
          title: 'Test',
          description: 'Description here',
          categoryId: 'invalid',
          basePrice: 100,
          estimatedDurationMinutes: 30,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findById', () => {
    it('should return a service listing', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(mockListing);
      const result = await service.findById('listing-1');
      expect(result.id).toBe('listing-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(null);
      await expect(service.findById('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if userId does not match', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(mockListing);
      await expect(service.findById('listing-1', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a service listing', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(mockListing);
      mockRepositories.listing.save.mockResolvedValue({
        ...mockListing,
        title: 'Updated',
      });
      const result = await service.update('user-1', 'listing-1', {
        title: 'Updated',
      });
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a service listing', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(mockListing);
      mockRepositories.listing.remove.mockResolvedValue(mockListing);
      const result = await service.remove('user-1', 'listing-1');
      expect(result.message).toBe('Service deleted successfully');
    });
  });

  describe('toggleStatus', () => {
    it('should toggle service active status', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(mockListing);
      mockRepositories.listing.save.mockResolvedValue({
        ...mockListing,
        isActive: false,
      });
      const result = await service.toggleStatus('user-1', 'listing-1', false);
      expect(result.isActive).toBe(false);
    });
  });

  describe('search', () => {
    it('should search and return paginated results', async () => {
      const result = await service.search({ page: 1, limit: 20 });
      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should filter by categoryId', async () => {
      await service.search({ categoryId: 'cat-1' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'listing.categoryId = :categoryId',
        { categoryId: 'cat-1' },
      );
    });
  });

  describe('addImage', () => {
    it('should add an image to a service', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(mockListing);
      mockRepositories.image.create.mockReturnValue({
        id: 'img-1',
        serviceId: 'listing-1',
        imageUrl: 'url',
        isPrimary: false,
      });
      mockRepositories.image.save.mockResolvedValue({
        id: 'img-1',
        serviceId: 'listing-1',
        imageUrl: 'url',
        isPrimary: false,
      });
      const result = await service.addImage('user-1', 'listing-1', {
        imageUrl: 'url',
      });
      expect(result.imageUrl).toBe('url');
    });
  });

  describe('setPrimaryImage', () => {
    it('should set primary image', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(mockListing);
      mockRepositories.image.findOne.mockResolvedValue({
        id: 'img-1',
        serviceId: 'listing-1',
        isPrimary: false,
      });
      mockRepositories.image.update.mockResolvedValue({ affected: 1 });
      mockRepositories.image.save.mockResolvedValue({
        id: 'img-1',
        serviceId: 'listing-1',
        isPrimary: true,
      });
      const result = await service.setPrimaryImage(
        'user-1',
        'listing-1',
        'img-1',
      );
      expect(result.isPrimary).toBe(true);
    });
  });

  describe('deactivateAsAdmin', () => {
    it('should deactivate a service as admin', async () => {
      mockRepositories.listing.findOne.mockResolvedValue(mockListing);
      mockRepositories.listing.save.mockResolvedValue({
        ...mockListing,
        isActive: false,
      });
      const result = await service.deactivateAsAdmin('listing-1');
      expect(result.isActive).toBe(false);
    });
  });
});
