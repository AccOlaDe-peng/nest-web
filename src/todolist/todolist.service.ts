import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TodoList } from './entities/todolist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TodoListService {
  constructor(
    @InjectRepository(TodoList)
    private todoListRepository: Repository<TodoList>,
  ) {}

  async findAll() {
    return this.todoListRepository.find();
  }

  async findOne(id: string): Promise<TodoList> {
    const todolist = await this.todoListRepository.findOne({ where: { id } });
    if (!todolist) {
      throw new NotFoundException(`TodoList with ID ${id} not found`);
    }
    return todolist;
  }

  async create(todolist: Partial<TodoList>): Promise<TodoList> {
    const newList = this.todoListRepository.create(todolist);
    return this.todoListRepository.save(newList);
  }

  async update(id: string, todolist: Partial<TodoList>): Promise<TodoList> {
    await this.findOne(id);
    await this.todoListRepository.update(id, todolist);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.todoListRepository.delete(id);
  }
}
