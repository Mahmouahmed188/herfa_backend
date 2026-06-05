import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Booking } from './booking.entity';
import { User } from './user.entity';
import { Refund } from './refund.entity';

@Entity('payments')
@Index(['bookingId'])
@Index(['customerId'])
@Index(['providerId'])
@Index(['paymentStatus'])
@Index(['paymentStatus', 'createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 30 })
  paymentNumber: string;

  @ManyToOne(() => Booking, (booking) => booking.payments)
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

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'EGP' })
  currency: string;

  @Column({ length: 30 })
  paymentMethod: string;

  @Column({ length: 20, default: 'pending' })
  paymentStatus: string;

  @Column({ length: 255, nullable: true })
  transactionReference: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  paidAt: Date;

  @OneToMany(() => Refund, (refund) => refund.payment)
  refunds: Refund[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
