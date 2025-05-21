import { Message, Topic, User } from '../types';
import { Session } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API请求辅助函数
const fetchData = async (url: string, session: Session | null, options: RequestInit = {}) => {

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `请求失败: ${response.status}`);
  }

  return response.json();
};

// 用户相关API
export const userApi = {
  // 获取或创建用户信息
  getOrCreateUser: async (session: Session | null): Promise<User> => {
    return fetchData('/users', session, {
      method: 'POST',
      body: JSON.stringify({
        id: session?.user?.email,
        name: session?.user?.name
      }),
    });
  },
};

// 消息相关API
export const messageApi = {
  // 获取所有消息
  getMessages: async (session: Session | null): Promise<Message[]> => {
    return fetchData('/messages', session);
  },

  // 发送新消息
  sendMessage: async (
    content: string,
    topicTitles: string[],
    session: Session | null
  ): Promise<Message> => {

    const userId = session?.user?.email;
    if (!userId) {
      throw new Error('未登录');
    }

    return fetchData('/messages', session, {
      method: 'POST',
      body: JSON.stringify({
        content,
        userId,
        topicTitles
      }),
    });
  },
};

// 话题相关API
export const topicApi = {
  // 获取所有话题
  getTopics: async (session: Session | null): Promise<Topic[]> => {
    return fetchData('/topics', session);
  },

  // 创建新话题
  createTopic: async (
    title: string,
    color: string,
    session: Session | null
  ): Promise<Topic> => {
    return fetchData('/topics', session, {
      method: 'POST',
      body: JSON.stringify({ title, color }),
    });
  },
};
