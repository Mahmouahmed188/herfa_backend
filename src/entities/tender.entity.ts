import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';
import { TenderOffer } from './tender-offer.entity';

export enum TenderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('tenders')
export class Tender {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column()
  serviceId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: TenderStatus.OPEN })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  deadline: Date;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  acceptedOfferId: string;

  @OneToMany(() => TenderOffer, (offer) => offer.tender)
  offers: TenderOffer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
