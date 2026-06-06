import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Dispute } from './dispute.entity';

@Entity('dispute_evidence')
@Index(['disputeId'])
@Index(['uploadedBy'])
export class DisputeEvidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Dispute, (dispute) => dispute.evidence)
  @JoinColumn({ name: 'dispute_id' })
  dispute: Dispute;

  @Column()
  disputeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByUser: User;

  @Column()
  uploadedBy: string;

  @Column({ length: 500 })
  fileUrl: string;

  @Column({ length: 50 })
  fileType: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
