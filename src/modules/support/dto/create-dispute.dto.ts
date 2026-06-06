import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisputeDto {
  @ApiProperty({
    description: 'Booking ID related to the dispute',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @ApiProperty({
    description: 'Dispute title',
    example: 'Service not completed',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Dispute description',
    example: 'The provider left before finishing the job.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
