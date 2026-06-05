import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { ProviderVerificationStatus } from '../common/constants/user.enums';
import { ProviderApplication } from './provider-application.entity';
import { ProviderCategory } from './provider-category.entity';
import { JobAssignment } from './job-assignment.entity';
import { ProviderService } from './provider-service.entity';

@Entity('provider_profiles')
export class ProviderProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.providerProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  businessDescription: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ nullable: true, type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ default: false })
  isAvailable: boolean;

  @Column({ nullable: true })
  serviceRadiusKm: number;

  @Column({ default: 'pending' })
  verificationStatus: string;

  @Column({ nullable: true })
  nationalId: string;

  @Column({ nullable: true })
  nationalIdImage: string;

  @Column({ nullable: true })
  licenseImage: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  portfolioImages: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true, type: 'decimal', precision: 3, scale: 2 })
  rating: number;

  @Column({ default: 0 })
  totalJobsCompleted: number;

  @Column({ default: 0 })
  totalEarnings: number;

  @Column({ default: 0 })
  responseTimeMinutes: number;

  @OneToMany(() => ProviderApplication, (app) => app.providerProfile)
  applications: ProviderApplication[];

  @OneToMany(() => JobAssignment, (assignment) => assignment.provider)
  jobAssignments: JobAssignment[];

  @OneToMany(() => ProviderService, (ps) => ps.provider)
  services: ProviderService[];

  @OneToMany(() => ProviderCategory, (pc) => pc.provider)
  categories: ProviderCategory[];

  @Column({ nullable: true })
  experienceYears: number;

  @Column({ nullable: true })
  workingHours: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}