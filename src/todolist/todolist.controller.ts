import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TodoListService } from './todolist.service';
import { TodoList } from './entities/todolist.entity';

@Controller('todolist')
export class TodoListController {
  constructor(private readonly todoListService: TodoListService) {}

  @Get()
  findAll() {
    return this.todoListService.findAll();
  }

  @Post()
  create(@Body() todolist: Partial<TodoList>) {
    return this.todoListService.create(todolist);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() todolist: Partial<TodoList>) {
    return this.todoListService.update(id, todolist);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoListService.remove(id);
  }
}
