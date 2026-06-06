import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { AiFeatureType } from '../enums/ai-feature-type.enum';

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    const aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
    const timeout = this.configService.get<number>('AI_REQUEST_TIMEOUT') || 30000;

    this.client = axios.create({
      baseURL: aiServiceUrl,
      timeout,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async callAiService(
    featureType: AiFeatureType,
    payload: any,
  ): Promise<any> {
    const endpoint = `/ai/${featureType}`;
    const response = await this.client.post(endpoint, payload);
    return response.data;
  }
}
