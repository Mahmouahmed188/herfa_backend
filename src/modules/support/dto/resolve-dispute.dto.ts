import { IsNotEmpty, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveDisputeDto {
  @ApiProperty({
    description: 'Resolution notes',
    example:
      'Provider failed to complete service. Full refund issued to customer.',
  })
  @IsNotEmpty()
  @IsString()
  resolution: string;

  @ApiProperty({
    description: 'Favored party',
    enum: ['customer', 'provider'],
    example: 'customer',
  })
  @IsNotEmpty()
  @IsIn(['customer', 'provider'])
  resolvedInFavorOf: 'customer' | 'provider';
}
