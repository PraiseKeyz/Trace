import { Request } from 'express';
import { SafeUser } from '@/common/constants/user-select.constant';

export interface RequestWithUser extends Request {
  user: SafeUser;
}
