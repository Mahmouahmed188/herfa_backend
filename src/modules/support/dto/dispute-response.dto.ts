import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisputeStatus } from '../enums/dispute-status.enum';

class DisputeEvidenceInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  disputeId: string;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  fileType: string;

  @ApiProperty()
  uploadedAt: Date;
}

export class DisputeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  providerId: string;

  @ApiProperty({ enum: DisputeStatus })
  status: DisputeStatus;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  resolution: string;

  @ApiProperty({ nullable: true })
  resolvedBy: string;

  @ApiProperty({ nullable: true })
  resolvedAt: Date;

  @ApiPropertyOptional({ type: [DisputeEvidenceInfo] })
  evidence?: DisputeEvidenceInfo[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedDisputeResponseDto {
  @ApiProperty({ isArray: true, type: DisputeResponseDto })
  data: DisputeResponseDto[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
