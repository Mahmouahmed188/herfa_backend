import { ApiProperty } from '@nestjs/swagger';

export class CreateDisputeEvidenceDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Evidence file (jpg, jpeg, png, gif, webp, pdf, doc, docx)',
  })
  file: any;
}
