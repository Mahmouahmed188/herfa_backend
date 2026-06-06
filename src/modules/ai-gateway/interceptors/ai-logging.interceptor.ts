import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AiLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AiGateway');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || 'anonymous';
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const processingTime = Date.now() - startTime;
          this.logger.log(
            `[${userId}] ${method} ${url} - success (${processingTime}ms)`,
          );
        },
        error: (error) => {
          const processingTime = Date.now() - startTime;
          this.logger.warn(
            `[${userId}] ${method} ${url} - error: ${error.message} (${processingTime}ms)`,
          );
        },
      }),
    );
  }
}
