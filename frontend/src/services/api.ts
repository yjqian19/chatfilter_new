import { Message, Topic } from '../types';
import { Session } from 'next-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// API请求辅助函数
const fetchWithAuth = async (url: string, session: Session | null, options: RequestInit = {}) => {
  if (!session?.user?.email) {
    throw new Error('未登录');
  }

  // 使用email作为用户ID（需确保在Google登录中获取到了email）
  const userId = session.user.email;

  const headers = {
    'Content-Type': 'application/json',
    'user-id': userId,
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
  // 更新或创建用户信息
  updateUserInfo: async (session: Session | null) => {
    if (!session?.user?.email) {
      throw new Error('未登录');
    }

    const googleId = session.user.email;
    const name = session.user.name || '';

    const response = await fetch(`${API_URL}/users`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: googleId,
        name
      }),
    });

    if (!response.ok) {
      throw new Error('更新用户信息失败');
    }

    return response.json();
  },
};

// 消息相关API
export const messageApi = {
  // 获取群组消息
  getGroupMessages: async (groupId: string, session: Session | null): Promise<Message[]> => {
    return fetchWithAuth(`/groups/${groupId}/messages`, session);
  },

  // 创建新消息
  createGroupMessage: async (
    groupId: string,
    content: string,
    session: Session | null,
    topicIds: string[] = []
  ): Promise<Message> => {
    return fetchWithAuth(`/groups/${groupId}/messages`, session, {
      method: 'POST',
      body: JSON.stringify({ content, topicIds }),
    });
  },
};

// 主题相关API
export const topicApi = {
  // 获取群组主题
  getGroupTopics: async (groupId: string, session: Session | null): Promise<Topic[]> => {
    return fetchWithAuth(`/groups/${groupId}/topics`, session);
  },

  // 创建新主题
  createGroupTopic: async (
    groupId: string,
    name: string,
    session: Session | null,
    color?: string
  ): Promise<Topic> => {
    return fetchWithAuth(`/groups/${groupId}/topics`, session, {
      method: 'POST',
      body: JSON.stringify({ name, color }),
    });
  },
};
