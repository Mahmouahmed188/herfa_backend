import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });

    it('should return user if found', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      expect(await service.findById('1')).toBe(user);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = { firstName: 'NewName' };
      const user = { id: '1', email: 'test@test.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue({ ...user, ...updateDto });

      const result = await service.updateProfile('1', updateDto);
      expect(result.firstName).toBe(updateDto.firstName);
    });
  });
});
