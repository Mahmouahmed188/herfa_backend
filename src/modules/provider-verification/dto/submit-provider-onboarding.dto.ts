import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

export class SubmitProviderOnboardingDto {
  @ApiProperty({
    description: 'URL of the national ID front side image',
    example: 'https://cdn.herfa.com/id-front.jpg',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  frontIdImage: string;

  @ApiProperty({
    description: 'URL of the national ID back side image',
    example: 'https://cdn.herfa.com/id-back.jpg',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  backIdImage: string;

  @ApiProperty({
    description: 'URL of the personal profile photo',
    example: 'https://cdn.herfa.com/photo.jpg',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  personalPhoto: string;

  @ApiPropertyOptional({
    description: 'Array of document URLs (trade certificates, professional licenses, etc.)',
    example: ['https://cdn.herfa.com/cert.pdf'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  documents?: string[];

  @ApiPropertyOptional({
    description: 'Array of portfolio image URLs (work samples, project photos)',
    example: ['https://cdn.herfa.com/work1.jpg'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  portfolio?: string[];
}
