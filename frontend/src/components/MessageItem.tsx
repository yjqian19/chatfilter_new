import { Message } from '@/types';
import { Session } from 'next-auth';

interface MessageItemProps {
  message: Message;
  session: Session;
}

export const MessageItem = ({ message, session}: MessageItemProps) => {

  const currentUserId = session?.user?.email;
  const isMyMessage = message.userId === currentUserId;

  return (
    <div className={`flex flex-col mb-4 ${isMyMessage ? 'items-end' : ''}`}>
      {/* 头部 */}
      <div className="flex gap-2 text-sm text-gray-600 mb-1 items-baseline">
        <strong className="text-xs text-gray-500">{message.user.name}</strong>
        <time className="text-xs text-gray-400">
          {new Date(message.createdAt).toLocaleString()}
        </time>
      </div>

      {/* 气泡 */}
      <div className={`max-w-[80%] rounded-lg p-3 ${
        isMyMessage ? 'bg-gray-300' : 'bg-white'
      } border border-gray-200`}>

        {/* 主题标签 */}
        {message.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {message.topics.map(topic => (
              <span
                key={topic.id}
                className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600"
              >
                {topic.title}
              </span>
            ))}
          </div>
        )}
        {/* 消息内容 */}
        <div className="text-sm text-gray-800">{message.content}</div>
      </div>
    </div>
  );
};
