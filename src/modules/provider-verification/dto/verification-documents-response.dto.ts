import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerificationDocumentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'national_id' })
  documentType: string;

  @ApiProperty({ example: '/uploads/abc123.pdf' })
  documentUrl: string;

  @ApiPropertyOptional({ example: 'id-card.pdf' })
  originalName: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  mimeType: string;

  @ApiPropertyOptional({ example: 204800 })
  fileSize: number;

  @ApiProperty({ example: '2026-06-05T09:00:00.000Z' })
  uploadedAt: Date;
}
