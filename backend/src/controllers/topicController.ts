import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// 获取群组的所有主题
export const getGroupTopics = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const topics = await prisma.topic.findMany({
      where: { groupId },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

// 在群组中创建新主题
export const createGroupTopic = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { name, color } = req.body;

    // 检查同一群组中是否已存在同名主题
    const existingTopic = await prisma.topic.findFirst({
      where: {
        groupId,
        name: {
          equals: name,
          mode: 'insensitive', // 不区分大小写
        },
      },
    });

    if (existingTopic) {
      return res.status(409).json({
        error: 'Topic already exists in this group',
        topic: existingTopic,
      });
    }

    const topic = await prisma.topic.create({
      data: {
        name,
        color,
        groupId,
      },
    });

    res.json(topic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
};
