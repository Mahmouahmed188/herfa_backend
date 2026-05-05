import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Job } from './job.entity';
import { User } from './user.entity';
import { ReviewType } from '../common/constants/user.enums';

@Entity('reviews')
@Index(['jobId'])
@Index(['reviewerId'])
@Index(['revieweeId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (job) => job.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
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

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: true })
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;
}