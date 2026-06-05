import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';

@Entity('provider_rating_stats')
@Index(['averageRating'])
export class ProviderRatingStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => ProviderProfile)
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column({ unique: true })
  providerId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalReviews: number;

  @Column({ default: 0 })
  fiveStarCount: number;

  @Column({ default: 0 })
  fourStarCount: number;

  @Column({ default: 0 })
  threeStarCount: number;

  @Column({ default: 0 })
  twoStarCount: number;

  @Column({ default: 0 })
  oneStarCount: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
