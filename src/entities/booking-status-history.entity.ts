import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('booking_status_history')
@Index(['bookingId'])
@Index(['createdAt'])
export class BookingStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Booking, (booking) => booking.statusHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column()
  bookingId: string;

  @Column({ type: 'varchar', nullable: true })
  oldStatus: string | null;

  @Column()
  newStatus: string;

  @Column()
  changedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
