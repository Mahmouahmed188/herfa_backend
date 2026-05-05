import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from './job.entity';

@Entity('job_status_history')
export class JobStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (job) => job.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  jobId: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  changedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}