import { Topic } from '@/types';

interface TopicSelectorProps {
  topics: Topic[];
  selectedTopics: string[];
  onToggleTopic: (topicId: string) => void;
  onClearAll?: () => void;
  label?: string;
}

export const TopicSelector = ({
  topics,
  selectedTopics,
  onToggleTopic,
  onClearAll,
}: TopicSelectorProps) => (
  <div className="mb-2">
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={onClearAll}
        disabled={selectedTopics.length === 0}
        className={`
          px-2 py-1 text-sm rounded-full transition-all duration-300
          ${selectedTopics.length === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-dashed border-gray-200'
            : 'bg-gray-200 hover:bg-gray-300 active:scale-95 border-2 border-gray-300 hover:rotate-12'
          }
        `}
      >
        /
      </button>
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
    </div>
  </div>
);
