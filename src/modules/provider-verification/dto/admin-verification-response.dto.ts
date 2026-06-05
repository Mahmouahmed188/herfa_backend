import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationDocumentResponseDto } from './verification-documents-response.dto';

class ProviderBriefDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: "John's Plumbing" })
  businessName: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;
}

class HistoryEntryDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiPropertyOptional({ example: null })
  oldStatus: string;

  @ApiProperty({ example: 'under_review' })
  newStatus: string;

  @ApiProperty({ example: 'uuid' })
  changedBy: string;

  @ApiProperty({ example: 'provider' })
  changedByRole: string;

  @ApiPropertyOptional({ example: 'Provider submitted verification' })
  notes: string;

  @ApiProperty({ example: '2026-06-05T10:00:00.000Z' })
  createdAt: Date;
}

export class AdminVerificationListItemDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  providerId: string;

  @ApiProperty({ example: "John's Plumbing" })
  providerName: string;

  @ApiProperty({ example: 'john@example.com' })
  providerEmail: string;

  @ApiProperty({ example: 'under_review' })
  status: string;

  @ApiPropertyOptional({ example: '2026-06-05T10:00:00.000Z' })
  submittedAt: Date;

  @ApiPropertyOptional()
  reviewedAt: Date;

  @ApiPropertyOptional()
  reviewedBy: string;

  @ApiProperty({ example: 2 })
  documentCount: number;
}

export class AdminVerificationDetailDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ type: ProviderBriefDto })
  provider: ProviderBriefDto;

  @ApiProperty({ example: 'under_review' })
  status: string;

  @ApiPropertyOptional()
  submittedAt: Date;

  @ApiPropertyOptional()
  reviewedAt: Date;

  @ApiPropertyOptional()
  reviewedBy: string;

  @ApiPropertyOptional()
  rejectionReason: string;

  @ApiPropertyOptional()
  suspensionReason: string;

  @ApiProperty({ type: [VerificationDocumentResponseDto] })
  documents: VerificationDocumentResponseDto[];

  @ApiProperty({ type: [HistoryEntryDto] })
  history: HistoryEntryDto[];
}

export class AdminVerificationListMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class AdminVerificationListDto {
  @ApiProperty({ type: [AdminVerificationListItemDto] })
  data: AdminVerificationListItemDto[];

  @ApiProperty({ type: AdminVerificationListMetaDto })
  meta: AdminVerificationListMetaDto;
}
