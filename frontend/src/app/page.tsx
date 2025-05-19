'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Message, Topic } from '../types';
import {
  Header,
  MessageList,
  MessageInput,
  TopicSelector,
  TabSelector
} from '../components';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

// 定义Supabase返回的数据类型
interface SupabaseMessageRow {
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

// 默认群组ID (使用先前创建的UUID)
const DEFAULT_GROUP_ID = '00000000-0000-0000-0000-000000000001';

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'filtered'>('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 重定向未登录用户到登录页
  useEffect(() => {
    if (!session) {
      router.replace('/login');
    }
  }, [session, router]);

  // 用户登录后，存储用户信息
  useEffect(() => {
    async function ensureUserInfo() {
      if (session) {
        try {
          // 使用supabaseApi中的ensureUser代替旧的userApi
          const userData = await fetch('/api/users/ensure', {
            method: 'POST',
          }).then(res => res.json());

          console.log('User info updated:', userData);
        } catch (err) {
          console.error('Failed to update user info:', err);
        }
      }
    }

    ensureUserInfo();
  }, [session]);

  // 加载消息和主题
  useEffect(() => {
    async function loadData() {
      if (session) {
        setIsLoading(true);
        setError(null);

        try {
          // 加载群组主题
          const { data: topicsData, error: topicsError } = await supabase
            .from('topics')
            .select('*')
            .eq('group_id', DEFAULT_GROUP_ID)
            .order('created_at', { ascending: true });

          if (topicsError) throw topicsError;

          setTopics((topicsData || []).map(item => ({
            id: item.id,
            name: item.name,
            color: item.color,
            groupId: item.group_id
          })));

          // 加载群组消息
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select(`
              id, content, created_at, user_id, group_id,
              users:user_id (id, name),
              message_topics (
                topics:topic_id (id, name, color, group_id)
              )
            `)
            .eq('group_id', DEFAULT_GROUP_ID)
            .order('created_at', { ascending: false })
            .limit(50);

          if (messagesError) throw messagesError;

          // 处理并转换消息数据
          const transformedMessages = (messagesData || []).map(item => {
            // 确保每个字段都存在并处理嵌套结构
            const messageData = item as unknown as SupabaseMessageRow;
            return {
              id: messageData.id,
              content: messageData.content,
              userId: messageData.user_id,
              groupId: messageData.group_id,
              createdAt: new Date(messageData.created_at),
              user: {
                id: messageData.users.id,
                name: messageData.users.name
              },
              topicLinks: (messageData.message_topics || []).map(mt => ({
                topic: {
                  id: mt.topics.id,
                  name: mt.topics.name,
                  color: mt.topics.color,
                  groupId: mt.topics.group_id
                }
              }))
            } as Message;
          });

          setMessages(transformedMessages);
        } catch (err) {
          console.error('Failed to load data:', err);
          setError('Failed to load data');
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadData();
  }, [session, supabase]);

  // 切换主题选择
  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // 发送新消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    setIsLoading(true);
    setError(null);

    try {
      const user = session.user;

      // 1. 创建消息
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          content: newMessage,
          user_id: user.id,
          group_id: DEFAULT_GROUP_ID
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // 2. 创建消息-主题关联
      if (selectedTopics.length > 0) {
        const messageTopics = selectedTopics.map(topicId => ({
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

      // 处理获取的消息数据
      const messageData = fullMessage as unknown as SupabaseMessageRow;

      const formattedMessage = {
        id: messageData.id,
        content: messageData.content,
        userId: messageData.user_id,
        groupId: messageData.group_id,
        createdAt: new Date(messageData.created_at),
        user: {
          id: messageData.users.id,
          name: messageData.users.name
        },
        topicLinks: (messageData.message_topics || []).map((mt) => ({
          topic: {
            id: mt.topics.id,
            name: mt.topics.name,
            color: mt.topics.color,
            groupId: mt.topics.group_id
          }
        }))
      };

      setMessages(prev => [formattedMessage, ...prev]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新主题
  const handleCreateTopic = async (name: string, color?: string): Promise<Topic | null> => {
    if (!name.trim() || !session) return null;

    try {
      const { data, error } = await supabase
        .from('topics')
        .insert({
          name,
          color,
          group_id: DEFAULT_GROUP_ID
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Topic already exists');
        }
        throw error;
      }

      const topic = {
        id: data.id,
        name: data.name,
        color: data.color,
        groupId: data.group_id
      };

      setTopics(prev => [...prev, topic]);
      return topic;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Topic already exists')) {
        return null; // 主题已存在
      }
      console.error('Failed to create topic:', err);
      setError('Failed to create topic');
      return null;
    }
  };

  const handleClearAllTopics = () => {
    setSelectedTopics([]);
  };

  // 用户已登出或会话验证中，显示加载
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-sm h-screen flex flex-col">
        <Header />

        {error && (
          <div className="bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Loading data...</div>
          </div>
        ) : activeTab === 'all' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              <MessageList messages={messages} />
            </div>
            <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Send by Topics</h2>
              <TopicSelector
                topics={topics}
                selectedTopics={selectedTopics}
                onToggleTopic={toggleTopic}
                onClearAll={handleClearAllTopics}
                onCreateTopic={handleCreateTopic}
              />
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Read by Topics</h2>
              <TopicSelector
                topics={topics}
                selectedTopics={selectedTopics}
                onToggleTopic={toggleTopic}
                onClearAll={handleClearAllTopics}
                onCreateTopic={handleCreateTopic}
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              <MessageList
                messages={messages}
                selectedTopics={selectedTopics}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
