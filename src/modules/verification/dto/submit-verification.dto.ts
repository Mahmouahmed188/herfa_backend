import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class SubmitVerificationDto {
  @ApiProperty({
    description: 'URL of the front side of national ID',
    example: 'https://cdn.herfa.com/id-front.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  frontIdImage: string;

  @ApiProperty({
    description: 'URL of the back side of national ID',
    example: 'https://cdn.herfa.com/id-back.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  backIdImage: string;

  @ApiProperty({
    description: 'URL of the personal profile photo',
    example: 'https://cdn.herfa.com/photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  personalPhoto: string;

  @ApiPropertyOptional({
    description: 'Array of certificate/document URLs',
    example: ['https://cdn.herfa.com/cert.pdf'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  documents?: string[];

  @ApiPropertyOptional({
    description: 'Array of portfolio image URLs',
    example: ['https://cdn.herfa.com/work1.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  portfolio?: string[];
}
