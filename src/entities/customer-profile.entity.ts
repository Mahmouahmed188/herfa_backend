import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Job } from './job.entity';

@Entity('customer_profiles')
export class CustomerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.customerProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  defaultAddress: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 8 })
  defaultLatitude: number;

  @Column({ nullable: true, type: 'decimal', precision: 11, scale: 8 })
  defaultLongitude: number;

  @Column({ default: 'en' })
  preferredLanguage: string;

  @Column({ nullable: true })
  preferredCurrency: string;

  @OneToMany(() => Job, (job) => job.customer)
  jobs: Job[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
