import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 扩展Request类型
interface AuthRequest extends Request {
  userId?: string;
}

// 获取群组的消息
export const getGroupMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const messages = await prisma.message.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        topicLinks: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // 限制返回最近的50条消息
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// 在群组中创建新消息
export const createGroupMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const { content, topicIds } = req.body;
    const userId = req.userId; // 从请求中获取用户ID

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        userId,
        groupId,
        topicLinks: {
          create: topicIds?.map((topicId: string) => ({
            topic: {
              connect: { id: topicId },
            },
          })) || [],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        topicLinks: {
          include: {
            topic: true,
          },
        },
      },
    });

    res.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
};
