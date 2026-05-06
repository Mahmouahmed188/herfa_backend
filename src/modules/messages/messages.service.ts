import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string, relatedType?: string, relatedId?: string) {
    const message = this.messageRepository.create({
      senderId,
      receiverId,
      content,
      relatedType,
      relatedId,
    });
    return this.messageRepository.save(message);
  }

  async getMyConversations(userId: string) {
    // This is a simplified version: get all messages where user is sender or receiver
    // In a real app, you'd group by the other participant
    return this.messageRepository.find({
      where: [
        { senderId: userId },
        { receiverId: userId },
      ],
      order: { createdAt: 'DESC' },
      relations: ['sender', 'receiver'],
    });
  }

  async getConversation(userId: string, otherUserId: string) {
    return this.messageRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  async markAsRead(userId: string, messageId: string) {
    return this.messageRepository.update(
      { id: messageId, receiverId: userId },
      { isRead: true },
    );
  }
}
