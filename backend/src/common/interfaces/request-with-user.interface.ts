import { Request } from 'express';
import { JwtUser } from './jwt-user.interface';

export type RequestWithUser = Request<
  Record<string, string>,
  unknown,
  unknown,
  Record<string, string | undefined>
> & {
  user?: JwtUser;
};
