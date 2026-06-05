import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '../../../entities/booking.entity';

const VALID_MANUAL_STATUSES = [
  BookingStatus.ACCEPTED,
  BookingStatus.REJECTED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
];

export class UpdateStatusDto {
  @ApiProperty({
    description: 'Target status for the booking',
    enum: VALID_MANUAL_STATUSES,
    example: 'accepted',
  })
  @IsString()
  @IsIn(VALID_MANUAL_STATUSES, { message: 'Invalid target status' })
  status: string;
}
