import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage, diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiGatewayService } from './services/ai-gateway.service';
import { FileValidatorService } from './services/file-validator.service';
import { AiRateLimitGuard } from './guards/ai-rate-limit.guard';
import { AiLoggingInterceptor } from './interceptors/ai-logging.interceptor';
import { AiFeatureType } from './enums/ai-feature-type.enum';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { ClassifyServiceRequestDto } from './dto/classify-service-request.dto';
import { ClassifyServiceResponseDto } from './dto/classify-service-response.dto';
import { AnalyzeImageResponseDto } from './dto/analyze-image-response.dto';
import { EstimateCostRequestDto } from './dto/estimate-cost-request.dto';
import { EstimateCostResponseDto } from './dto/estimate-cost-response.dto';
import { RecommendProviderRequestDto } from './dto/recommend-provider-request.dto';
import { RecommendProviderResponseDto } from './dto/recommend-provider-response.dto';
import { OcrRequestDto } from './dto/ocr-request.dto';
import { OcrResponseDto } from './dto/ocr-response.dto';
import { ErrorResponseDto } from './dto/error-response.dto';

@ApiTags('AI Gateway')
@Controller('api/v1/ai')
@UseGuards(JwtAuthGuard, AiRateLimitGuard)
@UseInterceptors(AiLoggingInterceptor)
@ApiBearerAuth()
export class AiGatewayController {
  constructor(
    private readonly aiGatewayService: AiGatewayService,
    private readonly fileValidatorService: FileValidatorService,
  ) {}

  @Post('chat')
  @ApiOperation({
    summary: 'AI Chat Assistance',
    description: 'Send a chat message and get an AI-generated response.',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat response received',
    type: ChatResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'AI service unavailable',
    type: ErrorResponseDto,
  })
  async chat(
    @Body() chatRequest: ChatRequestDto,
    @Req() req: any,
  ): Promise<ChatResponseDto> {
    return this.aiGatewayService.processRequest(
      AiFeatureType.CHAT,
      chatRequest,
      req.user.id,
      req.ip,
    );
  }

  @Post('classify')
  @ApiOperation({
    summary: 'Service Classification',
    description:
      'Classify a maintenance problem into a service category with confidence score.',
  })
  @ApiResponse({
    status: 200,
    description: 'Classification result',
    type: ClassifyServiceResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  async classify(
    @Body() classifyRequest: ClassifyServiceRequestDto,
    @Req() req: any,
  ): Promise<ClassifyServiceResponseDto> {
    return this.aiGatewayService.processRequest(
      AiFeatureType.CLASSIFICATION,
      classifyRequest,
      req.user.id,
      req.ip,
    );
  }

  @Post('analyze-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPEG, PNG, WebP, max 10MB)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Image Problem Detection',
    description:
      'Upload an image of a maintenance problem for AI-powered analysis.',
  })
  @ApiResponse({
    status: 200,
    description: 'Image analysis result',
    type: AnalyzeImageResponseDto,
  })
  @ApiResponse({
    status: 413,
    description: 'File too large',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 415,
    description: 'Unsupported file format',
    type: ErrorResponseDto,
  })
  async analyzeImage(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: any,
  ): Promise<AnalyzeImageResponseDto> {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }
    this.fileValidatorService.validateImageFile(image);

    const imageBase64 = image.buffer.toString('base64');
    const mimeType = image.mimetype;

    return this.aiGatewayService.processImageRequest(
      AiFeatureType.IMAGE_ANALYSIS,
      imageBase64,
      mimeType,
      image.originalname,
      req.user.id,
      req.ip,
    );
  }

  @Post('estimate-cost')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        category: { type: 'string' },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optional images (max 5 files)',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Cost Estimation',
    description:
      'Get estimated cost range and duration for a service based on description and category.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cost estimation result',
    type: EstimateCostResponseDto,
  })
  @ApiResponse({
    status: 422,
    description: 'Invalid category',
    type: ErrorResponseDto,
  })
  async estimateCost(
    @Body() estimateRequest: EstimateCostRequestDto,
    @UploadedFiles() images: Express.Multer.File[],
    @Req() req: any,
  ): Promise<EstimateCostResponseDto> {
    if (images && images.length > 0) {
      this.fileValidatorService.validateFileCount(images, 5);
    }
    return this.aiGatewayService.processRequest(
      AiFeatureType.COST_ESTIMATION,
      { ...estimateRequest, images: images?.map((f) => f.path) || [] },
      req.user.id,
      req.ip,
    );
  }

  @Post('recommend-providers')
  @ApiOperation({
    summary: 'Provider Recommendation',
    description:
      'Get provider recommendations based on problem description and context.',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider recommendations',
    type: RecommendProviderResponseDto,
  })
  async recommendProviders(
    @Body() recommendRequest: RecommendProviderRequestDto,
    @Req() req: any,
  ): Promise<RecommendProviderResponseDto> {
    return this.aiGatewayService.processRequest(
      AiFeatureType.PROVIDER_RECOMMENDATION,
      recommendRequest,
      req.user.id,
      req.ip,
    );
  }

  @Post('ocr')
  @UseInterceptors(
    FileInterceptor('documentImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        documentImage: {
          type: 'string',
          format: 'binary',
          description: 'Document image (JPEG, PNG, WebP, max 10MB)',
        },
        documentType: {
          type: 'string',
          enum: ['national_id', 'passport', 'professional_license'],
          description: 'Type of document',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'OCR Document Verification',
    description: 'Upload a document image for OCR-based identity verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'OCR verification result',
    type: OcrResponseDto,
  })
  async ocr(
    @Body() ocrRequest: OcrRequestDto,
    @UploadedFile() documentImage: Express.Multer.File,
    @Req() req: any,
  ): Promise<OcrResponseDto> {
    if (!documentImage) {
      throw new BadRequestException('Document image is required');
    }
    this.fileValidatorService.validateDocumentFile(documentImage);
    return this.aiGatewayService.processRequest(
      AiFeatureType.OCR,
      {
        documentType: ocrRequest.documentType,
        imagePath: documentImage.path,
      },
      req.user.id,
      req.ip,
    );
  }
}
