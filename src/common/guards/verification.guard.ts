import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class VerificationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Only apply to technicians
    if (user.role === 'technician' || user.role === 'provider') {
      if (user.status !== 'approved') {
        throw new ForbiddenException('Your account must be approved before accessing this resource.');
      }
    }

    return true;
  }
}
