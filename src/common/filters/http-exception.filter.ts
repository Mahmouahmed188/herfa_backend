import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { QueryFailedError } from 'typeorm';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;
      error = (exceptionResponse as any).error || exception.name;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma unique constraint violations, etc.
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        message = `Unique constraint failed on ${target}`;
        error = 'Conflict';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = 'Database request error';
        error = 'Bad Request';
      }
      this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database error occurred';
      error = 'Bad Request';
      this.logger.error(`Database error: ${exception.message}`, exception.stack);
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}