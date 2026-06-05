import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Booking } from './booking.entity';
import { User } from './user.entity';
import { ProviderProfile } from './provider-profile.entity';
import { Job } from './job.entity';
import { ReviewType } from '../common/constants/user.enums';

@Entity('reviews')
@Index(['jobId'])
@Index(['reviewerId'])
@Index(['revieweeId'])
@Index(['bookingId'])
@Index(['customerId'])
@Index(['providerId', 'isVisible', 'createdAt'])
@Unique(['bookingId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (job) => job.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column({ nullable: true })
  jobId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewee_id' })
  reviewee: User;

  @Column()
  revieweeId: string;

  @Column({
    type: 'simple-enum',
    enum: ReviewType,
  })
  type: ReviewType;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column()
  bookingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => ProviderProfile)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column()
  providerId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: true })
  isVisible: boolean;

  @Column({ type: 'datetime', nullable: true })
  editableUntil: Date;

  @Column({ default: false })
  removedByAdmin: boolean;

  @Column({ type: 'text', nullable: true })
  adminRemovalReason: string | null;

  @Column({ type: 'datetime', nullable: true })
  removedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}