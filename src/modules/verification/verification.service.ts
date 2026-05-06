import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TechnicianVerification, VerificationStatus } from '../../entities/technician-verification.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(TechnicianVerification)
    private verificationRepository: Repository<TechnicianVerification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async submitVerification(userId: string, data: any) {
    // Check if there is already a pending verification
    const existing = await this.verificationRepository.findOne({
      where: { userId, status: VerificationStatus.PENDING },
    });

    if (existing) {
      throw new BadRequestException('You already have a pending verification request.');
    }

    const verification = this.verificationRepository.create({
      userId,
      ...data,
      status: VerificationStatus.PENDING,
    });

    const saved = await this.verificationRepository.save(verification);

    // Update user status to pending
    await this.userRepository.update(userId, { status: 'pending' });

    return saved;
  }

  async getStatus(userId: string) {
    const verification = await this.verificationRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!verification) {
      return { status: 'unverified' };
    }

    return verification;
  }

  async reviewVerification(id: string, status: VerificationStatus, adminNote?: string) {
    const verification = await this.verificationRepository.findOne({
      where: { id },
    });

    if (!verification) {
      throw new NotFoundException('Verification request not found');
    }

    verification.status = status;
    verification.adminNote = adminNote;
    await this.verificationRepository.save(verification);

    // Update user status
    let userStatus = 'unverified';
    if (status === VerificationStatus.APPROVED) userStatus = 'approved';
    if (status === VerificationStatus.REJECTED) userStatus = 'rejected';

    await this.userRepository.update(verification.userId, { status: userStatus });

    return verification;
  }
}
