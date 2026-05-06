import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Tender } from './tender.entity';
import { ProviderProfile } from './provider-profile.entity';

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('tender_offers')
export class TenderOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tender, (tender) => tender.offers)
  @JoinColumn({ name: 'tender_id' })
  tender: Tender;

  @Column()
  tenderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column()
  providerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ nullable: true })
  estimatedDays: number;

  @Column({ default: OfferStatus.PENDING })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
