import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { FileLoggerService } from '../services/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: FileLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const body = request.body as Record<string, unknown>;
    const query = request.query as Record<string, unknown>;
    const params = request.params as Record<string, unknown>;
    const startTime = Date.now();

    this.logger.log(
      `请求开始: ${method} ${url} - 参数: ${JSON.stringify({
        body,
        query,
        params,
      })}`,
    );

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const endTime = Date.now();
          this.logger.log(
            `请求结束: ${method} ${url} - 耗时: ${
              endTime - startTime
            }ms - 响应: ${JSON.stringify(data)}`,
          );
        },
        error: (error: Error) => {
          const endTime = Date.now();
          this.logger.error(
            `请求错误: ${method} ${url} - 耗时: ${
              endTime - startTime
            }ms - 错误: ${error.message}`,
          );
        },
      }),
    );
  }
}
