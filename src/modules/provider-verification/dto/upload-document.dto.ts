import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentType } from '../../../entities/verification-document.entity';

export class UploadDocumentDto {
  @ApiProperty({
    enum: DocumentType,
    example: DocumentType.NATIONAL_ID,
    description: 'Type of document being uploaded',
  })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  documentType: DocumentType;
}
