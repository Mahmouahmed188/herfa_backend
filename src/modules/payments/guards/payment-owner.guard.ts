import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../../entities/payment.entity';

@Injectable()
export class PaymentOwnerGuard implements CanActivate {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const paymentId = request.params.id;

    if (!paymentId) return false;

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (user.role === 'customer' && payment.customerId !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (user.role === 'provider') {
      const booking = payment.booking;
      if (!booking || booking.providerId !== user.id) {
        throw new ForbiddenException('Access denied');
      }
    }

    request.paymentEntity = payment;
    return true;
  }
}
