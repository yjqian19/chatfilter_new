import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 获取所有消息
app.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      include: { topic: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: '获取消息失败' });
  }
});

// 发送新消息
app.post('/messages', async (req, res) => {
  const { content, userName, topicId } = req.body;
  try {
    const message = await prisma.message.create({
      data: {
        content,
        userName,
        topicId: parseInt(topicId)
      },
      include: { topic: true }
    });
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: '发送消息失败' });
  }
});

// 获取所有话题
app.get('/topics', async (req, res) => {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: '获取话题失败' });
  }
});

// 创建新话题
app.post('/topics', async (req, res) => {
  const { title } = req.body;
  try {
    const topic = await prisma.topic.create({
      data: { title }
    });
    res.json(topic);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: '话题已存在' });
    } else {
      res.status(500).json({ error: '创建话题失败' });
    }
  }
});

app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});
