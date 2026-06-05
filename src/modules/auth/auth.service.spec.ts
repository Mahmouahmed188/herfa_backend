import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BcryptService } from './bcrypt.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../common/constants/user.enums';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('7d'),
  };

  const mockBcryptService = {
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: BcryptService, useValue: mockBcryptService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      password: 'password123',
    };

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue({ id: '1' });
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should create a new user and return tokens', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        ...registerDto,
        role: UserRole.CUSTOMER,
        isActive: true,
      });

      const result = await service.register(registerDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(registerDto.email);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ email: 'test@test.com', passwordHash: 'hash' });
      mockBcryptService.compare.mockResolvedValue(false);
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens if login successful', async () => {
      const user = { id: '1', email: 'test@test.com', passwordHash: 'hash', isActive: true };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockBcryptService.compare.mockResolvedValue(true);
      mockPrismaService.user.update.mockResolvedValue(user);

      const result = await service.login('test@test.com', 'pass');
      expect(result).toHaveProperty('accessToken');
      expect(result.user.id).toBe(user.id);
    });
  });

  describe('refreshToken', () => {
    it('should throw UnauthorizedException if token invalid', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);
      await expect(service.refreshToken('invalid')).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens if refresh successful', async () => {
      const refreshToken = {
        id: 'rt1',
        token: 'valid',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
        user: { id: '1', isActive: true },
      };
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(refreshToken);
      mockPrismaService.refreshToken.update.mockResolvedValue({ ...refreshToken, isRevoked: true });

      const result = await service.refreshToken('valid');
      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('logout', () => {
    it('should revoke all active refresh tokens', async () => {
      mockPrismaService.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      const result = await service.logout('1');
      expect(result.message).toBe('Logged out successfully');
      expect(mockPrismaService.refreshToken.updateMany).toHaveBeenCalled();
    });
  });
});
