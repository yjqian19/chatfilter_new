'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Message, Topic } from '../types';
import {
  Header,
  MessageList,
  MessageInput,
  TopicSelector,
  TabSelector
} from '../components';
import { userApi, messageApi, topicApi } from '../services/api';

export default function Home() {
  const { data: session, status } = useSession();
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
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // 用户登录后，存储用户信息
  useEffect(() => {
    if (session) {
      userApi.getOrCreateUser(session)
        .catch(err => console.error('用户信息更新失败:', err));
    }
  }, [session]);

  // 加载消息和主题
  useEffect(() => {
    async function loadData() {
      if (session) {
        setIsLoading(true);
        setError(null);

        try {
          // 加载所有主题
          const topicsData = await topicApi.getTopics(session);
          setTopics(topicsData);

          // 加载所有消息
          const messagesData = await messageApi.getMessages(session);
          setMessages(messagesData);
        } catch (err) {
          console.error('数据加载失败:', err);
          setError('数据加载失败');
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadData();
  }, [session]);

  // 切换主题选择 - 使用title而不是id
  const toggleTopic = (topicTitle: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicTitle)
        ? prev.filter(title => title !== topicTitle)
        : [...prev, topicTitle]
    );
  };

  // 发送新消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !session) return;

    setIsLoading(true);
    setError(null);

    try {
      const message = await messageApi.sendMessage(
        newMessage,
        selectedTopics,
        session
      );

      setMessages(prev => [message, ...prev]);
      setNewMessage('');
    } catch (err) {
      console.error('消息发送失败:', err);
      setError('消息发送失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新主题
  const handleCreateTopic = async (title: string, color: string = '#FFFFFF'): Promise<Topic | null> => {
    if (!title.trim() || !session) return null;

    try {
      const topic = await topicApi.createTopic(title, color, session);
      setTopics(prev => [...prev, topic]);
      return topic;
    } catch (err: unknown) {
      console.error('主题创建失败:', err);
      setError('主题创建失败');
      return null;
    }
  };

  const handleClearAllTopics = () => {
    setSelectedTopics([]);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
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
            <div className="text-gray-500">数据加载中...</div>
          </div>
        ) : activeTab === 'all' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              <MessageList messages={messages} />
            </div>
            <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
              <h2 className="text-sm font-medium text-gray-700 mb-2">按主题发送</h2>
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
              <h2 className="text-sm font-medium text-gray-700 mb-2">按主题筛选</h2>
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
