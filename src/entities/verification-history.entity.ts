import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProviderVerification } from './provider-verification.entity';

@Entity('verification_history')
@Index(['verificationId'])
@Index(['changedBy'])
@Index(['createdAt'])
export class VerificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  verificationId: string;

  @ManyToOne(() => ProviderVerification, (pv) => pv.history)
  @JoinColumn({ name: 'verificationId' })
  verification: ProviderVerification;

  @Column({ nullable: true })
  oldStatus: string;

  @Column()
  newStatus: string;

  @Column()
  changedBy: string;

  @Column()
  changedByRole: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
