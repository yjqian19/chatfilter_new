// 用户类型
export interface User {
    id: string;
    name: string;
    pronouns?: string;
    bio?: string;
  }

  // 话题类型
  export interface Topic {
    id: string;
    name: string;
    color?: string;
    groupId: string;
  }

  // 话题链接类型
  export interface TopicLink {
    topic: Topic;
  }

  // 消息类型
  export interface Message {
    id: string;
    content: string;
    userId: string;
    groupId: string;
    user: User;
    topicLinks: TopicLink[];
    createdAt: Date;
  }
