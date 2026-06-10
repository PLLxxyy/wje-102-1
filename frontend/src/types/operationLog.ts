import { User } from './user';

export interface OperationLog {
  id: number;
  user_id: number | null;
  user: User | null;
  action: string;
  resource: string;
  resource_id: number | null;
  detail: string | null;
  ip: string;
  created_at: string;
}
