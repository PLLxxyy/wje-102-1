import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { OperationAction } from '../types/enums';
import { OperationLogService } from '../modules/operation-log/operation-log.service';

const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const sensitiveKeys = new Set(['password', 'password_hash', 'token', 'authorization']);

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly operationLogService: OperationLogService) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!writeMethods.has(request.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        void this.operationLogService.record({
          user_id: request.user?.id ?? null,
          action: this.resolveAction(request.method, request.path),
          resource: this.resolveResource(request.path),
          resource_id: this.resolveResourceId(request.params.id),
          detail: JSON.stringify({
            method: request.method,
            path: request.path,
            body: this.redactSensitive(request.body),
          }),
          ip: request.ip ?? '',
        });
      }),
    );
  }

  private resolveAction(method: string, path: string): OperationAction {
    if (path.endsWith('/auth/login')) {
      return OperationAction.Login;
    }
    if (method === 'POST') {
      return OperationAction.Create;
    }
    if (method === 'DELETE') {
      return OperationAction.Delete;
    }
    return OperationAction.Update;
  }

  private resolveResource(path: string): string {
    const segments = path.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    return segments[0] ?? 'unknown';
  }

  private resolveResourceId(value: string | undefined): number | null {
    if (!value) {
      return null;
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  }

  private redactSensitive(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.redactSensitive(item));
    }
    if (typeof value !== 'object' || value === null) {
      return value;
    }
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        sensitiveKeys.has(key.toLowerCase()) ? '[redacted]' : this.redactSensitive(entry),
      ]),
    );
  }
}
