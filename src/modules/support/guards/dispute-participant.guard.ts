import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute } from '../../../entities/dispute.entity';

@Injectable()
export class DisputeParticipantGuard implements CanActivate {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { id: string; role: string };
      params?: { id?: string };
      dispute?: Dispute;
    }>();
    const user = request.user;
    const disputeId = request.params?.id;

    if (!disputeId || !user) {
      return true;
    }

    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      request.dispute = dispute;
      return true;
    }

    if (dispute.customerId !== user.id && dispute.providerId !== user.id) {
      throw new ForbiddenException('You are not a participant in this dispute');
    }

    request.dispute = dispute;
    return true;
  }
}
