import { useState } from 'react';
import { Topic } from '@/types';

interface TopicSelectorProps {
  topics: Topic[];
  selectedTopics: string[];
  onToggleTopic: (topicId: string) => void;
  onClearAll?: () => void;
  onCreateTopic?: (name: string, color?: string) => Promise<Topic | null>;
  label?: string;
  showCreateTopic?: boolean;
}

export const TopicSelector = ({
  topics,
  selectedTopics,
  onToggleTopic,
  onClearAll,
  onCreateTopic,
  showCreateTopic = true,
}: TopicSelectorProps) => {
  const [newTopicName, setNewTopicName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !onCreateTopic) return;

    setIsCreating(true);
    try {
      const topic = await onCreateTopic(newTopicName);
      if (topic) {
        setNewTopicName('');
        setIsExpanded(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setNewTopicName('');
    setIsExpanded(false);
  };

  return (
    <div className="mb-2">
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        {/* 清除键 */}
        <button
          onClick={onClearAll}
          disabled={selectedTopics.length === 0}
          className={`
            px-3 py-1 text-sm rounded-full transition-all duration-300
            ${selectedTopics.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-dashed border-gray-200'
              : 'bg-gray-200 hover:bg-gray-300 active:scale-95 border-2 border-gray-300 hover:rotate-12'
            }
          `}
        >
          /
        </button>

        {/* 显示已有主题 */}
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => onToggleTopic(topic.id)}
            className={`
              px-3 py-1 text-sm rounded-full transition-all duration-200
              ${selectedTopics.includes(topic.id)
                ? 'bg-gray-600 text-white transform hover:scale-105 active:scale-95 hover:-translate-y-0.5'
                : 'bg-gray-200 hover:bg-gray-300 active:scale-95 hover:-translate-y-0.5'
              }
              hover:shadow-sm
            `}
          >
            {topic.name}
          </button>
        ))}

        {/* 创建新主题按钮 */}
        {showCreateTopic && onCreateTopic && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="px-3 py-1 text-sm rounded-full bg-gray-200 hover:bg-gray-300 active:scale-95 transition-all duration-200"
          >
            +
          </button>
        )}

        {/* 创建新主题表单 */}
        {showCreateTopic && onCreateTopic && isExpanded && (
          <form onSubmit={handleCreateTopic} className="flex items-center gap-1">
            <input
              type="text"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="New topic name..."
              className="w-32 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <button
              type="submit"
              disabled={!newTopicName.trim() || isCreating}
              className={`
                px-2 py-1 text-xs rounded-lg transition-colors
                ${!newTopicName.trim() || isCreating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
                }
              `}
            >
              {isCreating ? '...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-2 py-1 text-xs rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
