import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.validateRequest(request);
  }

  private validateRequest(request: Request): boolean {
    console.log('进入路由守卫校验逻辑', request.headers.authorization);
    // 实现您的认证逻辑
    // 例如检查请求头中的 token
    // const token = request.headers.authorization;
    // if (!token) {
    //   return false;
    // }
    // 这里可以添加更多的验证逻辑
    return true;
  }
}
