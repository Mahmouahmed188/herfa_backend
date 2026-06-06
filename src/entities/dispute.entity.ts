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
import { Booking } from './booking.entity';
import { DisputeEvidence } from './dispute-evidence.entity';
import { DisputeStatus } from '../modules/support/enums/dispute-status.enum';

@Entity('disputes')
@Index(['bookingId'])
@Index(['customerId'])
@Index(['providerId'])
@Index(['status'])
@Index(['createdAt'])
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column()
  providerId: string;

  @Column({ type: 'varchar', length: 30, default: DisputeStatus.OPEN })
  status: DisputeStatus;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'resolved_by' })
  resolvedByUser: User;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ nullable: true })
  resolvedAt: Date;

  @OneToMany(() => DisputeEvidence, (evidence) => evidence.dispute)
  evidence: DisputeEvidence[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
