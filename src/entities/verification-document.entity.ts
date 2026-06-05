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

export enum DocumentType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  DRIVER_LICENSE = 'driver_license',
  PROFESSIONAL_LICENSE = 'professional_license',
  COMMERCIAL_REGISTRATION = 'commercial_registration',
}

@Entity('verification_documents')
@Index(['verificationId'])
@Index(['documentType'])
export class VerificationDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  verificationId: string;

  @ManyToOne(() => ProviderVerification, (pv) => pv.documents)
  @JoinColumn({ name: 'verificationId' })
  verification: ProviderVerification;

  @Column()
  documentType: string;

  @Column()
  documentUrl: string;

  @Column({ nullable: true })
  originalName: string;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true, type: 'int' })
  fileSize: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
