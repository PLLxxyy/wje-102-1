import { UserRole } from '../../types/enums';

export interface JwtUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}
