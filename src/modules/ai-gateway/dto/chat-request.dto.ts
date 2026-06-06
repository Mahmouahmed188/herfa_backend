import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    description: 'User chat message',
    example: 'How do I fix a leaking faucet?',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message: string;
}
