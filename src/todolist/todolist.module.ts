import { Module } from '@nestjs/common';
import { TodoListController } from './todolist.controller';
import { TodoListService } from './todolist.service';
import { TodoList } from './entities/todolist.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TodoList])],
  controllers: [TodoListController],
  providers: [TodoListService],
  exports: [TypeOrmModule, TodoListService],
})
export class TodoListModule {}
