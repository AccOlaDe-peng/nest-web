import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly users: CreateUserDto[] = [];

  findAll(): CreateUserDto[] {
    return this.users;
  }

  findOne(id: string): CreateUserDto | undefined {
    return this.users.find((user) => user.id === parseInt(id));
  }

  create(createUserDto: CreateUserDto): CreateUserDto {
    createUserDto.id = this.users.length + 1;
    this.users.push(createUserDto);
    return createUserDto;
  }

  update(id: string, updateUserDto: UpdateUserDto): CreateUserDto | undefined {
    const userIndex = this.users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) {
      return undefined;
    }
    const updatedUser = { ...this.users[userIndex], ...updateUserDto };
    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  remove(id: string): boolean {
    const userIndex = this.users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) {
      return false;
    }
    this.users.splice(userIndex, 1);
    return true;
  }
}
