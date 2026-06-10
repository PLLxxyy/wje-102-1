import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

interface ErrorPayload {
  message?: string | string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = this.resolveMessage(exceptionResponse, exception);
    const body: ApiResponse<null> = {
      code: status,
      data: null,
      message,
    };
    response.status(status).json(body);
  }

  private resolveMessage(exceptionResponse: string | object | undefined, exception: unknown): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }
    if (this.hasMessage(exceptionResponse)) {
      const value = exceptionResponse.message;
      if (Array.isArray(value)) {
        return value.join('；');
      }
      return value || '请求处理失败';
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return '服务器内部错误';
  }

  private hasMessage(value: unknown): value is ErrorPayload {
    return typeof value === 'object' && value !== null && 'message' in value;
  }
}
