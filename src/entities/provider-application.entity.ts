import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { ProviderApplicationStatus } from '../common/constants/user.enums';
import { User } from './user.entity';

@Entity('provider_applications')
export class ProviderApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  providerProfileId: string;

  @ManyToOne(() => ProviderProfile, (profile) => profile.applications, { nullable: true })
  @JoinColumn({ name: 'provider_profile_id' })
  providerProfile: ProviderProfile;

  @Column({
    type: 'enum',
    enum: ProviderApplicationStatus,
    default: ProviderApplicationStatus.PENDING,
  })
  status: ProviderApplicationStatus;

  @Column({ nullable: true })
  businessName: string;

  @Column({ nullable: true })
  businessDescription: string;

  @Column({ nullable: true })
  nationalId: string;

  @Column({ nullable: true })
  nationalIdImage: string;

  @Column({ nullable: true })
  licenseImage: string;

  @Column({ nullable: true })
  portfolioImages: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}