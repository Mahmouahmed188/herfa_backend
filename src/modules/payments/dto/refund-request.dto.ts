import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundRequestDto {
  @ApiProperty({ example: 50.0, description: 'Refund amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    example: 'Customer requested partial refund for incomplete service',
    description: 'Reason for refund',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
