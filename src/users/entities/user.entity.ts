import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({
    description: '用户唯一标识符',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @Column({ length: 50, unique: true })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码', example: 'password123' })
  @Column({ length: 100 })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: '电子邮箱',
    example: 'john@example.com',
    required: false,
  })
  @Column({ length: 100, nullable: true })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ description: '用户是否激活', example: true })
  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;
}
