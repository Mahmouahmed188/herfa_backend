import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { JobStatusHistory } from './job-status-history.entity';
import { JobAssignment } from './job-assignment.entity';
import { Review } from './review.entity';
import { Payment } from './payment.entity';

@Entity('jobs')
@Index(['customerId', 'status'])
@Index(['status', 'createdAt'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column()
  customerId: string;

  @Column()
  serviceId: string;

  @Column({ nullable: true })
  providerId: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalPrice: number;

  @Column({ nullable: true })
  scheduledDate: Date;

  @Column({ nullable: true })
  scheduledTime: string;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @OneToMany(() => JobStatusHistory, (history) => history.job)
  statusHistory: JobStatusHistory[];

  @OneToMany(() => JobAssignment, (assignment) => assignment.job)
  assignments: JobAssignment[];

  @OneToMany(() => Review, (review) => review.job)
  reviews: Review[];

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
