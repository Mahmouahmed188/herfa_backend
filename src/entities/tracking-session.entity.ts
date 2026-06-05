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
import { Booking } from './booking.entity';
import { TrackingLocation } from './tracking-location.entity';
import { TrackingAuditEvent } from './tracking-audit-event.entity';
import { TrackingSessionStatus } from '../modules/tracking/enums/tracking-session-status.enum';

@Entity('tracking_sessions')
@Index(['providerId'])
@Index(['customerId'])
@Index(['status'])
@Index(['providerId', 'status'])
@Index(['customerId', 'status'])
@Index(['createdAt'])
export class TrackingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  bookingId: string;

  @Column()
  providerId: string;

  @Column()
  customerId: string;

  @Column({
    type: 'enum',
    enum: TrackingSessionStatus,
    default: TrackingSessionStatus.INACTIVE,
  })
  status: TrackingSessionStatus;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @OneToMany(() => TrackingLocation, (location) => location.trackingSession)
  locations: TrackingLocation[];

  @OneToMany(() => TrackingAuditEvent, (event) => event.trackingSession)
  auditEvents: TrackingAuditEvent[];
}
