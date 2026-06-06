import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'I have attached the receipt screenshot.',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
