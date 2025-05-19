import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 获取或创建用户（基于Google ID）
export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // 简单的upsert操作，如果用户不存在则创建
    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name: name || `User-${id.substring(0, 6)}`, // 如果没提供名称则生成默认名称
      },
      create: {
        id,
        name: name || `User-${id.substring(0, 6)}`,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user information' });
  }
};
