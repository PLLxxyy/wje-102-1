import { OperationLog } from '../types/operationLog';
import { request, unwrap } from '../utils/request';

export interface OperationLogQuery {
  userId?: number;
  action?: string;
  from?: string;
  to?: string;
}

export const operationLogApi = {
  list(params?: OperationLogQuery): Promise<OperationLog[]> {
    return unwrap(request.get('/operation-logs', { params }));
  },
};
