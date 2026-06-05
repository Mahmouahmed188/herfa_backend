import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationOwnerGuard } from './verification-owner.guard';
import { ProviderVerification } from '../../../entities/provider-verification.entity';

describe('VerificationOwnerGuard', () => {
  let guard: VerificationOwnerGuard;
  let verificationRepo: jest.Mocked<Repository<ProviderVerification>>;

  const mockRequest = (user: any, verificationId?: string) => ({
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        params: { id: verificationId },
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationOwnerGuard,
        {
          provide: getRepositoryToken(ProviderVerification),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    guard = module.get<VerificationOwnerGuard>(VerificationOwnerGuard);
    verificationRepo = module.get(getRepositoryToken(ProviderVerification));
  });

  it('should allow admin access', async () => {
    const context = mockRequest({ id: 'admin-uuid', role: 'admin' }) as any;
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow provider access to own verification', async () => {
    verificationRepo.findOne.mockResolvedValue({ providerId: 'provider-uuid' } as ProviderVerification);
    const context = mockRequest({ id: 'provider-uuid', role: 'provider' }, 'verification-uuid') as any;
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should deny provider access to another provider verification', async () => {
    verificationRepo.findOne.mockResolvedValue({ providerId: 'other-provider' } as ProviderVerification);
    const context = mockRequest({ id: 'provider-uuid', role: 'provider' }, 'verification-uuid') as any;

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should deny access when user not authenticated', async () => {
    const context = mockRequest(null, 'verification-uuid') as any;

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});
