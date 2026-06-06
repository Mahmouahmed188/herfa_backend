import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({
    description: 'AI-generated reply',
    example: 'To fix a leaking faucet, first turn off the water supply...',
  })
  reply: string;

  @ApiProperty({
    description: 'Conversation ID for future context support',
    required: false,
    example: null,
  })
  conversationId: string | null;
}
