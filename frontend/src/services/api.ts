import { Message, Topic, User } from '../types';
import { Session } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API请求辅助函数
const fetchWithAuth = async (url: string, session: Session | null, options: RequestInit = {}) => {
  if (!session?.user?.email) {
    throw new Error('未登录');
  }

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
    console.log('session', session?.user);
    if (!session?.user?.email) {
      throw new Error('未登录');
    }

    const userId = session.user.email;
    const name = session.user.name || '';

    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: userId,
        name
      }),
    });

    if (!response.ok) {
      throw new Error('用户操作失败');
    }

    return response.json();
  },
};

// 消息相关API
export const messageApi = {
  // 获取所有消息
  getMessages: async (session: Session | null): Promise<Message[]> => {
    return fetchWithAuth('/messages', session);
  },

  // 发送新消息
  sendMessage: async (
    content: string,
    topicTitles: string[],
    session: Session | null
  ): Promise<Message> => {
    if (!session?.user?.email) {
      throw new Error('未登录');
    }

    const userId = session.user.email;

    return fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        userId,
        topicTitles
      }),
    }).then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.error || '发送消息失败');
        });
      }
      return response.json();
    });
  },
};

// 话题相关API
export const topicApi = {
  // 获取所有话题
  getTopics: async (session: Session | null): Promise<Topic[]> => {
    return fetchWithAuth('/topics', session);
  },

  // 创建新话题
  createTopic: async (
    title: string,
    color: string,
    session: Session | null
  ): Promise<Topic> => {
    return fetchWithAuth('/topics', session, {
      method: 'POST',
      body: JSON.stringify({ title, color }),
    });
  },
};
