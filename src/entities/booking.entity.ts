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
import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';
import { BookingStatusHistory } from './booking-status-history.entity';

export enum BookingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ON_THE_WAY = 'on_the_way',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
@Index(['customerId', 'status'])
@Index(['providerId', 'status'])
@Index(['status'])
@Index(['scheduledDate'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  bookingNumber: string;

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

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column()
  serviceId: string;

  @Column({ length: 255 })
  addressLine: string;

  @Column({ length: 100 })
  city: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'date' })
  scheduledDate: string;

  @Column({ type: 'time' })
  scheduledTime: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: BookingStatus.PENDING })
  status: string;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @OneToMany(() => BookingStatusHistory, (history) => history.booking)
  statusHistory: BookingStatusHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
