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
import { useSession } from '@supabase/auth-helpers-react';
import { messageApi, topicApi } from '../services/supabaseApi';

// 默认群组ID (使用先前创建的UUID)
const DEFAULT_GROUP_ID = '00000000-0000-0000-0000-000000000001';

export default function Home() {
  const session = useSession();
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
          const topicsData = await topicApi.getGroupTopics(DEFAULT_GROUP_ID);
          setTopics(topicsData);

          // 加载群组消息
          const messagesData = await messageApi.getGroupMessages(DEFAULT_GROUP_ID);
          setMessages(messagesData);
        } catch (err) {
          console.error('Failed to load data:', err);
          setError('Failed to load data');
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadData();
  }, [session]);

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
      const message = await messageApi.createGroupMessage(
        DEFAULT_GROUP_ID,
        newMessage,
        session,
        selectedTopics
      );

      setMessages(prev => [message, ...prev]);
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
      const topic = await topicApi.createGroupTopic(
        DEFAULT_GROUP_ID,
        name,
        session,
        color
      );

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
                showCreateTopic={true}
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
                showCreateTopic={false}
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
