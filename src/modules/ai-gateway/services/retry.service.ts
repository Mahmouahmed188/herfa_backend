import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiClientService } from './ai-client.service';
import { AiFeatureType } from '../enums/ai-feature-type.enum';

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly maxRetries: number;
  private readonly baseDelay: number;

  constructor(
    private readonly aiClientService: AiClientService,
    private readonly configService: ConfigService,
  ) {
    this.maxRetries = this.configService.get<number>('AI_RETRY_MAX') || 3;
    this.baseDelay = this.configService.get<number>('AI_RETRY_BASE_DELAY') || 100;
  }

  async executeWithRetry(
    featureType: AiFeatureType,
    payload: any,
  ): Promise<any> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.aiClientService.callAiService(
          featureType,
          payload,
        );
        return result;
      } catch (error) {
        lastError = error;

        if (attempt < this.maxRetries && this.isRetryable(error)) {
          const delay = this.baseDelay * Math.pow(2, attempt);
          this.logger.warn(
            `Retry attempt ${attempt + 1}/${this.maxRetries} for ${featureType} after ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  private isRetryable(error: any): boolean {
    if (error.response) {
      const status = error.response.status;
      return status >= 500 || status === 429;
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      return true;
    }

    return false;
  }
}
