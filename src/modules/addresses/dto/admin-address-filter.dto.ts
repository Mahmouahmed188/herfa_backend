import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddressFilterDto } from './address-filter.dto';

export class AdminAddressFilterDto extends AddressFilterDto {
  @IsUUID()
  @ApiProperty({ description: 'Customer user ID to filter addresses by' })
  userId: string;
}
