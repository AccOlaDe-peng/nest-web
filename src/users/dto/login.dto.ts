import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '账号（用户名/手机号/邮箱）',
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  account: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
