import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiFeatureType } from '../enums/ai-feature-type.enum';
import { AiRequestStatus } from '../enums/ai-request-status.enum';
import { CircuitBreakerService } from './circuit-breaker.service';
import { RetryService } from './retry.service';
import { AiRequestLogService } from './ai-request-log.service';
import { FileValidatorService } from './file-validator.service';

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly timeout: number;
  private readonly serviceName = 'ai-service';

  constructor(
    private readonly circuitBreakerService: CircuitBreakerService,
    private readonly retryService: RetryService,
    private readonly aiRequestLogService: AiRequestLogService,
    private readonly fileValidatorService: FileValidatorService,
    private readonly configService: ConfigService,
  ) {
    this.timeout = this.configService.get<number>('AI_REQUEST_TIMEOUT') || 30000;
  }

  async processRequest(
    featureType: AiFeatureType,
    payload: any,
    userId: string,
    ipAddress?: string,
    files?: Express.Multer.File[],
  ): Promise<any> {
    const logEntry = await this.aiRequestLogService.createLog({
      userId,
      featureType,
      requestPayload: payload,
      status: AiRequestStatus.PENDING,
      ipAddress: ipAddress || null,
    });

    try {
      const isCircuitOpen = await this.circuitBreakerService.isOpen(
        this.serviceName,
      );

      if (isCircuitOpen) {
        await this.aiRequestLogService.updateLog(logEntry.id, {
          status: AiRequestStatus.CIRCUIT_OPEN,
          errorMessage: 'Circuit breaker is open. AI service temporarily blocked.',
        });

        throw new HttpException(
          {
            success: false,
            errorCode: 'AI_SERVICE_UNAVAILABLE',
            message:
              'AI service is temporarily unavailable due to repeated failures. Please try again later.',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      if (files && files.length > 0) {
        this.fileValidatorService.validateFileCount(files, 5);
      }

      const startTime = Date.now();

      const result = await this.executeWithTimeout(
        featureType,
        payload,
      );

      const processingTime = Date.now() - startTime;

      await this.circuitBreakerService.recordSuccess(this.serviceName);

      await this.aiRequestLogService.updateLog(logEntry.id, {
        status: AiRequestStatus.SUCCESS,
        responsePayload: result,
        processingTime,
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - (logEntry.createdAt
        ? logEntry.createdAt.getTime()
        : Date.now() - this.timeout);

      const isTimeout =
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.REQUEST_TIMEOUT;
      const isCircuitError =
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.SERVICE_UNAVAILABLE;

      if (!isCircuitError) {
        await this.circuitBreakerService.recordFailure(this.serviceName);
      }

      await this.aiRequestLogService.updateLog(logEntry.id, {
        status: isTimeout
          ? AiRequestStatus.TIMEOUT
          : AiRequestStatus.FAILED,
        errorMessage: error.message || 'AI service request failed',
        processingTime,
      });

      throw error;
    }
  }

  async processImageRequest(
    featureType: AiFeatureType,
    imageBase64: string,
    mimeType: string,
    originalName: string,
    userId: string,
    ipAddress?: string,
  ): Promise<any> {
    const payload = {
      imageBase64: imageBase64.substring(0, 100) + '...[truncated]',
      mimeType,
      originalName,
    };

    const logEntry = await this.aiRequestLogService.createLog({
      userId,
      featureType,
      requestPayload: payload,
      status: AiRequestStatus.PENDING,
      ipAddress: ipAddress || null,
    });

    try {
      const isCircuitOpen = await this.circuitBreakerService.isOpen(
        this.serviceName,
      );

      if (isCircuitOpen) {
        await this.aiRequestLogService.updateLog(logEntry.id, {
          status: AiRequestStatus.CIRCUIT_OPEN,
          errorMessage: 'Circuit breaker is open. AI service temporarily blocked.',
        });

        throw new HttpException(
          {
            success: false,
            errorCode: 'AI_SERVICE_UNAVAILABLE',
            message:
              'AI service is temporarily unavailable due to repeated failures. Please try again later.',
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const startTime = Date.now();

      const result = await this.executeImageWithTimeout(
        featureType,
        imageBase64,
        mimeType,
        originalName,
      );

      const processingTime = Date.now() - startTime;

      await this.circuitBreakerService.recordSuccess(this.serviceName);

      await this.aiRequestLogService.updateLog(logEntry.id, {
        status: AiRequestStatus.SUCCESS,
        responsePayload: result,
        processingTime,
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - (logEntry.createdAt
        ? logEntry.createdAt.getTime()
        : Date.now() - this.timeout);

      const isTimeout =
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.REQUEST_TIMEOUT;
      const isCircuitError =
        error instanceof HttpException &&
        error.getStatus() === HttpStatus.SERVICE_UNAVAILABLE;

      if (!isCircuitError) {
        await this.circuitBreakerService.recordFailure(this.serviceName);
      }

      await this.aiRequestLogService.updateLog(logEntry.id, {
        status: isTimeout
          ? AiRequestStatus.TIMEOUT
          : AiRequestStatus.FAILED,
        errorMessage: error.message || 'AI service request failed',
        processingTime,
      });

      throw error;
    }
  }

  private async executeWithTimeout(
    featureType: AiFeatureType,
    payload: any,
  ): Promise<any> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new HttpException(
            {
              success: false,
              errorCode: 'AI_REQUEST_TIMEOUT',
              message:
                'AI service did not respond in time. Please try again.',
            },
            HttpStatus.REQUEST_TIMEOUT,
          ),
        );
      }, this.timeout);
    });

    const resultPromise = this.retryService.executeWithRetry(
      featureType,
      payload,
    );

    return Promise.race([resultPromise, timeoutPromise]);
  }

  private async executeImageWithTimeout(
    featureType: AiFeatureType,
    imageBase64: string,
    mimeType: string,
    originalName: string,
  ): Promise<any> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new HttpException(
            {
              success: false,
              errorCode: 'AI_REQUEST_TIMEOUT',
              message:
                'AI service did not respond in time. Please try again.',
            },
            HttpStatus.REQUEST_TIMEOUT,
          ),
        );
      }, this.timeout);
    });

    const resultPromise = this.retryService.executeWithRetryImage(
      featureType,
      imageBase64,
      mimeType,
      originalName,
    );

    return Promise.race([resultPromise, timeoutPromise]);
  }
}
