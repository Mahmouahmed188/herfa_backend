import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('analytics_snapshots')
@Index(['snapshotType'])
@Index(['generatedAt'])
@Index(['snapshotType', 'generatedAt'])
export class AnalyticsSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  snapshotType: string;

  @Column({ type: 'json' })
  data: Record<string, any>;

  @CreateDateColumn()
  generatedAt: Date;
}
