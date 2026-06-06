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
import { SupportTicket } from './support-ticket.entity';

@Entity('ticket_messages')
@Index(['ticketId'])
@Index(['senderId'])
@Index(['createdAt'])
export class TicketMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages)
  @JoinColumn({ name: 'ticket_id' })
  ticket: SupportTicket;

  @Column()
  ticketId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column()
  senderId: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;
}
