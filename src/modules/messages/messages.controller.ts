import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard, VerificationGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(
    @CurrentUser() user: any,
    @Body()
    body: {
      receiverId: string;
      content: string;
      relatedType?: string;
      relatedId?: string;
    },
  ) {
    return this.messagesService.sendMessage(
      user.id,
      body.receiverId,
      body.content,
      body.relatedType,
      body.relatedId,
    );
  }

  @Get()
  async getMyConversations(@CurrentUser() user: any) {
    return this.messagesService.getMyConversations(user.id);
  }

  @Get(':otherUserId')
  async getConversation(
    @CurrentUser() user: any,
    @Param('otherUserId') otherUserId: string,
  ) {
    return this.messagesService.getConversation(user.id, otherUserId);
  }

  @Patch(':id/read')
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.messagesService.markAsRead(user.id, id);
  }
}
