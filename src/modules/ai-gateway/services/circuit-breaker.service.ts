import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AiHealthMonitor } from '../../../entities/ai-health-monitor.entity';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly threshold: number;
  private readonly cooldown: number;

  constructor(
    @InjectRepository(AiHealthMonitor)
    private readonly healthMonitorRepo: Repository<AiHealthMonitor>,
    private readonly configService: ConfigService,
  ) {
    this.threshold =
      this.configService.get<number>('AI_CIRCUIT_BREAKER_THRESHOLD') || 5;
    this.cooldown =
      this.configService.get<number>('AI_CIRCUIT_BREAKER_COOLDOWN') || 30000;
  }

  async isOpen(serviceName: string): Promise<boolean> {
    let monitor = await this.healthMonitorRepo.findOne({
      where: { serviceName },
    });

    if (!monitor) {
      monitor = this.healthMonitorRepo.create({ serviceName });
      await this.healthMonitorRepo.save(monitor);
      return false;
    }

    if (monitor.state === 'closed') {
      return false;
    }

    if (monitor.state === 'half_open') {
      return false;
    }

    if (
      monitor.state === 'open' &&
      monitor.cooldownUntil &&
      new Date() >= monitor.cooldownUntil
    ) {
      monitor.state = 'half_open';
      monitor.cooldownUntil = null;
      await this.healthMonitorRepo.save(monitor);
      this.logger.log(
        `Circuit breaker transitioned to half_open for ${serviceName}`,
      );
      return false;
    }

    return true;
  }

  async recordSuccess(serviceName: string): Promise<void> {
    let monitor = await this.healthMonitorRepo.findOne({
      where: { serviceName },
    });

    if (!monitor) {
      monitor = this.healthMonitorRepo.create({ serviceName });
    }

    monitor.state = 'closed';
    monitor.consecutiveFailures = 0;
    monitor.lastSuccessAt = new Date();
    monitor.totalRequests += 1;
    monitor.totalSuccesses += 1;
    monitor.cooldownUntil = null;
    await this.healthMonitorRepo.save(monitor);

    this.logger.log(`Circuit breaker closed for ${serviceName}`);
  }

  async recordFailure(serviceName: string): Promise<void> {
    let monitor = await this.healthMonitorRepo.findOne({
      where: { serviceName },
    });

    if (!monitor) {
      monitor = this.healthMonitorRepo.create({ serviceName });
    }

    monitor.consecutiveFailures += 1;
    monitor.lastFailureAt = new Date();
    monitor.totalRequests += 1;
    monitor.totalFailures += 1;

    if (monitor.consecutiveFailures >= this.threshold) {
      monitor.state = 'open';
      monitor.cooldownUntil = new Date(Date.now() + this.cooldown);
      this.logger.warn(
        `Circuit breaker opened for ${serviceName} after ${monitor.consecutiveFailures} consecutive failures, cooldown until ${monitor.cooldownUntil}`,
      );
    }

    await this.healthMonitorRepo.save(monitor);
  }
}
