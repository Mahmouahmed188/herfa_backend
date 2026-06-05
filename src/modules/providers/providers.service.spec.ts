import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { User } from '../../entities/user.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { ProviderApplication } from '../../entities/provider-application.entity';
import { ProviderService } from '../../entities/provider-service.entity';
import { Service } from '../../entities/service.entity';
import { ProviderCategory } from '../../entities/provider-category.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProvidersService', () => {
  let service: ProvidersService;

  const mockUser = { id: 'user-1', role: 'customer', status: 'active' };
  const mockProfile = {
    id: 'profile-1',
    userId: 'user-1',
    businessName: 'Test Co',
    bio: 'Test bio',
    experienceYears: 5,
    rating: 4.5,
    totalJobsCompleted: 10,
    isAvailable: true,
    verificationStatus: 'pending',
    categories: [],
  };

  const queryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockProfile], 1]),
  };

  const mockRepositories = {
    user: { findOne: jest.fn(), save: jest.fn(), update: jest.fn() },
    profile: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => queryBuilder),
    },
    application: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() },
    providerService: { findOne: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() },
    serviceRepo: { findOne: jest.fn(), findByIds: jest.fn() },
    providerCategory: { find: jest.fn(), create: jest.fn(), save: jest.fn(), delete: jest.fn() },
    categoryRepo: { findByIds: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        { provide: getRepositoryToken(User), useValue: mockRepositories.user },
        { provide: getRepositoryToken(ProviderProfile), useValue: mockRepositories.profile },
        { provide: getRepositoryToken(ProviderApplication), useValue: mockRepositories.application },
        { provide: getRepositoryToken(ProviderService), useValue: mockRepositories.providerService },
        { provide: getRepositoryToken(Service), useValue: mockRepositories.serviceRepo },
        { provide: getRepositoryToken(ProviderCategory), useValue: mockRepositories.providerCategory },
        { provide: getRepositoryToken(ServiceCategory), useValue: mockRepositories.categoryRepo },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return provider profile', async () => {
      mockRepositories.profile.findOne.mockResolvedValue(mockProfile);
      const result = await service.getProfile('user-1');
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepositories.profile.findOne.mockResolvedValue(null);
      await expect(service.getProfile('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update profile with experienceYears', async () => {
      mockRepositories.profile.findOne.mockResolvedValue(mockProfile);
      mockRepositories.profile.save.mockResolvedValue({ ...mockProfile, experienceYears: 8 });
      const result = await service.updateProfile('user-1', { experienceYears: 8 });
      expect(result.experienceYears).toBe(8);
    });
  });

  describe('getCategories', () => {
    it('should return categories for a provider', async () => {
      mockRepositories.profile.findOne.mockResolvedValue(mockProfile);
      mockRepositories.providerCategory.find.mockResolvedValue([
        { category: { id: 'cat-1', name: 'Plumbing' } },
      ]);
      const result = await service.getCategories('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Plumbing');
    });
  });

  describe('setCategories', () => {
    it('should set categories for a provider', async () => {
      mockRepositories.profile.findOne.mockResolvedValue(mockProfile);
      mockRepositories.categoryRepo.findByIds.mockResolvedValue([
        { id: 'cat-1', name: 'Plumbing' },
      ]);
      mockRepositories.providerCategory.create.mockReturnValue({});
      mockRepositories.providerCategory.save.mockResolvedValue([]);
      mockRepositories.providerCategory.delete.mockResolvedValue({ affected: 1 });

      const result = await service.setCategories('user-1', { categoryIds: ['cat-1'] });
      expect(result.categoryIds).toEqual(['cat-1']);
    });

    it('should throw BadRequestException for invalid category IDs', async () => {
      mockRepositories.profile.findOne.mockResolvedValue(mockProfile);
      mockRepositories.categoryRepo.findByIds.mockResolvedValue([]);
      await expect(
        service.setCategories('user-1', { categoryIds: ['invalid'] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyProvider', () => {
    it('should verify a provider', async () => {
      mockRepositories.profile.findOne.mockResolvedValue(mockProfile);
      mockRepositories.profile.save.mockResolvedValue({ ...mockProfile, verificationStatus: 'verified' });
      const result = await service.verifyProvider('profile-1', 'verified');
      expect(result.verificationStatus).toBe('verified');
    });

    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.verifyProvider('profile-1', 'invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('searchProviders', () => {
    it('should search providers with pagination', async () => {
      const result = await service.searchProviders({ page: 1, limit: 20 });
      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
    });

    it('should filter by categoryId', async () => {
      await service.searchProviders({ categoryId: 'cat-1' });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'pc.categoryId = :categoryId',
        { categoryId: 'cat-1' },
      );
    });
  });
});
