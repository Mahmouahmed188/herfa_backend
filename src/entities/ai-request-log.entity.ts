import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_request_logs')
@Index(['userId'])
@Index(['featureType'])
@Index(['status'])
@Index(['createdAt'])
@Index(['userId', 'featureType'])
export class AiRequestLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ length: 30 })
  featureType: string;

  @Column({ type: 'json' })
  requestPayload: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  responsePayload: Record<string, any> | null;

  @Column({ length: 20 })
  status: string;

  @Column({ name: 'processing_time', type: 'int', nullable: true })
  processingTime: number | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
