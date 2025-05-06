import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.usersService.findByUsername(username);
      // 验证密码
      // const isPasswordValid = await bcrypt.compare(password, user.password);

      // if (isPasswordValid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result } = user;
      return result;
      // }
      return null;
    } catch {
      // 如果用户不存在，返回null
      return null;
    }
  }

  async login(username: string) {
    // 这个方法使用用户名生成JWT令牌
    const user = await this.usersService.findByUsername(username);

    const payload = { sub: user.id, username: user.username };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
