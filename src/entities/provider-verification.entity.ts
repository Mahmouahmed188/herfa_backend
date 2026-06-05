import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { VerificationDocument } from './verification-document.entity';
import { VerificationHistory } from './verification-history.entity';

export enum VerificationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}

@Entity('provider_verifications')
@Index(['providerId'])
@Index(['status'])
@Index(['submittedAt'])
@Index(['reviewedBy'])
export class ProviderVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  providerId: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  suspensionReason: string;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @OneToMany(() => VerificationDocument, (doc) => doc.verification)
  documents: VerificationDocument[];

  @OneToMany(() => VerificationHistory, (history) => history.verification)
  history: VerificationHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
