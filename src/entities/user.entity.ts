import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { CustomerProfile } from './customer-profile.entity';
import { ProviderProfile } from './provider-profile.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phone'], { unique: true })
@Index(['role', 'status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: 'customer' })
  role: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;

  @OneToOne(() => CustomerProfile, (profile) => profile.user, {
    nullable: true,
  })
  customerProfile: CustomerProfile;

  @OneToOne(() => ProviderProfile, (profile) => profile.user, {
    nullable: true,
  })
  providerProfile: ProviderProfile;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
