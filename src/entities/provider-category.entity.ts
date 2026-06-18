import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { ProviderProfile } from './provider-profile.entity';
import { ServiceCategory } from './service-category.entity';

@Entity('provider_categories')
@Unique(['providerId', 'categoryId'])
export class ProviderCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProviderProfile, (profile) => profile.categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id' })
  provider: ProviderProfile;

  @Column()
  @Index()
  providerId: string;

  @ManyToOne(() => ServiceCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column()
  @Index()
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;
}
