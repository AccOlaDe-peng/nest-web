import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly cache = new Map<
    string,
    { data: unknown; timestamp: number }
  >();
  private readonly TTL = 60000; // 缓存有效期 1 分钟

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.generateCacheKey(request);

    // 检查缓存是否存在且未过期
    const cachedResponse = this.cache.get(key);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < this.TTL) {
      return of(cachedResponse.data);
    }

    // 如果没有缓存或缓存已过期，处理请求并缓存响应
    return next.handle().pipe(
      tap((data) => {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
        });
      }),
    );
  }

  private generateCacheKey(request: Request): string {
    const method = request.method;
    const url = request.url;
    const query = request.query as Record<string, unknown>;
    const body = request.body as Record<string, unknown>;
    return `${method}:${url}:${JSON.stringify(query)}:${JSON.stringify(body)}`;
  }
}
