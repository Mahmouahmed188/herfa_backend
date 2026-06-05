import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrackingSession } from '../../../entities/tracking-session.entity';

@Injectable()
export class TrackingOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(TrackingSession)
    private readonly trackingSessionRepository: Repository<TrackingSession>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const bookingId =
      request.params.bookingId || request.body?.bookingId || request.params.id;

    if (!bookingId) {
      return true;
    }

    const session = await this.trackingSessionRepository.findOne({
      where: { bookingId },
    });

    if (!session) {
      return true;
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    if (user.role === 'provider' && session.providerId !== user.id) {
      throw new ForbiddenException('You do not own this tracking session');
    }

    if (user.role === 'customer' && session.customerId !== user.id) {
      throw new ForbiddenException('You do not own this booking');
    }

    return true;
  }
}
