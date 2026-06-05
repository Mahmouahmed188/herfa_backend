import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notification_announcements')
export class NotificationAnnouncement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column()
  targetAudience: string;

  @Column({ nullable: true })
  targetUserId: string;

  @Column()
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
