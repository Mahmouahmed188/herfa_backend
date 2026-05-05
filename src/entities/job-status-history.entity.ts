import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from './job.entity';
import { JobStatus } from '../common/constants/user.enums';

@Entity('job_status_history')
export class JobStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, (job) => job.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @Column()
  jobId: string;

  @Column({
    type: 'enum',
    enum: JobStatus,
  })
  status: JobStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  changedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}