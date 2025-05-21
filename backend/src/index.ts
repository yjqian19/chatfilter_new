import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// POST 方法
// 获取或创建用户（用于Google登录后）
app.post('/users', async (req, res) => {
  const { id, name } = req.body;  // id 是 Google OAuth ID，name 是可选的
  try {
    const user = await prisma.user.upsert({
      where: { id },
      update: name ? { name } : {},  // 只有当name存在时才更新
      create: { id, name }  // name在schema中已定义为可选
    });
    res.json(user);
  } catch (error) {
    console.error('用户操作失败:', error);
    res.status(500).json({ error: '用户操作失败' });
  }
});

// 发送新消息
app.post('/messages', async (req, res) => {
  const { content, userId, topicTitles, createdAt } = req.body;
  try {
    // 1. 确保用户存在
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      return res.status(400).json({ error: '用户不存在' });
    }

    // 2. 确认话题存在

    const topicPromises = topicTitles.map(async (title: string) => {
      return prisma.topic.findUnique({
        where: { title }
      });
    });
    const existingTopics = await Promise.all(topicPromises);
    // 过滤掉null
    const filteredTopics = existingTopics
      .filter((topic): topic is NonNullable<typeof topic> => topic !== null);

    // 3. 创建消息并关联话题
    const message = await prisma.message.create({
      data: {
        content,
        createdAt: createdAt ? new Date(createdAt) : new Date(),
        user: {
          connect: { id: userId }
        },
        topics: {
          connect: filteredTopics.map(topic => ({ id: topic.id }))
        }
      },
      include: {
        user: true,
        topics: true
      }
    });

    res.json(message);
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

// 创建新话题
app.post('/topics', async (req, res) => {
  const { title, color, createdAt } = req.body;
  try {
    const topic = await prisma.topic.create({
      data: {
        title,
        color: color || '#FFFFFF', // 默认白色
        createdAt: createdAt ? new Date(createdAt) : new Date()
      }
    });
    res.json(topic);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(400).json({ error: '话题已存在' });
    } else {
      console.error('创建话题失败:', error);
      res.status(500).json({ error: '创建话题失败' });
    }
  }
});

// GET 方法
// 获取所有消息
app.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      include: {
        user: true,    // 包含发送者信息
        topics: true   // 包含关联的所有话题
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: '获取消息失败' });
  }
});

// 获取所有话题
app.get('/topics', async (req, res) => {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: { messages: true }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: '获取话题失败' });
  }
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
