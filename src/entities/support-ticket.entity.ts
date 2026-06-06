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
import { TicketMessage } from './ticket-message.entity';
import { TicketCategory } from '../modules/support/enums/ticket-category.enum';
import { TicketStatus } from '../modules/support/enums/ticket-status.enum';
import { TicketPriority } from '../modules/support/enums/ticket-priority.enum';

@Entity('support_tickets')
@Index(['userId'])
@Index(['status'])
@Index(['category'])
@Index(['priority'])
@Index(['assignedAdminId'])
@Index(['createdAt'])
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  ticketNumber: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  category: TicketCategory;

  @Column({ type: 'varchar', length: 20, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'varchar', length: 20, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_admin_id' })
  assignedAdmin: User;

  @Column({ nullable: true })
  assignedAdminId: string;

  @OneToMany(() => TicketMessage, (message) => message.ticket)
  messages: TicketMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
