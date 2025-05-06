import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

class TransferDto {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

class CreateUsersDto {
  users: Array<{
    username: string;
    password: string;
    email?: string;
    balance?: number;
  }>;
}

@ApiTags('事务管理')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('transfer/query-runner')
  @ApiOperation({ summary: '使用QueryRunner转账' })
  @ApiBody({ type: TransferDto })
  async transferWithQueryRunner(@Body() transferDto: TransferDto) {
    const { fromUserId, toUserId, amount } = transferDto;
    await this.transactionService.transferWithQueryRunner(
      fromUserId,
      toUserId,
      amount,
    );
    return { success: true, message: '转账成功' };
  }

  @Post('transfer/manager')
  @ApiOperation({ summary: '使用事务管理器转账' })
  @ApiBody({ type: TransferDto })
  async transferWithManager(@Body() transferDto: TransferDto) {
    const { fromUserId, toUserId, amount } = transferDto;
    await this.transactionService.transferWithTransactionManager(
      fromUserId,
      toUserId,
      amount,
    );
    return { success: true, message: '转账成功' };
  }

  @Post('users/batch')
  @ApiOperation({ summary: '批量创建用户（事务）' })
  @ApiBody({ type: CreateUsersDto })
  async createUsersInTransaction(@Body() createUsersDto: CreateUsersDto) {
    const users = await this.transactionService.createUsersInTransaction(
      createUsersDto.users,
    );
    return { success: true, message: '批量创建用户成功', data: users };
  }
}
