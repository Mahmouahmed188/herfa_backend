import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TrackingSession } from './tracking-session.entity';

@Entity('tracking_locations')
@Index(['trackingSessionId', 'recordedAt'])
@Index(['trackingSessionId'])
@Index(['recordedAt'])
export class TrackingLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackingSessionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  speed: number;

  @Column({ nullable: true })
  heading: number;

  @Column({ type: 'datetime' })
  recordedAt: Date;

  @ManyToOne(() => TrackingSession, (session) => session.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tracking_session_id' })
  trackingSession: TrackingSession;
}
