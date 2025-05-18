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
        msg.topicLinks.some(link =>
          selectedTopics.includes(link.topic.id)
        )
      );

  // 按时间倒序排序消息
  const sortedMessages = [...filteredMessages].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="h-[calc(100%-8rem)] overflow-y-auto p-3">
      {sortedMessages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
