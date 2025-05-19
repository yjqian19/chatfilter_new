import { supabase } from '../lib/supabase';
import { Message, Topic, User } from '../types';
import { Session } from '@supabase/supabase-js';

// 定义Supabase数据结构的接口
interface SupabaseMessage {
  id: string;
  content: string;
  user_id: string;
  group_id: string;
  created_at: string;
  users: { id: string; name: string };
  message_topics?: Array<{
    topics: {
      id: string;
      name: string;
      color?: string;
      group_id: string;
    }
  }>;
}

// 确保用户已存储到数据库
export const ensureUser = async (session: Session | null) => {
  if (!session?.user) {
    throw new Error('未登录');
  }

  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: session.user.id,
      name: session.user.user_metadata?.full_name ||
            session.user.email?.split('@')[0] ||
            '未命名用户',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// 消息相关API
export const messageApi = {
  // 获取群组消息
  getGroupMessages: async (groupId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, content, created_at, user_id, group_id,
        users:user_id (id, name),
        message_topics (
          topics:topic_id (id, name, color, group_id)
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // 转换为前端期望的格式
    return ((data || []) as unknown as SupabaseMessage[]).map(item => ({
      id: item.id,
      content: item.content,
      userId: item.user_id,
      groupId: item.group_id,
      createdAt: new Date(item.created_at),
      user: {
        id: item.users.id,
        name: item.users.name
      } as User,
      topicLinks: (item.message_topics || []).map((mt) => ({
        topic: {
          id: mt.topics.id,
          name: mt.topics.name,
          color: mt.topics.color,
          groupId: mt.topics.group_id
        } as Topic
      }))
    }));
  },

  // 创建新消息
  createGroupMessage: async (
    groupId: string,
    content: string,
    session: Session | null,
    topicIds: string[] = []
  ): Promise<Message> => {
    if (!session?.user) {
      throw new Error('未登录');
    }

    // 确保用户已存在
    await ensureUser(session);

    // 1. 创建消息
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        content,
        user_id: session.user.id,
        group_id: groupId
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // 2. 创建消息-主题关联
    if (topicIds.length > 0) {
      const messageTopics = topicIds.map(topicId => ({
        message_id: message.id,
        topic_id: topicId
      }));

      const { error: linkError } = await supabase
        .from('message_topics')
        .insert(messageTopics);

      if (linkError) throw linkError;
    }

    // 3. 获取完整的消息数据
    const { data: fullMessage, error: fullMessageError } = await supabase
      .from('messages')
      .select(`
        id, content, created_at, user_id, group_id,
        users:user_id (id, name),
        message_topics (
          topics:topic_id (id, name, color, group_id)
        )
      `)
      .eq('id', message.id)
      .single();

    if (fullMessageError) throw fullMessageError;

    const typedMessage = fullMessage as unknown as SupabaseMessage;

    return {
      id: typedMessage.id,
      content: typedMessage.content,
      userId: typedMessage.user_id,
      groupId: typedMessage.group_id,
      createdAt: new Date(typedMessage.created_at),
      user: {
        id: typedMessage.users.id,
        name: typedMessage.users.name
      } as User,
      topicLinks: (typedMessage.message_topics || []).map((mt) => ({
        topic: {
          id: mt.topics.id,
          name: mt.topics.name,
          color: mt.topics.color,
          groupId: mt.topics.group_id
        } as Topic
      }))
    };
  },
};

// 主题相关API
export const topicApi = {
  // 获取群组主题
  getGroupTopics: async (groupId: string): Promise<Topic[]> => {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      color: item.color,
      groupId: item.group_id
    }));
  },

  // 创建新主题
  createGroupTopic: async (
    groupId: string,
    name: string,
    session: Session | null,
    color?: string
  ): Promise<Topic> => {
    if (!session?.user) {
      throw new Error('未登录');
    }

    // 确保用户已存在
    await ensureUser(session);

    try {
      const { data, error } = await supabase
        .from('topics')
        .insert({
          name,
          color,
          group_id: groupId
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        color: data.color,
        groupId: data.group_id
      };
    } catch (error: unknown) {
      // 检查是否是唯一约束错误
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
        throw new Error('主题已存在');
      }
      throw error;
    }
  },
};

// 群组相关API
export const groupApi = {
  // 获取默认群组并确保存在
  ensureDefaultGroup: async (session: Session | null): Promise<string> => {
    if (!session?.user) {
      throw new Error('未登录');
    }

    const DEFAULT_GROUP_ID = '00000000-0000-0000-0000-000000000001';

    // 先检查默认群组是否存在
    const { data: existingGroup } = await supabase
      .from('chat_groups')
      .select('id')
      .eq('id', DEFAULT_GROUP_ID)
      .maybeSingle();

    if (existingGroup) {
      return existingGroup.id;
    }

    // 如果不存在，创建默认群组
    const { data: user } = await ensureUser(session);

    const { data: group, error } = await supabase
      .from('chat_groups')
      .insert({
        id: DEFAULT_GROUP_ID,
        name: '默认群组',
        owner_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return group.id;
  }
};
