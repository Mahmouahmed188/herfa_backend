import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('technician_verifications')
@Index(['userId'])
@Index(['status'])
export class TechnicianVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  frontIdImageUrl: string;

  @Column({ nullable: true })
  backIdImageUrl: string;

  @Column({ nullable: true })
  personalPhotoUrl: string;

  @Column('simple-array', { nullable: true })
  certificatesUrls: string[];

  @Column('simple-array', { nullable: true })
  portfolioUrls: string[];

  @Column({
    type: 'varchar',
    default: VerificationStatus.UNVERIFIED,
  })
  status: VerificationStatus;

  @Column({ nullable: true })
  adminNote: string;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  reviewedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
