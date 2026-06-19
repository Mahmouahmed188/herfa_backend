import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TechnicianVerification,
  VerificationStatus,
} from '../../entities/technician-verification.entity';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(TechnicianVerification)
    private verificationRepository: Repository<TechnicianVerification>,
  ) {}

  async submitVerification(
    userId: string,
    files: {
      frontIdImage?: Express.Multer.File[];
      backIdImage?: Express.Multer.File[];
      personalPhoto?: Express.Multer.File[];
      'certificates[]'?: Express.Multer.File[];
      'portfolio[]'?: Express.Multer.File[];
    },
  ): Promise<TechnicianVerification> {
    let verification = await this.verificationRepository.findOne({
      where: { userId },
    });

    if (verification) {
      if (verification.status === VerificationStatus.PENDING) {
        throw new BadRequestException(
          'You already have a pending verification request.',
        );
      }
      if (verification.status === VerificationStatus.APPROVED) {
        throw new BadRequestException('Your account is already verified.');
      }
    }

    const frontIdImageUrl = `/uploads/verification/${files.frontIdImage![0].filename}`;
    const backIdImageUrl = `/uploads/verification/${files.backIdImage![0].filename}`;
    const personalPhotoUrl = `/uploads/verification/${files.personalPhoto![0].filename}`;

    const certificatesUrls =
      files['certificates[]']?.map((f) => `/uploads/verification/${f.filename}`) || [];
    const portfolioUrls =
      files['portfolio[]']?.map((f) => `/uploads/verification/${f.filename}`) || [];

    if (verification) {
      verification.frontIdImageUrl = frontIdImageUrl;
      verification.backIdImageUrl = backIdImageUrl;
      verification.personalPhotoUrl = personalPhotoUrl;
      verification.certificatesUrls =
        certificatesUrls.length > 0 ? certificatesUrls : [];
      verification.portfolioUrls =
        portfolioUrls.length > 0 ? portfolioUrls : [];
      verification.status = VerificationStatus.PENDING;
      verification.submittedAt = new Date();
      (verification as any).reviewedAt = null;
      (verification as any).adminNote = null;
    } else {
      verification = this.verificationRepository.create({
        userId,
        frontIdImageUrl,
        backIdImageUrl,
        personalPhotoUrl,
        certificatesUrls,
        portfolioUrls,
        status: VerificationStatus.PENDING,
        submittedAt: new Date(),
      });
    }

    return this.verificationRepository.save(verification);
  }

  async getStatus(userId: string) {
    const verification = await this.verificationRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!verification) {
      return {
        status: VerificationStatus.UNVERIFIED,
        adminNote: null,
        submittedAt: null,
        reviewedAt: null,
      };
    }

    return {
      status: verification.status,
      adminNote: verification.adminNote || null,
      submittedAt: verification.submittedAt || null,
      reviewedAt: verification.reviewedAt || null,
    };
  }

  async reviewVerification(
    id: string,
    status: VerificationStatus,
    adminNote?: string,
  ): Promise<TechnicianVerification> {
    const verification = await this.verificationRepository.findOne({
      where: { id },
    });

    if (!verification) {
      throw new NotFoundException('Verification request not found');
    }

    verification.status = status;
    (verification as any).adminNote = adminNote || null;
    verification.reviewedAt = new Date();

    return this.verificationRepository.save(verification);
  }
}
