import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  /**
   * 使用QueryRunner手动管理事务示例
   */
  async transferWithQueryRunner(
    fromUserId: string,
    toUserId: string,
    amount: number,
  ): Promise<void> {
    // 创建查询运行器
    const queryRunner = this.dataSource.createQueryRunner();

    // 连接到数据库
    await queryRunner.connect();

    // 开始事务
    await queryRunner.startTransaction();

    try {
      // 获取用户
      const fromUser = await queryRunner.manager.findOne(User, {
        where: { id: fromUserId },
      });

      const toUser = await queryRunner.manager.findOne(User, {
        where: { id: toUserId },
      });

      if (!fromUser || !toUser) {
        throw new Error('用户不存在');
      }

      // 检查余额
      if (fromUser.balance < amount) {
        throw new Error('余额不足');
      }

      // 执行业务逻辑
      fromUser.balance -= amount;
      toUser.balance += amount;

      // 保存更改
      await queryRunner.manager.save(fromUser);
      await queryRunner.manager.save(toUser);

      // 如果一切正常，提交事务
      await queryRunner.commitTransaction();
    } catch (error) {
      // 如果出现错误，回滚事务
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 释放查询运行器资源
      await queryRunner.release();
    }
  }

  /**
   * 使用事务管理器管理事务示例
   */
  async transferWithTransactionManager(
    fromUserId: string,
    toUserId: string,
    amount: number,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      // 获取用户
      const fromUser = await manager.findOne(User, {
        where: { id: fromUserId },
      });

      const toUser = await manager.findOne(User, {
        where: { id: toUserId },
      });

      if (!fromUser || !toUser) {
        throw new Error('用户不存在');
      }

      // 检查余额
      if (fromUser.balance < amount) {
        throw new Error('余额不足');
      }

      // 执行业务逻辑
      fromUser.balance -= amount;
      toUser.balance += amount;

      // 保存更改
      await manager.save(fromUser);
      await manager.save(toUser);
    });
  }

  /**
   * 使用Repository的事务方法示例
   */
  async createUsersInTransaction(users: Partial<User>[]): Promise<User[]> {
    return this.usersRepository.manager.transaction(
      async (manager: EntityManager) => {
        const createdUsers: User[] = [];

        for (const userData of users) {
          const user = manager.create(User, userData);
          const savedUser = await manager.save(user);
          createdUsers.push(savedUser);
        }

        return createdUsers;
      },
    );
  }
}
