import { Controller, ForbiddenException, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { UserRole } from '../../types/enums';
import { OperationLog } from './operation-log.entity';
import { OperationLogQuery, OperationLogService } from './operation-log.service';

@Controller('operation-logs')
@UseGuards(JwtAuthGuard)
export class OperationLogController {
  constructor(private readonly logService: OperationLogService) {}

  @Get()
  findAll(
    @CurrentUser() user: JwtUser,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<OperationLog[]> {
    if (user.role !== UserRole.Admin) {
      throw new ForbiddenException('仅管理员可查看操作日志');
    }
    const query: OperationLogQuery = {
      userId: userId ? Number(userId) : undefined,
      action,
      from,
      to,
    };
    return this.logService.findAll(query);
  }
}
