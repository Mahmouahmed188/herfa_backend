import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class OcrRequestDto {
  @ApiProperty({
    description: 'Type of document',
    enum: ['national_id', 'passport', 'professional_license'],
    example: 'national_id',
  })
  @IsString()
  @IsIn(['national_id', 'passport', 'professional_license'])
  documentType: string;
}
