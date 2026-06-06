import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('ai_health_monitors')
@Index(['serviceName'], { unique: true })
@Index(['state'])
export class AiHealthMonitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_name', length: 100, unique: true })
  serviceName: string;

  @Column({ length: 20, default: 'closed' })
  state: string;

  @Column({ name: 'consecutive_failures', default: 0 })
  consecutiveFailures: number;

  @Column({ name: 'last_failure_at', type: 'datetime', nullable: true })
  lastFailureAt: Date | null;

  @Column({ name: 'last_success_at', type: 'datetime', nullable: true })
  lastSuccessAt: Date | null;

  @Column({ name: 'cooldown_until', type: 'datetime', nullable: true })
  cooldownUntil: Date | null;

  @Column({ name: 'total_requests', default: 0 })
  totalRequests: number;

  @Column({ name: 'total_failures', default: 0 })
  totalFailures: number;

  @Column({ name: 'total_successes', default: 0 })
  totalSuccesses: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
