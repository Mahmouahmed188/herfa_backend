import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Review } from './review.entity';
import { User } from './user.entity';

@Entity('moderation_logs')
@Index(['reviewId'])
@Index(['adminId'])
@Index(['createdAt'])
export class ModerationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Review)
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column()
  reviewId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @Column()
  adminId: string;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
