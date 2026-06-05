import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderVerification } from '../../../entities/provider-verification.entity';

@Injectable()
export class VerificationOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(ProviderVerification)
    private readonly verificationRepository: Repository<ProviderVerification>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const verificationId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    if (verificationId) {
      const verification = await this.verificationRepository.findOne({
        where: { id: verificationId },
      });

      if (!verification) {
        throw new ForbiddenException('Verification record not found');
      }

      if (verification.providerId !== user.id) {
        throw new ForbiddenException('You can only access your own verification data');
      }
    }

    return true;
  }
}
