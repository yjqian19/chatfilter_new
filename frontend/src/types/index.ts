// 用户类型
export interface User {
  id: string;
  name?: string;
}

// 话题类型
export interface Topic {
  id: string;
  title: string;
  color: string;
  createdAt: string;
  _count?: {
    messages: number;
  };
  messages?: Message[];
}

// 消息类型
export interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  user: User;
  topics: Topic[];
}
