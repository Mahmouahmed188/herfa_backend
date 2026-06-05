import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { TrackingSession } from './tracking-session.entity';

@Entity('tracking_audit_events')
@Index(['trackingSessionId'])
@Index(['createdAt'])
export class TrackingAuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trackingSessionId: string;

  @Column({ length: 30 })
  eventType: string;

  @Column({ length: 20, nullable: true })
  previousStatus: string;

  @Column({ length: 20 })
  newStatus: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => TrackingSession, (session) => session.auditEvents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tracking_session_id' })
  trackingSession: TrackingSession;
}
