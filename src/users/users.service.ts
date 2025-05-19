import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
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
    const encryptedUser = {
      ...user,
      password: user.password
        ? this.encryptionService.encrypt(user.password)
        : undefined,
    };
    const newUser = this.usersRepository.create(encryptedUser);
    const savedUser = await this.usersRepository.save(newUser);
    return {
      ...savedUser,
      password: savedUser.password
        ? this.encryptionService.decrypt(savedUser.password)
        : undefined,
    };
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
    const user = await this.usersRepository.findOne({
      where: { username: account },
    });

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 验证密码
    if (!user.password) {
      throw new UnauthorizedException('账号或密码错误');
    }
    const decryptedPassword = this.encryptionService.decrypt(user.password);
    if (decryptedPassword !== password) {
      throw new UnauthorizedException('账号或密码错误');
    }

    return {
      ...user,
      password: undefined, // 不返回密码
    };
  }
}
