import { ApiProperty } from '@nestjs/swagger';

export class DisputeEvidenceResponseDto {
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
