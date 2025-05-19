import { Message } from '../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  selectedTopics?: string[];
}

export const MessageList = ({ messages, selectedTopics = [] }: MessageListProps) => {
  const filteredMessages = selectedTopics.length === 0
    ? messages
    : messages.filter(msg =>
        selectedTopics.every(selectedTopic =>
          msg.topics.some(topic => topic.id === selectedTopic)
        )
      );

  // 按时间倒序排序消息
  const sortedMessages = [...filteredMessages].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="h-[calc(100%-8rem)] overflow-y-auto p-5 mb-1 space-y-10">
      {sortedMessages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
