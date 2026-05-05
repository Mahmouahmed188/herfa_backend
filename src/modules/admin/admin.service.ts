import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ProviderApplication } from '../../entities/provider-application.entity';
import { Job } from '../../entities/job.entity';
import { Payment } from '../../entities/payment.entity';
import { ProviderApplicationStatus, UserStatus, UserRole, JobStatus, PaymentStatus } from '../../common/constants/user.enums';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProviderApplication)
    private applicationRepository: Repository<ProviderApplication>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalProviders = await this.userRepository.count({ where: { role: UserRole.PROVIDER } });
    const totalCustomers = await this.userRepository.count({ where: { role: UserRole.CUSTOMER } });
    const activeJobs = await this.jobRepository.count({ where: { status: JobStatus.IN_PROGRESS } });
    const completedJobs = await this.jobRepository.count({ where: { status: JobStatus.COMPLETED } });
    const totalRevenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      totalUsers,
      totalProviders,
      totalCustomers,
      activeJobs,
      completedJobs,
      totalRevenue: totalRevenue?.total || 0,
    };
  }

  async getAllUsers(page = 1, limit = 20, role?: string, status?: string) {
    const qb = this.userRepository.createQueryBuilder('user');
    if (role) qb.andWhere('user.role = :role', { role });
    if (status) qb.andWhere('user.status = :status', { status });

    const [users, total] = await qb.skip((page - 1) * limit).take(limit).orderBy('user.createdAt', 'DESC').getManyAndCount();
    return { data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPendingApplications(page = 1, limit = 20) {
    const [applications, total] = await this.applicationRepository.findAndCount({
      where: { status: ProviderApplicationStatus.PENDING },
      relations: ['user', 'providerProfile'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: applications, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async approveApplication(applicationId: string) {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['user'],
    });
    if (!application) throw new NotFoundException('Application not found');

    application.status = ProviderApplicationStatus.APPROVED;
    await this.applicationRepository.save(application);

    if (application.providerProfile) {
      await this.userRepository.manager.query(
        `UPDATE provider_profiles SET verification_status = 'verified' WHERE id = $1`,
        [application.providerProfile.id],
      );
    }

    return { message: 'Application approved' };
  }

  async rejectApplication(applicationId: string, reason: string) {
    const application = await this.applicationRepository.findOne({ where: { id: applicationId } });
    if (!application) throw new NotFoundException('Application not found');

    application.status = ProviderApplicationStatus.REJECTED;
    application.rejectionReason = reason;
    application.reviewedAt = new Date();

    return this.applicationRepository.save(application);
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    await this.userRepository.update(userId, { status });
    return { message: `User status updated to ${status}` };
  }

  async getAllJobs(page = 1, limit = 20, status?: string) {
    const qb = this.jobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.customer', 'customer')
      .leftJoinAndSelect('job.assignments', 'assignments');

    if (status) qb.where('job.status = :status', { status });

    const [jobs, total] = await qb.skip((page - 1) * limit).take(limit).orderBy('job.createdAt', 'DESC').getManyAndCount();
    return { data: jobs, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}