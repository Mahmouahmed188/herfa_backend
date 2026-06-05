import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { ServiceCategory } from '../../entities/service-category.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<Repository<ServiceCategory>>;

  const mockCategory = {
    id: 'uuid-1',
    name: 'Plumbing',
    description: 'Plumbing services',
    icon: 'plumbing-icon',
    image: null,
    isActive: true,
    sortOrder: 1,
    services: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(ServiceCategory), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(getRepositoryToken(ServiceCategory));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active categories', async () => {
      mockRepository.find.mockResolvedValue([mockCategory]);
      const result = await service.findAll();
      expect(result).toEqual([mockCategory]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { sortOrder: 'ASC' },
      });
    });

    it('should include inactive categories when requested', async () => {
      mockRepository.find.mockResolvedValue([mockCategory]);
      await service.findAll(true);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { sortOrder: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCategory);
      mockRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create({ name: 'Plumbing', description: 'Plumbing services' });
      expect(result).toEqual(mockCategory);
    });

    it('should throw ConflictException if name exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);
      await expect(service.create({ name: 'Plumbing' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce(null);
      mockRepository.save.mockResolvedValue({ ...mockCategory, name: 'Updated' });

      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw ConflictException if new name already exists', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(mockCategory)
        .mockResolvedValueOnce({ ...mockCategory, id: 'other-id' });
      await expect(service.update('uuid-1', { name: 'Existing' })).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.update('invalid-id', { name: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should set isActive to false', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);
      mockRepository.save.mockResolvedValue({ ...mockCategory, isActive: false });
      const result = await service.deactivate('uuid-1');
      expect(result.isActive).toBe(false);
    });
  });

  describe('activate', () => {
    it('should set isActive to true', async () => {
      const inactive = { ...mockCategory, isActive: false };
      mockRepository.findOne.mockResolvedValue(inactive);
      mockRepository.save.mockResolvedValue({ ...inactive, isActive: true });
      const result = await service.activate('uuid-1');
      expect(result.isActive).toBe(true);
    });
  });
});
