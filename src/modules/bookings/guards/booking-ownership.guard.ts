import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../../entities/booking.entity';

@Injectable()
export class BookingOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user as {
      id: string;
      role: string;
      providerProfileId?: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const bookingId = request.params?.id as string | undefined;

    if (!bookingId) {
      return true;
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new ForbiddenException('Booking not found');
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.booking = booking;
      return true;
    }

    if (user.role === 'customer' && booking.customerId === user.id) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.booking = booking;
      return true;
    }

    if (user.role === 'provider') {
      const providerProfileId = user.providerProfileId || user.id;
      if (booking.providerId === providerProfileId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        request.booking = booking;
        return true;
      }
    }

    throw new ForbiddenException('You do not have access to this booking');
  }
}
