import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ServiceListing } from './service-listing.entity';

@Entity('service_images')
export class ServiceImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ServiceListing, (listing) => listing.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  serviceListing: ServiceListing;

  @Column()
  @Index()
  serviceId: string;

  @Column()
  imageUrl: string;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
