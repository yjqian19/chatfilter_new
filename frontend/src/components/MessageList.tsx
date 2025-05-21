import { Message, Topic } from '../types';
import { MessageItem } from './MessageItem';
import { useEffect, useRef } from 'react';
import { Session } from 'next-auth';

interface MessageListProps {
  messages: Message[];
  selectedTopics?: Topic[];
  session: Session;
}

export const MessageList = ({ messages, selectedTopics = [], session }: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredMessages = selectedTopics.length === 0
    ? messages
    : messages.filter(msg =>
        selectedTopics.every(selectedTopic =>
          msg.topics.some(topic => topic.id === selectedTopic.id)
        )
      );

  // 按时间倒序排序消息
  const sortedMessages = [...filteredMessages].sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [sortedMessages.length]);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100%-8rem)] overflow-y-auto p-5 mb-1 space-y-10"
    >
      {sortedMessages.map(message => (
        <MessageItem key={message.id} message={message} session={session}/>
      ))}
    </div>
  );
};
