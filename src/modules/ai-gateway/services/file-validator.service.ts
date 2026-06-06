import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class FileValidatorService {
  validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new HttpException(
        {
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: 'Image file is required.',
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const ext = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      throw new HttpException(
        {
          success: false,
          errorCode: 'UNSUPPORTED_FILE_TYPE',
          message: `Unsupported file format. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        },
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new HttpException(
        {
          success: false,
          errorCode: 'UNSUPPORTED_FILE_TYPE',
          message: `Unsupported file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
        },
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new HttpException(
        {
          success: false,
          errorCode: 'FILE_TOO_LARGE',
          message: `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
        },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }
  }

  validateDocumentFile(file: Express.Multer.File): void {
    this.validateImageFile(file);
  }

  validateFileCount(files: Express.Multer.File[], maxCount: number): void {
    if (files.length > maxCount) {
      throw new HttpException(
        {
          success: false,
          errorCode: 'VALIDATION_ERROR',
          message: `Maximum ${maxCount} files allowed per request.`,
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
