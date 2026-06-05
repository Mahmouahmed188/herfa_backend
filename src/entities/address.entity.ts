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
import { User } from './user.entity';

@Entity('addresses')
@Index(['userId'])
@Index(['userId', 'isDefault'])
@Index(['createdAt'])
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({ length: 100 })
  label: string;

  @Column({ type: 'text' })
  fullAddress: string;

  @Column({ length: 50 })
  buildingNumber: string;

  @Column({ type: 'int', nullable: true })
  floorNumber: number | null;

  @Column({ type: 'int', nullable: true })
  apartmentNumber: number | null;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  area: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 7 })
  longitude: number;

  @Column({ default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
