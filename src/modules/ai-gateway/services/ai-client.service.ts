import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AiFeatureType } from '../enums/ai-feature-type.enum';

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly client: AxiosInstance;
  private readonly apiKey: string;

  private readonly endpointMap: Record<AiFeatureType, string> = {
    [AiFeatureType.CHAT]: '/api/v1/ai/chat',
    [AiFeatureType.IMAGE_ANALYSIS]: '/api/v1/ai/image_analysis',
    [AiFeatureType.CLASSIFICATION]: '/api/v1/ai/classification',
    [AiFeatureType.COST_ESTIMATION]: '/api/v1/ai/cost_estimation',
    [AiFeatureType.PROVIDER_RECOMMENDATION]:
      '/api/v1/ai/provider_recommendation',
    [AiFeatureType.OCR]: '/api/v1/ai/ocr',
  };

  constructor(private readonly configService: ConfigService) {
    const aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://localhost:8000';
    const timeout =
      this.configService.get<number>('AI_REQUEST_TIMEOUT') || 30000;
    this.apiKey = this.configService.get<string>('AI_SERVICE_API_KEY') || '';

    this.client = axios.create({
      baseURL: aiServiceUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
    });
  }

  async callAiService(featureType: AiFeatureType, payload: any): Promise<any> {
    const endpoint = this.endpointMap[featureType];
    if (!endpoint) {
      throw new HttpException(
        {
          success: false,
          errorCode: 'INVALID_FEATURE',
          message: `Unknown AI feature: ${featureType}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.debug(`Calling AI service: ${endpoint}`);
    const response = await this.client.post(endpoint, payload);
    return this.transformResponse(featureType, response.data);
  }

  async callAiServiceWithImage(
    featureType: AiFeatureType,
    imageBase64: string,
    mimeType: string,
    originalName: string,
  ): Promise<any> {
    const endpoint = this.endpointMap[featureType];
    if (!endpoint) {
      throw new HttpException(
        {
          success: false,
          errorCode: 'INVALID_FEATURE',
          message: `Unknown AI feature: ${featureType}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.debug(`Calling AI service with image: ${endpoint}`);
    const response = await this.client.post(
      endpoint,
      {
        image_base64: imageBase64,
        mime_type: mimeType,
        original_name: originalName,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        timeout: 60000,
      },
    );
    return this.transformResponse(featureType, response.data);
  }

  private transformResponse(featureType: AiFeatureType, data: any): any {
    switch (featureType) {
      case AiFeatureType.CHAT:
        return {
          reply: data.response || data.answer || data.reply || '',
          conversationId: data.conversationId || data.session_id || null,
        };

      case AiFeatureType.IMAGE_ANALYSIS:
        return {
          problemType:
            data.problemType || data.problem_type || data.category || '',
          serviceCategory:
            data.serviceCategory ||
            data.service_category ||
            data.category ||
            '',
          confidenceScore:
            data.confidenceScore ??
            data.confidence ??
            data.confidence_score ??
            0,
          recommendations:
            data.recommendations ||
            data.suggested_actions ||
            data.recommendedService
              ? [data.recommendedService]
              : [],
        };

      default:
        return data;
    }
  }
}
