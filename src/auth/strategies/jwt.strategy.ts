import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

interface JwtPayload {
  sub: string;
  username: string;
  [key: string]: any;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret =
      configService.get<string>('config.jwt.secret') || 'fallbackSecret';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    this.logger.log(
      `JWT Strategy initialized with secret: ${secret.substring(0, 3)}...`,
    );
  }

  async validate(payload: JwtPayload) {
    try {
      // 验证用户是否存在
      this.logger.log(`尝试查找用户ID: ${payload.sub}`);
      const user = await this.usersService.findOne(payload.sub);
      this.logger.log(
        `用户查找成功: ${user.username}, 激活状态: ${user.isActive}`,
      );

      // 检查用户是否激活
      if (!user.isActive) {
        this.logger.error(`用户账号未激活: ${user.username}`);
        throw new UnauthorizedException('用户账号未激活或已被禁用');
      }

      // 返回用户信息，这些信息将被添加到请求对象中
      return {
        userId: payload.sub,
        username: payload.username,
        email: user.email,
        isActive: user.isActive,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`JWT验证失败: ${errorMessage}`, errorStack);

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token验证失败');
    }
  }
}
