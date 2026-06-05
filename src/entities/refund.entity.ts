import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity('refunds')
@Index(['paymentId'])
@Index(['refundedBy'])
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Payment, (payment) => payment.refunds)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column()
  paymentId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  refundAmount: number;

  @Column({ length: 255 })
  refundReason: string;

  @Column()
  refundedBy: string;

  @CreateDateColumn()
  refundedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
