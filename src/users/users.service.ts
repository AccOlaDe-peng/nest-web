import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { EncryptionService } from '../services/encryption.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private encryptionService: EncryptionService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => ({
      ...user,
      password: user.password
        ? this.encryptionService.decrypt(user.password)
        : undefined,
    }));
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return {
      ...user,
      password: user.password
        ? this.encryptionService.decrypt(user.password)
        : undefined,
    };
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return {
      ...user,
      password: user.password
        ? this.encryptionService.decrypt(user.password)
        : undefined,
    };
  }

  async create(user: Partial<User>): Promise<User> {
    // 检查邮箱是否已存在
    if (user.email) {
      const existingUserWithEmail = await this.usersRepository.findOne({
        where: { email: user.email },
      });
      if (existingUserWithEmail) {
        throw new ConflictException('邮箱已被注册');
      }
    }

    // 检查用户名是否已存在
    if (user.username) {
      const existingUserWithUsername = await this.usersRepository.findOne({
        where: { username: user.username },
      });
      if (existingUserWithUsername) {
        throw new ConflictException('用户名已被使用');
      }
    }

    // 检查手机号是否已存在
    if (user.phone) {
      const existingUserWithPhone = await this.usersRepository.findOne({
        where: { phone: user.phone },
      });
      if (existingUserWithPhone) {
        throw new ConflictException('手机号已被注册');
      }
    }
    // 哈希
    const saltRounds = 12;
    // 确保 password 不为 undefined
    const hash = user.password
      ? await bcrypt.hash(user.password, saltRounds)
      : undefined;

    const encryptedUser: Partial<User> = {
      ...user,
      password: hash,
    };
    const newUser = this.usersRepository.create(encryptedUser);
    try {
      const savedUser = await this.usersRepository.save(newUser);
      return savedUser;
    } catch (error) {
      // MongoDB 复制键错误
      if (
        typeof error === 'object' &&
        error !== null &&
        ((error as { code?: number }).code === 11000 ||
          ((error as { message?: string }).message &&
            typeof (error as { message: string }).message === 'string' &&
            (error as { message: string }).message.includes('duplicate key')))
      ) {
        throw new ConflictException(
          '用户信息已存在，请检查用户名、邮箱或手机号是否重复',
        );
      }
      throw error;
    }
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    await this.findOne(id); // 确保用户存在
    const encryptedUser = {
      ...user,
      password: user.password
        ? this.encryptionService.encrypt(user.password)
        : undefined,
    };
    await this.usersRepository.update(id, encryptedUser);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // 确保用户存在
    await this.usersRepository.delete(id);
  }

  async login(loginDto: LoginDto): Promise<User> {
    const { account, password } = loginDto;

    // 尝试通过用户名查找用户
    let user = await this.usersRepository.findOne({
      where: { username: account },
    });

    if (!user) {
      user = await this.usersRepository.findOne({
        where: { email: account },
      });
    }
    if (!user) {
      user = await this.usersRepository.findOne({
        where: { phone: account },
      });
    }

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 验证密码
    if (!user.password) {
      throw new UnauthorizedException('账号或密码错误');
    }

    const decryptedPassword = this.encryptionService.decrypt(password);
    const isPasswordValid = await bcrypt.compare(
      decryptedPassword,
      user.password,
    );
    // 前端应该已经使用公钥加密了密码
    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    return {
      ...user,
      password: undefined, // 不返回密码
    };
  }
}
