import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: false, description: 'Always false for errors' })
  success: boolean;

  @ApiProperty({
    example: 'AI_SERVICE_UNAVAILABLE',
    description: 'Error code for the specific error type',
    enum: [
      'UNAUTHORIZED',
      'VALIDATION_ERROR',
      'RATE_LIMIT_EXCEEDED',
      'FILE_TOO_LARGE',
      'UNSUPPORTED_FILE_TYPE',
      'AI_SERVICE_UNAVAILABLE',
      'AI_REQUEST_TIMEOUT',
      'INTERNAL_ERROR',
    ],
  })
  errorCode: string;

  @ApiProperty({
    example: 'AI service is temporarily unavailable. Please try again later.',
    description: 'Human-readable error message',
  })
  message: string;
}
