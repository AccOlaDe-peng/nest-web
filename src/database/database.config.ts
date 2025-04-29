import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'my_database.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // 注意：在生产环境中应该设置为 false
};
