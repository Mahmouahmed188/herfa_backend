import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { ProviderVerificationService } from './provider-verification.service';
import { DocumentService } from './services/document.service';
import { HistoryService } from './services/history.service';
import { VerificationOwnerGuard } from './guards/verification-owner.guard';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { VerificationStatusResponseDto } from './dto/verification-status-response.dto';
import { VerificationDocumentResponseDto } from './dto/verification-documents-response.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@ApiTags('Provider Verification')
@ApiBearerAuth()
@Controller('provider-verification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
export class ProviderVerificationController {
  constructor(
    private readonly verificationService: ProviderVerificationService,
    private readonly documentService: DocumentService,
    private readonly historyService: HistoryService,
  ) {}

  @Post('submit')
  @ApiOperation({
    summary: 'Submit verification request',
    description: 'Submit verification documents for admin review. Status changes from pending to under_review.',
  })
  @ApiResponse({ status: 201, description: 'Verification submitted successfully', type: VerificationStatusResponseDto })
  @ApiResponse({ status: 400, description: 'Missing documents or already submitted' })
  @ApiResponse({ status: 404, description: 'Provider profile not found' })
  async submit(
    @CurrentUser() user: any,
    @Body() dto: SubmitVerificationDto,
  ) {
    const verification = await this.verificationService.submit(user.id, dto.notes);
    return {
      id: verification.id,
      status: verification.status,
      submittedAt: verification.submittedAt,
      message: 'Verification submitted successfully',
    };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get verification status',
    description: 'Get the current verification status for the authenticated provider.',
  })
  @ApiResponse({ status: 200, description: 'Current verification status', type: VerificationStatusResponseDto })
  @ApiResponse({ status: 404, description: 'No verification record found' })
  async getStatus(@CurrentUser() user: any) {
    const verification = await this.verificationService.getStatus(user.id);
    return {
      id: verification.id,
      status: verification.status,
      submittedAt: verification.submittedAt,
      reviewedAt: verification.reviewedAt,
      reviewedBy: verification.reviewedBy,
      rejectionReason: verification.rejectionReason,
      suspensionReason: verification.suspensionReason,
    };
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get verification history',
    description: 'Get the chronological history of all status changes for the authenticated provider.',
  })
  @ApiResponse({ status: 200, description: 'List of verification history entries' })
  @ApiResponse({ status: 404, description: 'No verification record found' })
  async getHistory(@CurrentUser() user: any) {
    const verification = await this.verificationService.getStatus(user.id);
    const history = await this.historyService.findByVerificationId(verification.id);
    return history.map((entry) => ({
      id: entry.id,
      oldStatus: entry.oldStatus,
      newStatus: entry.newStatus,
      changedBy: entry.changedBy,
      changedByRole: entry.changedByRole,
      notes: entry.notes,
      createdAt: entry.createdAt,
    }));
  }

  @Get('documents')
  @ApiOperation({
    summary: 'List uploaded documents',
    description: 'List all verification documents uploaded by the authenticated provider.',
  })
  @ApiResponse({ status: 200, description: 'List of documents', type: [VerificationDocumentResponseDto] })
  async getDocuments(@CurrentUser() user: any) {
    return this.documentService.findByProviderId(user.id);
  }

  @Post('documents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          const name = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
          cb(null, `${name}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
          return cb(new BadRequestException('Only image and pdf files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiOperation({
    summary: 'Upload a verification document',
    description: 'Upload a verification document (jpg, jpeg, png, pdf; max 10MB).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        documentType: {
          type: 'string',
          enum: ['national_id', 'passport', 'driver_license', 'professional_license', 'commercial_registration'],
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully', type: VerificationDocumentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadDocument(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const document = await this.documentService.upload(file, dto.documentType, user.id);
    return {
      id: document.id,
      documentType: document.documentType,
      documentUrl: document.documentUrl,
      originalName: document.originalName,
      uploadedAt: document.uploadedAt,
    };
  }

  @Delete('documents/:id')
  @UseGuards(VerificationOwnerGuard)
  @ApiOperation({
    summary: 'Delete a verification document',
    description: 'Delete an uploaded document. Only allowed when verification status is pending.',
  })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete when under review' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    await this.documentService.delete(id, user.id);
    return { message: 'Document deleted successfully' };
  }
}
