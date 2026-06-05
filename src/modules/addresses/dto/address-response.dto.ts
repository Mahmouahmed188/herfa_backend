import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty({ description: 'Address ID' })
  id: string;

  @ApiProperty({ description: 'Owner user ID' })
  userId: string;

  @ApiProperty({ description: 'Address label' })
  label: string;

  @ApiProperty({ description: 'Full address text' })
  fullAddress: string;

  @ApiProperty({ description: 'Building number' })
  buildingNumber: string;

  @ApiProperty({ description: 'Floor number', nullable: true })
  floorNumber: number | null;

  @ApiProperty({ description: 'Apartment number', nullable: true })
  apartmentNumber: number | null;

  @ApiProperty({ description: 'City' })
  city: string;

  @ApiProperty({ description: 'Area/district' })
  area: string;

  @ApiProperty({ description: 'Latitude' })
  latitude: number;

  @ApiProperty({ description: 'Longitude' })
  longitude: number;

  @ApiProperty({ description: 'Whether this is the default address' })
  isDefault: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
