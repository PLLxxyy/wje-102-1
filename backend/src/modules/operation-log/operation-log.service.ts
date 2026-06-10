import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OperationLog } from './operation-log.entity';

export interface CreateOperationLogInput {
  user_id: number | null;
  action: string;
  resource: string;
  resource_id: number | null;
  detail: string | null;
  ip: string;
}

export interface OperationLogQuery {
  userId?: number;
  action?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private readonly logRepository: Repository<OperationLog>,
  ) {}

  record(input: CreateOperationLogInput): Promise<OperationLog> {
    return this.logRepository.save(this.logRepository.create(input));
  }

  findAll(query: OperationLogQuery): Promise<OperationLog[]> {
    const builder = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.created_at', 'DESC')
      .limit(200);
    if (query.userId) {
      builder.andWhere('log.user_id = :userId', { userId: query.userId });
    }
    if (query.action) {
      builder.andWhere('log.action = :action', { action: query.action });
    }
    if (query.from) {
      builder.andWhere('log.created_at >= :from', { from: query.from });
    }
    if (query.to) {
      builder.andWhere('log.created_at <= :to', { to: query.to });
    }
    return builder.getMany();
  }
}
