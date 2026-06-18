import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_locations')
@Index(['providerId', 'updatedAt'])
export class ProviderLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column()
  providerId: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ nullable: true })
  accuracy: number;

  @Column({ nullable: true })
  speed: number;

  @Column({ nullable: true })
  heading: number;

  @Column({ nullable: true })
  altitude: number;

  @Column({ nullable: true })
  batteryLevel: number;

  @Column({ default: true })
  isOnline: boolean;

  @Column({ default: false })
  isOnJob: boolean;

  @Column({ nullable: true })
  currentJobId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
