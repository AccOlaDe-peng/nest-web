import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'john_doe',
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  password: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({
    description: '邮箱',
    example: 'john@example.com',
  })
  @IsString({ message: '邮箱必须是字符串' })
  email?: string;
}
