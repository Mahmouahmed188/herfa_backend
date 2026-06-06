import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';

@Catch(HttpException)
export class AiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AiExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse = new ErrorResponseDto();
    errorResponse.success = false;

    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        errorResponse.errorCode = 'UNAUTHORIZED';
        errorResponse.message = 'Authentication is required to access this resource.';
        break;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        errorResponse.errorCode = 'VALIDATION_ERROR';
        errorResponse.message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as any).message || 'Request validation failed.';
        break;
      case HttpStatus.TOO_MANY_REQUESTS:
        errorResponse.errorCode = 'RATE_LIMIT_EXCEEDED';
        errorResponse.message = 'Rate limit exceeded. Please try again later.';
        break;
      case HttpStatus.REQUEST_TIMEOUT:
        errorResponse.errorCode = 'AI_REQUEST_TIMEOUT';
        errorResponse.message = 'AI service did not respond in time. Please try again.';
        break;
      case HttpStatus.SERVICE_UNAVAILABLE:
        errorResponse.errorCode = 'AI_SERVICE_UNAVAILABLE';
        errorResponse.message =
          'AI service is temporarily unavailable. Please try again later.';
        break;
      default:
        errorResponse.errorCode = 'INTERNAL_ERROR';
        errorResponse.message = 'An unexpected error occurred. Please try again later.';
        break;
    }

    this.logger.warn(
      `AI Gateway error [${errorResponse.errorCode}]: ${errorResponse.message}`,
    );

    response.status(status).json(errorResponse);
  }
}
