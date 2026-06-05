import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationAnnouncement } from '../../entities/notification-announcement.entity';
import { NotificationsService } from './notifications.service';
import { CreateAnnouncementDto } from './dto/announcements.dto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationTargetAudience } from '../../common/constants/notification.enums';

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    @InjectRepository(NotificationAnnouncement)
    private announcementRepository: Repository<NotificationAnnouncement>,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  async create(dto: CreateAnnouncementDto, adminId: string) {
    const announcement = this.announcementRepository.create({
      title: dto.title,
      message: dto.message,
      targetAudience: dto.targetAudience,
      targetUserId: dto.targetUserId || null,
      createdBy: adminId,
    });

    const saved = await this.announcementRepository.save(announcement);

    const targetUserIds = await this.resolveTargetAudience(dto);

    for (const userId of targetUserIds) {
      await this.notificationsService.create({
        userId,
        type: 'system' as any,
        title: dto.title,
        message: dto.message,
        relatedEntityType: 'Announcement',
        relatedEntityId: saved.id,
      });
    }

    this.logger.log(`Announcement ${saved.id} sent to ${targetUserIds.length} users`);

    return saved;
  }

  async findAll() {
    const [items, total] = await this.announcementRepository.findAndCount({
      order: { createdAt: 'DESC' },
    });

    return { items, total };
  }

  async delete(id: string) {
    const result = await this.announcementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Announcement not found');
    }
    return { message: 'Announcement deleted' };
  }

  private async resolveTargetAudience(dto: CreateAnnouncementDto): Promise<string[]> {
    switch (dto.targetAudience) {
      case NotificationTargetAudience.ALL: {
        const users = await this.prisma.user.findMany({
          where: { status: 'active' },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }
      case NotificationTargetAudience.CUSTOMERS: {
        const users = await this.prisma.user.findMany({
          where: { role: 'customer', status: 'active' },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }
      case NotificationTargetAudience.PROVIDERS: {
        const users = await this.prisma.user.findMany({
          where: { role: 'provider', status: 'active' },
          select: { id: true },
        });
        return users.map((u) => u.id);
      }
      case NotificationTargetAudience.INDIVIDUAL: {
        if (!dto.targetUserId) {
          throw new BadRequestException('targetUserId is required when targetAudience is "individual"');
        }
        return [dto.targetUserId];
      }
      default:
        return [];
    }
  }
}
