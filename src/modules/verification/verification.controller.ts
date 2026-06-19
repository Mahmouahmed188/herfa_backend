import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';

const ALLOWED_IMAGE_TYPES = /\.(jpg|jpeg|png|webp)$/i;
const ALLOWED_CERTIFICATE_TYPES = /\.(jpg|jpeg|png|webp|pdf)$/i;
const MAX_FILE_SIZE = parseInt(
  process.env.UPLOAD_MAX_FILE_SIZE || '10485760',
  10,
);

@ApiTags('Verification')
@ApiBearerAuth()
@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.PROVIDER)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'frontIdImage', maxCount: 1 },
        { name: 'backIdImage', maxCount: 1 },
        { name: 'personalPhoto', maxCount: 1 },
        { name: 'certificates[]', maxCount: 10 },
        { name: 'portfolio[]', maxCount: 10 },
      ],
      {
        storage: diskStorage({
          destination: (_req, _file, cb) => {
            const dir = './uploads/verification';
            if (!existsSync(dir)) {
              mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
          },
          filename: (_req, file, cb) => {
            const ext = extname(file.originalname);
            const name = Array(32)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('');
            cb(null, `${name}${ext}`);
          },
        }),
        fileFilter: (_req, file, cb) => {
          if (file.fieldname === 'certificates[]') {
            if (!ALLOWED_CERTIFICATE_TYPES.test(file.originalname)) {
              return cb(
                new BadRequestException(
                  'Certificates must be jpg, jpeg, png, webp, or pdf files',
                ),
                false,
              );
            }
          } else {
            if (!ALLOWED_IMAGE_TYPES.test(file.originalname)) {
              return cb(
                new BadRequestException(
                  'Images must be jpg, jpeg, png, or webp files',
                ),
                false,
              );
            }
          }
          cb(null, true);
        },
        limits: { fileSize: MAX_FILE_SIZE },
      },
    ),
  )
  @ApiOperation({
    summary: 'Submit provider verification with file uploads',
    description:
      'Upload verification documents as multipart files. frontIdImage, backIdImage, and personalPhoto are required. certificates[] and portfolio[] are optional.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        frontIdImage: {
          type: 'string',
          format: 'binary',
          description: 'Front side of national ID (required)',
        },
        backIdImage: {
          type: 'string',
          format: 'binary',
          description: 'Back side of national ID (required)',
        },
        personalPhoto: {
          type: 'string',
          format: 'binary',
          description: 'Personal profile photo (required)',
        },
        'certificates[]': {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Skills & certificates files (optional)',
        },
        'portfolio[]': {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Work portfolio images (optional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Verification submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Missing required files or validation error',
  })
  async submit(
    @CurrentUser() user: any,
    @UploadedFiles()
    files: {
      frontIdImage?: Express.Multer.File[];
      backIdImage?: Express.Multer.File[];
      personalPhoto?: Express.Multer.File[];
      'certificates[]'?: Express.Multer.File[];
      'portfolio[]'?: Express.Multer.File[];
    },
  ) {
    if (!files.frontIdImage?.[0]) {
      throw new BadRequestException('Front ID image is required');
    }
    if (!files.backIdImage?.[0]) {
      throw new BadRequestException('Back ID image is required');
    }
    if (!files.personalPhoto?.[0]) {
      throw new BadRequestException('Personal photo is required');
    }

    const result = await this.verificationService.submitVerification(
      user.id,
      files,
    );

    return {
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        status: result.status,
      },
    };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get verification status',
    description:
      'Get the current verification status for the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'Current verification status' })
  async getStatus(@CurrentUser() user: any) {
    return this.verificationService.getStatus(user.id);
  }
}
