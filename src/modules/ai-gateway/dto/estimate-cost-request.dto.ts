import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class EstimateCostRequestDto {
  @ApiProperty({
    description: 'Description of the service needed',
    example: 'Fix a leaking bathroom faucet',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Service category',
    example: 'plumbing',
  })
  @IsString()
  category: string;
}
