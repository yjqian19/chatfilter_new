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

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'filtered'>('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  useEffect(() => {
    setTopics([
      { id: '1', name: 'Food', groupId: '1' },
      { id: '2', name: 'Attractions', groupId: '1' },
      { id: '3', name: 'Accommodation', groupId: '1' }
    ]);

    setMessages([
      {
        id: '1',
        content: 'This restaurant is great!',
        user: { id: '1', name: 'User1' },
        userId: '1',
        groupId: '1',
        createdAt: new Date(),
        topicLinks: [{ topic: { id: '1', name: 'Food', groupId: '1' } }]
      }
    ]);
  }, []);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSendMessage = () => {
    console.log('Sending message:', newMessage);
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
        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'all' ? (
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
              />
              <MessageInput
                value={newMessage}
                onChange={setNewMessage}
                onSubmit={handleSendMessage}
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
