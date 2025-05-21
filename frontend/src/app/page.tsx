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

  // 全部消息 + 主题
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  // 用户选择主题
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  // 用户新消息
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'filtered'>('all');
  // 加载状态和错误状态
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

  // 切换主题选择
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

  // 生成随机颜色的函数
  const getRandomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // 创建新主题
  const handleCreateTopic = async (title: string, color: string = getRandomColor()): Promise<Topic | null> => {
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
        <div className="text-gray-500">Loading...</div>
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
            <div className="text-gray-500">loading...</div>
            {messages.length === 0 && (
              <div className="text-gray-500">The server may take up to 1 minute to restart on Render.</div>
            )}
          </div>
        ) : activeTab === 'all' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <MessageList messages={messages} session={session} />
            <div className="flex-shrink-0 p-4 bg-gray-50 border-t-2 border-gray-400">
              <h2 className="text-base font-medium text-gray-700 mb-2"><strong>Send</strong> by topic</h2>
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
            <div className="flex-shrink-0 p-4 bg-gray-50 border-b-2 border-gray-400">
              <h2 className="text-base font-medium text-gray-700 mb-2"><strong>Read</strong> by topic</h2>
              <TopicSelector
                topics={topics}
                selectedTopics={selectedTopics}
                onToggleTopic={toggleTopic}
                onClearAll={handleClearAllTopics}
                onCreateTopic={handleCreateTopic}
              />
            </div>
            <MessageList
              messages={messages}
              selectedTopics={selectedTopics}
              session={session}
            />
          </div>
        )}
      </div>
    </main>
  );
}
