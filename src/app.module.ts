import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './database/database.config';

@Module({
  imports: [TypeOrmModule.forRoot(databaseConfig), UsersModule],
})
export class AppModule {}
