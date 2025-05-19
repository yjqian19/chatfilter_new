import { Request as ExpressRequest, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// 扩展Request类型以包含用户ID
interface Request extends ExpressRequest {
  userId?: string;
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['user-id'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // 将用户ID添加到请求对象
  req.userId = userId;
  next();
};
