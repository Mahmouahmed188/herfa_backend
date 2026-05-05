import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Job } from './job.entity';
import { ProviderProfile } from './provider-profile.entity';
import { JobAssignmentStatus } from '../common/constants/user.enums';

@Entity('job_assignments')
@Index(['providerId', 'status'])
@Index(['jobId', 'status'])
export class JobAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (job) => job.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  jobId: string;

  @ManyToOne(() => ProviderProfile, (profile) => profile.jobAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column()
  providerId: string;

  @Column({
    type: 'enum',
    enum: JobAssignmentStatus,
    default: JobAssignmentStatus.PENDING,
  })
  status: JobAssignmentStatus;

  @Column({ nullable: true })
  quotedPrice: number;

  @Column({ nullable: true })
  estimatedArrival: Date;

  @Column({ nullable: true })
  acceptedAt: Date;

  @Column({ nullable: true })
  rejectedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}