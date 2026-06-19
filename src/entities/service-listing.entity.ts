import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { ServiceCategory } from './service-category.entity';
import { ServiceImage } from './service-image.entity';

@Entity('service_listings')
export class ServiceListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column()
  @Index()
  providerId: string;

  @ManyToOne(() => ServiceCategory)
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column({ nullable: true })
  categoryId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ default: 'EGP' })
  currency: string;

  @Column()
  estimatedDurationMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ServiceImage, (img) => img.serviceListing)
  images: ServiceImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
