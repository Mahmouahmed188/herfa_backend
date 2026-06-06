import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiRequestLog } from '../../entities/ai-request-log.entity';
import { AiHealthMonitor } from '../../entities/ai-health-monitor.entity';
import { AiGatewayController } from './ai-gateway.controller';
import { AiGatewayService } from './services/ai-gateway.service';
import { AiClientService } from './services/ai-client.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { RetryService } from './services/retry.service';
import { FileValidatorService } from './services/file-validator.service';
import { AiRequestLogService } from './services/ai-request-log.service';
import { AiRateLimitGuard } from './guards/ai-rate-limit.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AiRequestLog, AiHealthMonitor])],
  controllers: [AiGatewayController],
  providers: [
    AiGatewayService,
    AiClientService,
    CircuitBreakerService,
    RetryService,
    FileValidatorService,
    AiRequestLogService,
    AiRateLimitGuard,
  ],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
