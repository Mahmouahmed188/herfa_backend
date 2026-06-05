import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentStatusDto {
  @ApiProperty({ example: 'paid', description: 'New payment status' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({
    example: 'Payment confirmed via bank transfer',
    description: 'Notes about the status change',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
