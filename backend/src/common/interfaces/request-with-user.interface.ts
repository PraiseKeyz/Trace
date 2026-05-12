import { Request } from 'express';
import { SafeUser } from '../constants/user-select.constant';

export interface RequestWithUser extends Request {
  user: SafeUser;
}
